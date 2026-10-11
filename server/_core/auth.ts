import { createHash } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { registerOAuthRoutes } from "./oauth";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getLocalUserId(email: string) {
  return `local-${createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24)}`;
}

function readCredentials(req: Request) {
  const body = req.body as { name?: unknown; email?: unknown } | undefined;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : ENV.localAuthUserName;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 240) : ENV.localAuthUserEmail;
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return null;
  return { name, email, openId: body?.email ? getLocalUserId(email) : ENV.localAuthUserId };
}

/** Local authentication adapter for a small Render deployment. */
export function registerAuthRoutes(app: Express) {
  if (ENV.authProvider === "manus") {
    registerOAuthRoutes(app);
    return;
  }
  if (ENV.authProvider !== "local") return;

  const login = async (req: Request, res: Response) => {
    if (!ENV.databaseUrl) {
      res.status(503).json({ error: "DATABASE_URL is required for local authentication" });
      return;
    }
    const credentials = readCredentials(req);
    if (!credentials) {
      res.status(400).json({ error: "A valid name and email are required" });
      return;
    }
    try {
      await db.upsertUser({
        openId: credentials.openId,
        name: credentials.name,
        email: credentials.email,
        loginMethod: "local",
        role: "user",
        lastSignedIn: new Date(),
      });
      const token = await sdk.createSessionToken(credentials.openId, {
        name: credentials.name,
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(res.req), maxAge: ONE_YEAR_MS });
      if (req.method === "GET") res.redirect(302, "/");
      else res.json({ success: true, user: { name: credentials.name, email: credentials.email } });
    } catch (error) {
      console.error("[Auth] Local login failed", error);
      res.status(500).json({ error: "Local login failed" });
    }
  };

  // GET keeps the old manual URL working; POST powers the new form.
  app.get("/api/auth/login", login);
  app.post("/api/auth/login", login);
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  if (ENV.authProvider === "disabled") return null;
  if (ENV.authProvider === "manus") return sdk.authenticateRequest(req);
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  let token = cookies[COOKIE_NAME];
  if (!token) {
    const authorization = req.headers.authorization;
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) token = authorization.slice(7);
  }
  const session = await sdk.verifySession(token);
  if (!session) return null;
  return (await db.getUserByOpenId(session.openId)) ?? null;
}
