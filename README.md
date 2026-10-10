# ZadkAI — self-hosting on Render

ZadkAI is an Arabic-first, RTL nutrition companion built with React, Vite, Express, tRPC, Drizzle ORM, and MySQL/TiDB. This repository keeps the existing design and feature set while making the Manus-specific services replaceable for a Render deployment.

## 1. Render configuration

Create a **Web Service** in Render and connect this repository or upload the ZIP source.

| Render field | Value |
|---|---|
| Runtime | Node |
| Node version | `22.14.0` (any Node 22.x release is suitable) |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| Start command | `pnpm start` |
| Health check path | `/health` |
| Root directory | repository root |

Render must expose the service on its injected `PORT`; the server binds to `0.0.0.0` and serves the production Vite build from `dist/public`.

### Required Render environment variables

For the self-hosted default (local authentication + local file storage + OpenAI-compatible LLM), set:

```text
NODE_ENV=production
DATABASE_URL=<your MySQL/TiDB connection URL>
JWT_SECRET=<long random secret>
AUTH_PROVIDER=local
VITE_AUTH_PROVIDER=local
LOCAL_AUTH_USER_ID=local-owner
LOCAL_AUTH_USER_NAME=Your name
LOCAL_AUTH_USER_EMAIL=you@example.com
LLM_API_URL=https://api.openai.com
LLM_API_KEY=<your LLM key>
LLM_MODEL=gpt-4o-mini
STORAGE_PROVIDER=local
STORAGE_DIR=storage/uploads
```

The complete variable catalog, including optional Manus and S3 settings, is in [`env.example`](./env.example). Copy it to `.env` locally; never commit a real `.env` file or paste keys into source code. The source workspace protects dot-prefixed environment files, so the downloadable template intentionally uses the equivalent safe filename `env.example`.

> **Persistent storage note:** Render's ephemeral filesystem can lose local uploads after a redeploy or restart. For production image persistence, use `STORAGE_PROVIDER=s3` with an S3-compatible bucket. The database should also be an external managed MySQL/TiDB service.

## 2. Local commands

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
# edit .env with real values
pnpm db:push       # generates/applies Drizzle migrations; use only with an empty or intended database
pnpm check
pnpm test
pnpm build
pnpm start
```

Health check:

```bash
curl -i http://localhost:3000/health
# HTTP/1.1 200 OK
# OK
```

## 3. Folder structure

```text
client/
  src/
    components/       Shared UI components
    pages/Home.tsx    Main ZadkAI application
    lib/trpc.ts       tRPC client
  public/             Small public configuration files only
drizzle/
  schema.ts            MySQL/TiDB Drizzle schema
  *.sql                Versioned migrations
server/
  _core/
    auth.ts            Replaceable auth boundary (local or Manus)
    context.ts         tRPC request context
    env.ts             Central environment configuration
    index.ts            Express entry point and /health
    llm.ts              OpenAI-compatible LLM adapter
    storageProxy.ts    Local/S3/Manus file serving boundary
  db.ts                MySQL/TiDB data access helpers
  routers.ts           tRPC procedures and nutrition logic
  storage.ts           Local/S3/Manus upload adapter
