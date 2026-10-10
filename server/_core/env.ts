const authProvider = process.env.AUTH_PROVIDER ?? (process.env.VITE_APP_ID ? "manus" : "local");
const storageProvider = process.env.STORAGE_PROVIDER ?? (process.env.BUILT_IN_FORGE_API_KEY ? "manus" : "local");

export const ENV = {
  appId: process.env.VITE_APP_ID ?? (authProvider === "local" ? "local" : ""),
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  authProvider,
  localAuthUserId: process.env.LOCAL_AUTH_USER_ID ?? "local-user",
  localAuthUserName: process.env.LOCAL_AUTH_USER_NAME ?? "ZadkAI User",
  localAuthUserEmail: process.env.LOCAL_AUTH_USER_EMAIL ?? "local@example.com",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  llmApiUrl: process.env.LLM_API_URL ?? process.env.BUILT_IN_FORGE_API_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
  llmPassThinking: process.env.LLM_PASS_THINKING
    ? process.env.LLM_PASS_THINKING === "true"
    : Boolean(process.env.BUILT_IN_FORGE_API_KEY && !process.env.LLM_API_KEY),
  storageProvider,
  storageDir: process.env.STORAGE_DIR ?? "storage/uploads",
  s3EndpointUrl: process.env.S3_ENDPOINT_URL ?? "",
  s3Region: process.env.S3_REGION ?? "auto",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
};
