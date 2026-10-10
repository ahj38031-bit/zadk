import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { registerHealthRoute } from "./_core/health";

const servers: Array<ReturnType<ReturnType<typeof express>["listen"]>> = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});

describe("GET /health", () => {
  it("returns a plain OK response for Render health checks", async () => {
    const app = express();
    registerHealthRoute(app);
    const server = app.listen(0);
    servers.push(server);
    await new Promise<void>(resolve => server.once("listening", () => resolve()));
    const address = server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
  });
});
