import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? "exports/database-data.json";
const payload = JSON.parse(await readFile(inputPath, "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const tableNames = ["users", "profiles", "meals", "frequentMeals", "weightLogs"];
const quoteId = value => `\`${String(value).replaceAll("`", "``")}\``;

try {
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tableNames) {
    const rows = payload.tables?.[table] ?? [];
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = columns.map(column => row[column] === "NULL" ? null : row[column]);
      const assignments = columns.filter(column => column !== "id").map(column => `${quoteId(column)} = VALUES(${quoteId(column)})`).join(", ");
      const sql = `INSERT INTO ${quoteId(table)} (${columns.map(quoteId).join(", ")}) VALUES (${columns.map(() => "?").join(", ")}) ON DUPLICATE KEY UPDATE ${assignments}`;
      await connection.query(sql, values);
    }
    console.log(`${table}: imported ${rows.length} rows`);
  }
} finally {
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  await connection.end();
}
