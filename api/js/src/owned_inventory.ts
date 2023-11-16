import commandLineArgs from "command-line-args";
import consola from "consola";
import { writeToPath } from "fast-csv";
import { arrayToMap } from "./utils";
import { request } from "./utils/http";

const args = commandLineArgs([
  {
    name: "csv",
    type: String,
  },
  { name: "ownerId", type: String },
  { name: "ownerName", type: String },
]);

//NOTE: References to "storage.restrictions.customer" and "customer"
// will be deprecated in v2.10.
// "storage.owner" and "contact" will be used instead

async function findOwnerById(ownerId: string) {
  try {
    return await request("GET", `/contacts/${ownerId}`);
  } catch (err) {
    consola.error("Failed to find owner", ownerId);
    process.exit(0);
  }
}

async function findOwnerByName(name: string) {
  try {
    const owners = await request("POST", "/search", {
      data: {
        selector: {
          type: "customer",
          "customer.name": name,
        },
      },
    });

    if (owners.length > 1) {
      consola.warn("More than one owner found:", owners);
    } else if (owners.length === 0) {
      consola.error("Failed to find owner", name);
      process.exit(0);
    }
    return owners[0];
  } catch (err) {
    consola.error("Failed to find owner", name);
    process.exit(0);
  }
}

async function main() {
  let owner;
  if (args.ownerId) {
    owner = await findOwnerById(args.ownerId);
  } else if (args.ownerName) {
    owner = await findOwnerByName(args.ownerName);
  }

  let allStorage = await request("GET", "/storage");

  // Pick storage that belongs to owner, if defined (through --ownerId or --ownerName)
  // or all storage that has an owner
  let ownedStorage = allStorage.filter(d =>
    !!owner
      ? d.storage.restrictions?.customer === owner.customer.id
      : !!d.storage?.restrictions?.customer
  );
  let ownedStorageIds = [...new Set(ownedStorage.map(d => d.storage.id))];
  const storageMap = arrayToMap(ownedStorage, d => d.storage.id);

  let ownerIds = !!owner
    ? [owner.customer.id]
    : [...new Set(ownedStorage.map(d => d.storage.owner).filter(Boolean))];

  // Fetch owners themselves (if needed)
  const owners = !!owner
    ? [owner]
    : await request("POST", "/search", {
        data: {
          selector: {
            type: "customer",
            "customer.id": {
              $in: ownerIds,
            },
          },
        },
      });
  const ownersMap = arrayToMap(owners, d => d.customer.id);

  // Search all inventory stored in a storage location that
  // belongs to owner(s)
  const ownedInventory = await request("POST", "/search", {
    data: {
      selector: {
        type: "inventory",
        "inventory.status": "on_hand",
        "inventory.storage": {
          $in: ownedStorageIds,
        },
      },
    },
  });

  // Get part IDs from iventory
  const ownedPartIds = [
    ...new Set(ownedInventory.map(d => d.belongs_to["part"])),
  ];

  // Fetch the parts themselves
  const parts = await request("POST", "/search", {
    data: {
      selector: {
        type: "part",
        "part.id": {
          $in: ownedPartIds,
        },
      },
    },
  });
  const partsMap = arrayToMap(parts, d => d.part.id);

  // Build the result
  const result = ownedInventory.map(d => {
    const part = partsMap[d.belongs_to.part]?.[0]?.part;
    const storage = storageMap[d.inventory.storage][0]?.storage;
    const owner = ownersMap[storage.owner]?.[0]?.customer;
    return {
      Part: `${part.mpn} ${part.manufacturer}`,
      Qty: d.inventory?.qty,
      Owner: owner?.name,
      Storage: storage?.fullName,
    };
  });

  if (!args.csv) {
    // Print to console
    console.table(result);
    const total = result.reduce((acc, d) => {
      acc += d.Qty;
      return acc;
    }, 0);
    console.log("Total Qty: ", total);
  } else {
    // Write to CSV file
    writeToPath(args.csv, result, { headers: true, delimiter: "\t" })
      .on("error", consola.error)
      .on("finish", () => {
        consola.info("Result written to: ", args.csv);
      });
  }
}

main();
