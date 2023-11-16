import commandLineArgs from "command-line-args";
import { request } from "./utils/http";

const args = commandLineArgs([
  { name: "qties", type: String },
  { name: "qtiesOnly", type: Boolean },
]);

type BarcodeData = {
  title: string;
  subtitle?: string;
  op: string;
};

async function main() {
  const actionOps: BarcodeData[] = [
    { title: "Add Stock", op: "addinv" },
    { title: "Remove Stock", op: "reminv" },
    { title: "Move Stock", op: "movinv" },
    { title: "Move Storage", op: "movsto" },
  ].map(data => {
    data.op = `$Bacta_${data.op}`;
    return data;
  });

  const ctrlOps: BarcodeData[] = [
    {
      title: "Confirm",
      op: "ok",
    },
    { title: "Cancel", op: "ko" },
    {
      title: "Previous",
      op: "prev",
    },
    {
      title: "Next",
      op: "next",
    },
  ].map(data => {
    data.op = `$Bactc_${data.op}`;
    return data;
  });

  const qties = args.qties
    ? args.qties.split(",").map(n => parseInt(n))
    : [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const qtyOps: BarcodeData[] = [
    {
      title: "Add",
      op: "inc",
    },
    { title: "Subtract", op: "dec" },
  ]
    .map(data => {
      return qties.map(qty => {
        const _data: BarcodeData = {
          title: `QTY ${data.title}`,
          subtitle: `${qty}`,
          op: `$Bactqty_${data.op}${qty}`,
        };
        return _data;
      });
    })
    .flat();

  let barcodeData = [...actionOps, ...ctrlOps, ...qtyOps];
  if (args.qtiesOnly) {
    barcodeData = qtyOps;
  }

  console.log(barcodeData);
  console.log("total", barcodeData.length);

  console.log("sending to printer...");

  await request("POST", "/barcodes/export", {
    data: {
      action: "send_to_printer",
      format: "qrcode",
      labelType: "barcode_action",
      data: barcodeData.map(d => {
        return {
          title: d.title,
          subtitle: d.subtitle,
          barcode: d.op,
        };
      }),
    },
  });

  console.log("done");
}

main();
