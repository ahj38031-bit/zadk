import { readFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? "exports/database-data.json";
const payload = JSON.parse(await readFile(inputPath, "utf8"));
const tables = ["users", "profiles", "meals", "frequentMeals", "weightLogs"];
const quoteId = value => `"${String(value).replaceAll('"', '""')}"`;
const quoteValue = value => {
  if (value === null || value === undefined || value === "NULL") return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
};

console.log("BEGIN;");
for (const table of tables) {
  for (const row of payload.tables?.[table] ?? []) {
    const columns = Object.keys(row);
    const values = columns.map(column => quoteValue(row[column]));
    console.log(`INSERT INTO ${quoteId(table)} (${columns.map(quoteId).join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT (${quoteId("id")}) DO UPDATE SET ${columns.filter(column => column !== "id").map(column => `${quoteId(column)} = EXCLUDED.${quoteId(column)}`).join(", ")};`);
  }
}
console.log("COMMIT;");
