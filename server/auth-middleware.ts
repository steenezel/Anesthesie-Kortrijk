import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import { getAuth, ensureAppUserFromAuth } from "./auth.js";
import { db } from "./db.js";
import { users, type User, type UserRole } from "../shared/schema.js";

export type AppSessionUser = {
  authUserId: string;
  email: string;
  name: string;
  profile: User;
};

declare global {
  namespace Express {
    interface Request {
      appUser?: AppSessionUser;
    }
  }
}

export async function resolveSessionUser(req: Request): Promise<AppSessionUser | null> {
  if (!db) return null;
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) return null;

    const profile = await ensureAppUserFromAuth({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    if (!profile.active) return null;

    return {
      authUserId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      profile,
    };
  } catch (err) {
    console.error("[auth] resolveSessionUser:", err);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await resolveSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }
  req.appUser = user;
  return next();
}

export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.appUser || (await resolveSessionUser(req));
    if (!user) {
      return res.status(401).json({ error: "Authenticatie vereist" });
    }
    req.appUser = user;
    if (user.profile.role === "kiosk") {
      return res.status(403).json({ error: "Kiosk-modus: alleen lezen" });
    }
    if (roles.length && !roles.includes(user.profile.role)) {
      return res.status(403).json({ error: "Onvoldoende rechten" });
    }
    return next();
  };
}

/** Kiosk may browse CDS but not mutate logbook/SMASH/marketplace. */
export function rejectKioskWrites(req: Request, res: Response, next: NextFunction) {
  const role = req.appUser?.profile.role;
  if (role === "kiosk") {
    return res.status(403).json({ error: "Kiosk-modus: schrijven niet toegestaan" });
  }
  return next();
}

export function toPublicProfile(user: User) {
  return {
    id: user.id,
    username: user.username,
    kortenaam: user.username,
    name: user.name ?? user.username,
    email: user.email,
    role: user.role,
  };
}

export async function findProfileById(userId: string) {
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}
