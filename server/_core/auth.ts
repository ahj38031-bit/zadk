import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { registerOAuthRoutes } from "./oauth";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

/**
 * Authentication boundary for self-hosting.
 *
 * `manus` preserves the original Manus OAuth flow. `local` creates one
 * explicitly configured owner session for a small self-hosted deployment.
 * For a public multi-user deployment, replace this adapter with Auth.js,
 * Clerk, Supabase Auth, or another provider without changing tRPC procedures.
 */
export function registerAuthRoutes(app: Express) {
  if (ENV.authProvider === "manus") {
    registerOAuthRoutes(app);
    return;
  }

  if (ENV.authProvider !== "local") return;

  app.get("/api/auth/login", async (_req: Request, res: Response) => {
    if (!ENV.databaseUrl) {
      res.status(503).json({ error: "DATABASE_URL is required for local authentication" });
      return;
    }

    try {
      await db.upsertUser({
        openId: ENV.localAuthUserId,
        name: ENV.localAuthUserName,
        email: ENV.localAuthUserEmail,
        loginMethod: "local",
        role: "user",
        lastSignedIn: new Date(),
      });
      const token = await sdk.createSessionToken(ENV.localAuthUserId, {
        name: ENV.localAuthUserName,
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(res.req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Auth] Local login failed", error);
      res.status(500).json({ error: "Local login failed" });
    }
  });
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  if (ENV.authProvider === "disabled") return null;
  if (ENV.authProvider === "manus") return sdk.authenticateRequest(req);

  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  let token = cookies[COOKIE_NAME];
  if (!token) {
    const authorization = req.headers.authorization;
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
      token = authorization.slice(7);
    }
  }

  const session = await sdk.verifySession(token);
  if (!session || session.openId !== ENV.localAuthUserId) return null;

  await db.upsertUser({
    openId: ENV.localAuthUserId,
    name: ENV.localAuthUserName,
    email: ENV.localAuthUserEmail,
    loginMethod: "local",
    lastSignedIn: new Date(),
  });
  return (await db.getUserByOpenId(ENV.localAuthUserId)) ?? null;
}
