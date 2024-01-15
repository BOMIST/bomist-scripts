import consola from "consola";
import { parse } from "fast-csv";
import fs from "fs-extra";

export async function parseCSV(filePath, opts: any = {}): Promise<any[]> {
  const csvFile = await fs.readFile(filePath, { encoding: "utf8" });

  const rows: any[] = [];

  return new Promise((resolve, reject) => {
    const stream = parse({ headers: opts?.headers })
      .on("error", error => {
        consola.error("CSV error:", error);
        return reject(error);
      })
      .on("data", row => {
        rows.push(row);
      })
      .on("end", (rowCount: number) => {
        return resolve(rows);
      });

    stream.write(csvFile);
    stream.end();
  });
}
