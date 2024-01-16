import commandLineArgs from "command-line-args";
import consola from "consola";
import fs from "fs-extra";
import { isNil, omitBy } from "lodash";
import { parseCSV } from "./utils/csv";
import { request, searchOne } from "./utils/http";

const ARGS = commandLineArgs([
  {
    name: "csv",
    type: String,
  },
]);

// This script assumes all parts have been already imported (except in-house parts/products)
// and that parts are matched and assigned in BOM entries through their "Internal PN"

//NOTE: you may edit these values to match your CSV file headers
const CSV_HEADERS = {
  mpn: "Product ID",
  revCode: "Product Revision",
  description: "Product Description",
  manufacturer: "Manufacturer",
  label: "Label",
  bomEntryInternalPN: "Internal Part ID",
  bomEntryQty: "Part Quantity",
};

async function main() {
  if (!ARGS.csv || !(await fs.pathExists(ARGS.csv))) {
    consola.error(`Missing CSV file (use --csv <filepath>)`);
    process.exit(1);
  }

  // Parse CSV file
  const rows = await parseCSV(ARGS.csv, {
    headers: headers =>
      headers.map(
        (txt, i) =>
          Object.keys(CSV_HEADERS).find(k => CSV_HEADERS[k] === txt) || i
      ),
    ignoreEmpty: true,
  });
  consola.info(`Parsed ${rows.length} rows. Importing BOMs...`);

  // In-memory index of all parts (key = Internal PN)
  const partDocs = await request("GET", "/parts");
  const partsByIpn = partDocs.reduce((acc, partDoc) => {
    const ipn = (partDoc.part.ipn || "").trim();
    if (ipn) {
      acc[ipn] = partDoc.part;
    }
    return acc;
  }, {});

  // In-memory index of all labels (key = fullName "eg. Diode - Zener")
  const labels = await request("GET", "/labels");
  const labelsByFullname = labels.reduce((acc, label) => {
    const fullName = label.fullName.trim();
    acc[fullName] = label;
    return acc;
  }, {});

  const cachedInHouseParts = {};
  const cachedProducts = {};
  const cachedRevs = {};
  const isBOMEmpty = {};

  for (let row of rows) {
    const {
      mpn,
      description,
      manufacturer,
      label: labelFullname = "",
      revCode,
      bomEntryInternalPN,
      bomEntryQty,
    } = row;

    // Ensure in-house part exists
    let inHousePartDoc =
      cachedInHouseParts[mpn] ||
      (await searchOne({
        type: "part",
        "part.type": "in_house",
        "part.mpn": mpn,
      }));

    if (!inHousePartDoc) {
      let labelId;
      if (labelFullname) {
        // Find label ID
        labelId = labelsByFullname[labelFullname]?.id;
        if (!labelId) {
          consola.warn(`Label ${labelFullname} not found`);
        }
      }

      inHousePartDoc = await request("POST", "/parts", {
        data: {
          part: omitBy(
            {
              type: "in_house",
              mpn,
              ipn: mpn,
              manufacturer,
              description,
              label: labelId,
            },
            isNil
          ),
        },
      });
      cachedInHouseParts[mpn] = inHousePartDoc;
    }

    // Ensure product exists
    let productDoc =
      cachedProducts[mpn] ||
      (await searchOne({
        type: "project",
        "project.part": inHousePartDoc.id,
      }));
    if (!productDoc) {
      productDoc = await request("POST", "/projects", {
        data: {
          project: { part: inHousePartDoc.id },
        },
      });
      cachedProducts[mpn] = productDoc;

      // remove revision created by default ("A")
      const revDocs = await request("GET", `/projects/${productDoc.id}/revs`);
      for (let revDoc of revDocs) {
        await request("DELETE", `/projects/${productDoc.id}/revs/${revDoc.id}`);
      }
    }

    const bomKey = `${mpn} ${revCode}`;

    // Ensure product revision exists
    let revDoc = await searchOne({
      type: "project_rev",
      "project_rev.revCode": revCode.trim(),
      "belongs_to.project": productDoc.id,
    });
    if (!revDoc) {
      revDoc =
        cachedRevs[bomKey] ||
        (await request("POST", `/projects/${productDoc.id}/revs`, {
          data: {
            project_rev: {
              revCode,
              part: inHousePartDoc.id,
            },
          },
        }));
      cachedRevs[bomKey];
    }

    // // Make sure BOM is empty (runs only once)
    if (!isBOMEmpty[bomKey]) {
      consola.info(`${bomKey}`);
      const bomEntryDocs = await request(
        "GET",
        `/projects/${productDoc.id}/revs/${revDoc.id}/bom`
      );
      for (let bomEntryDoc of bomEntryDocs) {
        await request(
          "DELETE",
          `/projects/${productDoc.id}/revs/${revDoc.id}/bom/${bomEntryDoc.id}`
        );
      }
      isBOMEmpty[bomKey] = true;
    }

    // Create BOM Entry
    const part = partsByIpn[bomEntryInternalPN];
    if (!part) {
      consola.warn(`Can't find part ${bomEntryInternalPN} (skipping BOM row)`);
      continue;
    }
    await request("POST", `/projects/${productDoc.id}/revs/${revDoc.id}/bom`, {
      data: {
        bom_entry: {
          part: part.id,
          qty: bomEntryQty,
          designators: [],
        },
      },
    });
  }
}

main();
