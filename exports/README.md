# Database export

This directory contains a portable backup of the current ZadkAI database.

- `database-schema.mysql.sql` is the supported runtime schema for MySQL/TiDB.
- `database-schema.postgres.sql` is a reference schema for a future PostgreSQL adapter.
- `database-data.json` contains real user/account/meal data from the source database. Treat it as confidential, keep it out of public repositories, and rotate any access to copies.
- `import-database-json.mjs` imports the JSON into MySQL/TiDB using `DATABASE_URL`.
- `json-to-postgres-sql.mjs` creates PostgreSQL INSERT statements from the same JSON.

The export contains database rows only. Uploaded images are external objects referenced by `imageKey`/`imageUrl`; they are not embedded in the JSON. The old image URLs point to Manus Storage and must be migrated or re-uploaded for a self-hosted deployment.
