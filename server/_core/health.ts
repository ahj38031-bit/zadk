import type { Express } from "express";

export function registerHealthRoute(app: Express) {
  app.get("/health", (_req, res) => {
    res.status(200).type("text/plain").send("OK");
  });
}
