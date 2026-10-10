import type { Express } from "express";
import { createReadStream } from "node:fs";
import { getLocalStorageFilePath, storageGetSignedUrl } from "../storage";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) return res.status(400).send("Missing storage key");

    try {
      if (ENV.storageProvider === "local") {
        const filePath = getLocalStorageFilePath(key);
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        createReadStream(filePath)
          .on("error", () => res.status(404).send("File not found"))
          .pipe(res);
        return;
      }

      const url = await storageGetSignedUrl(key);
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (error) {
      console.error("[StorageProxy] failed:", error);
      res.status(502).send("Storage backend error");
    }
  });

  if (ENV.storageProvider === "manus") {
    app.get("/manus-storage/*", async (req, res) => {
      const key = (req.params as Record<string, string>)[0];
      if (!key) return res.status(400).send("Missing storage key");
      try {
        const url = await storageGetSignedUrl(key);
        res.set("Cache-Control", "no-store");
        res.redirect(307, url);
      } catch (error) {
        console.error("[ManusStorageProxy] failed:", error);
        res.status(502).send("Manus storage backend error");
      }
    });
  }
}
