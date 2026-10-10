import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  const normalized = relKey.replace(/^\/+/, "").replaceAll("..", "_");
  if (!normalized || normalized.includes("\\")) throw new Error("Invalid storage key");
  return normalized;
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function localPath(key: string): string {
  const root = path.resolve(process.cwd(), ENV.storageDir);
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Invalid storage path");
  return resolved;
}

function getS3Client() {
  if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey) {
    throw new Error("S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required");
  }
  return new S3Client({
    region: ENV.s3Region,
    endpoint: ENV.s3EndpointUrl || undefined,
    forcePathStyle: Boolean(ENV.s3EndpointUrl),
    credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey },
  });
}

function publicStorageUrl(key: string): string {
  return `/storage/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  if (ENV.storageProvider === "manus") {
    const forgeUrl = ENV.forgeApiUrl;
    const forgeKey = ENV.forgeApiKey;
    if (!forgeUrl || !forgeKey) throw new Error("Manus storage configuration is missing");
    const presignUrl = new URL("v1/storage/presign/put", forgeUrl.replace(/\/+$/, "") + "/");
    presignUrl.searchParams.set("path", key);
    const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
    if (!presignResp.ok) throw new Error(`Storage presign failed (${presignResp.status})`);
    const { url } = (await presignResp.json()) as { url: string };
    const uploadResp = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType }),
    });
    if (!uploadResp.ok) throw new Error(`Storage upload failed (${uploadResp.status})`);
    return { key, url: `/manus-storage/${key}` };
  }

  if (ENV.storageProvider === "s3") {
    const client = getS3Client();
    await client.send(new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, Body: data, ContentType: contentType }));
    return { key, url: publicStorageUrl(key) };
  }

  const target = localPath(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  return { key, url: publicStorageUrl(key) };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: ENV.storageProvider === "manus" ? `/manus-storage/${key}` : publicStorageUrl(key) };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (ENV.storageProvider === "manus") {
    const forgeUrl = ENV.forgeApiUrl;
    const forgeKey = ENV.forgeApiKey;
    if (!forgeUrl || !forgeKey) throw new Error("Manus storage configuration is missing");
    const getUrl = new URL("v1/storage/presign/get", forgeUrl.replace(/\/+$/, "") + "/");
    getUrl.searchParams.set("path", key);
    const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
    if (!resp.ok) throw new Error(`Storage signed URL failed (${resp.status})`);
    const { url } = (await resp.json()) as { url: string };
    return url;
  }
  if (ENV.storageProvider === "s3") {
    return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 3600 });
  }
  return publicStorageUrl(key);
}

export function getLocalStorageFilePath(relKey: string): string {
  return localPath(normalizeKey(relKey));
}