shared/                 Browser/server shared nutrition logic
exports/                 Database schema and an explicit data backup
scripts/                 Safe import/conversion helpers
render.yaml             Optional Render Blueprint configuration
```

## 4. Manus-only dependencies and replacements

| Current capability | Where it is isolated | Manus dependency | Self-hosted replacement |
|---|---|---|---|
| Login and user sessions | `server/_core/auth.ts`, `server/_core/sdk.ts`, `server/_core/oauth.ts` | Manus OAuth portal and token exchange | The included `AUTH_PROVIDER=local` adapter provides one configured account for a private deployment. For multiple users, replace this adapter with Auth.js, Clerk, Supabase Auth, or another OAuth/OIDC provider. Keep the tRPC `User` shape and call `db.upsertUser`. |
| AI meal analysis and calorie suggestions | `server/_core/llm.ts`, model selection in `server/routers.ts` | Manus Forge `/v1/chat/completions` | Any OpenAI-compatible endpoint. Set `LLM_API_URL`, `LLM_API_KEY`, and `LLM_MODEL`; the API key remains server-side. Vision analysis requires a model/provider that accepts image content and structured JSON. |
| Image/file uploads | `server/storage.ts`, `server/_core/storageProxy.ts` | Manus presigned storage and `/manus-storage/*` | `STORAGE_PROVIDER=local` for development/private use, or `STORAGE_PROVIDER=s3` for Render production. S3-compatible credentials are environment variables only. |
| Database | `drizzle/schema.ts`, `server/db.ts`, `drizzle.config.ts` | Manus-provisioned MySQL/TiDB connection | Any reachable MySQL 8-compatible or TiDB database using `DATABASE_URL`. The application currently uses **MySQL/TiDB**, not PostgreSQL. |
| Owner notifications | `server/_core/notification.ts`, `server/_core/systemRouter.ts` | Manus notification RPC through Forge | This is not used by the main nutrition UI. Replace the helper with email, Slack, Resend, Postmark, or a no-op implementation if you need owner alerts. |
| Generic Data API helper | `server/_core/dataApi.ts` | Manus Data API | Not required by the current nutrition flows. Replace each call with a direct provider SDK or remove the helper. |
| Voice transcription helper | `server/_core/voiceTranscription.ts` | Manus Forge Whisper-compatible endpoint | The current UI primarily uses the browser Speech Recognition API. If server transcription is enabled later, point this helper at OpenAI Whisper or another compatible transcription API using a server-side key. |
| Map proxy | `client/src/components/Map.tsx`, `server/_core/map.ts` | Manus/Forge Maps proxy | Not used by the current nutrition page. Replace it with Google Maps, Mapbox, or OpenStreetMap before enabling maps outside Manus. |

Open Food Facts is a separate public external service used by barcode lookup and is not a Manus-only dependency.

## 5. Authentication choices

- **Private single-owner deployment:** use `AUTH_PROVIDER=local` and set `LOCAL_AUTH_*`. Clicking the existing login button redirects to `/api/auth/login` and creates a signed session for that configured account.
- **Public multi-user deployment:** do not expose the local adapter as a SaaS identity system. Replace `server/_core/auth.ts` with Auth.js, Clerk, Supabase Auth, or another provider and map the provider subject to `users.openId`.
- **Manus compatibility:** set `AUTH_PROVIDER=manus`, `VITE_AUTH_PROVIDER=manus`, and provide the original Manus OAuth variables. This is optional and not needed for Render self-hosting.
- **Public read-only demo:** set `AUTH_PROVIDER=disabled`, `VITE_AUTH_PROVIDER=disabled`. Protected nutrition mutations will correctly require authentication.

## 6. Database export and import

The application currently uses **MySQL/TiDB** through `drizzle-orm/mysql2` and `drizzle-kit` with `dialect: "mysql"`.

Files included in `exports/`:

- `database-schema.mysql.sql` — final MySQL schema.
- `database-schema.postgres.sql` — PostgreSQL reference schema for teams that choose to port the adapter.
- `database-data.json` — data export from the current project database. It contains user data and must be treated as confidential.
- `import-database-json.mjs` — imports the JSON into a MySQL/TiDB database.
- `json-to-postgres-sql.mjs` — converts the JSON backup into PostgreSQL INSERT SQL; this is a data conversion helper only.

### MySQL/TiDB (supported by the current code)

```bash
mysql --protocol=TCP -h HOST -P PORT -u USER -p DATABASE < exports/database-schema.mysql.sql
DATABASE_URL='mysql://USER:PASSWORD@HOST:PORT/DATABASE' \
  node exports/import-database-json.mjs exports/database-data.json
```

Or use the full URL directly with a MySQL client that supports it. Import into a fresh database when possible. The import preserves primary keys and uses upsert semantics.

### PostgreSQL (schema/data reference, not the current runtime adapter)

```bash
psql "$DATABASE_URL" -f exports/database-schema.postgres.sql
node exports/json-to-postgres-sql.mjs exports/database-data.json > /tmp/zadakai-data.postgres.sql
psql "$DATABASE_URL" -f /tmp/zadakai-data.postgres.sql
```

The current application code still imports `drizzle-orm/mysql2`, uses MySQL enums, and expects MySQL insert results. To run the app on PostgreSQL, replace the Drizzle schema/driver and adapt the data helpers before changing `DATABASE_URL`; the included PostgreSQL files make the data portable but do not silently claim PostgreSQL runtime support.

Images referenced by old `imageUrl` values are Manus Storage paths and are not embedded in the database export. Re-upload them to the new S3/local storage or migrate the objects separately, then update those URL fields.

## 7. Security checklist

- Set a unique `JWT_SECRET` in Render; never use the example value.
- Keep `LLM_API_KEY`, database credentials, and S3 secrets in Render Environment Variables.
- Do not expose server-only keys with a `VITE_` prefix.
- Use S3-compatible storage rather than local disk for persistent production uploads.
- If enabling multi-user accounts, replace the local auth adapter before publishing publicly.
- Treat `exports/database-data.json` as a private backup and remove it from any public repository if it is not needed there.

## 8. Manual Render checklist

1. Create the Render Web Service and choose this repository/ZIP contents.
2. Set Node 22.x, the build command, start command, and `/health` path above.
3. Create or choose a reachable MySQL/TiDB database and set `DATABASE_URL`.
4. Add a random `JWT_SECRET`.
5. Choose an auth provider; for a private first deployment set the four `AUTH_PROVIDER=local` variables.
6. Add the LLM provider URL/key/model.
7. Choose S3-compatible storage for persistent images and add its five variables, or accept ephemeral local storage for testing.
8. Deploy, open `https://YOUR-SERVICE.onrender.com/health`, and confirm it returns `OK`.
9. Open the app, use the login button, analyze a small test meal, and verify barcode lookup and image upload.
10. Rotate/remove any temporary credentials and keep the database export private.
