import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "./db.js";
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
  invitedUsers,
  users,
  type UserRole,
} from "../shared/schema.js";

const SESSION_DAYS = 90;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;
const UPDATE_AGE_SECONDS = 24 * 60 * 60; // sliding renewal once per day of use

function requireDb() {
  if (!db) {
    throw new Error("DATABASE_URL is niet ingesteld — auth vereist Postgres.");
  }
  return db;
}

function authBaseUrl() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:5000";
}

async function isEmailAllowed(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const database = requireDb();
  const invite = await database
    .select()
    .from(invitedUsers)
    .where(eq(invitedUsers.email, normalized))
    .limit(1);
  if (invite[0]?.active) return true;

  const profile = await database
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return Boolean(profile[0]?.active && profile[0]?.email);
}

async function sendOtpEmail(email: string, otp: string) {
  const from = process.env.AUTH_FROM_EMAIL || "Anesthesie Kortrijk <onboarding@resend.dev>";
  const subject = "Je inlogcode — Anesthesie Kortrijk";
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto">
      <h1 style="font-size:18px">Anesthesie Kortrijk</h1>
      <p>Je eenmalige inlogcode:</p>
      <p style="font-size:32px;letter-spacing:0.35em;font-weight:700">${otp}</p>
      <p style="color:#64748b;font-size:13px">Geldig 10 minuten. Deze mail is alleen voor genodigde staf/ASO.</p>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[auth] OTP for ${email}: ${otp} (niet gemaild — RESEND_API_KEY ontbreekt in .env)`);
    if (process.env.NODE_ENV === "production" && process.env.AUTH_DEV_OTP_LOG !== "1") {
      throw new Error("RESEND_API_KEY ontbreekt");
    }
    return;
  }

  if (process.env.AUTH_DEV_OTP_LOG === "1") {
    console.log(`[auth] OTP for ${email}: ${otp} (ook via Resend verstuurd)`);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error, data } = await resend.emails.send({
    from,
    to: email,
    subject,
    html,
    text: `Je inlogcode voor Anesthesie Kortrijk: ${otp}`,
  });
  if (error) {
    console.error("[auth] Resend error:", error);
    throw new Error("Kon e-mail niet versturen");
  }
  console.log(`[auth] Resend OK id=${data?.id ?? "?"} to=${email} from=${from}`);
}

/** Ensure app `users` row exists for this Better Auth user (invite → profile). */
export async function ensureAppUserFromAuth(auth: {
  id: string;
  email: string;
  name: string;
}) {
  const database = requireDb();
  const email = auth.email.trim().toLowerCase();

  const byAuth = await database
    .select()
    .from(users)
    .where(eq(users.authUserId, auth.id))
    .limit(1);
  if (byAuth[0]) return byAuth[0];

  const byEmail = await database.select().from(users).where(eq(users.email, email)).limit(1);
  if (byEmail[0]) {
    const [updated] = await database
      .update(users)
      .set({ authUserId: auth.id, name: byEmail[0].name || auth.name, active: true })
      .where(eq(users.id, byEmail[0].id))
      .returning();
    return updated;
  }

  const invite = await database
    .select()
    .from(invitedUsers)
    .where(eq(invitedUsers.email, email))
    .limit(1);
  const inv = invite[0];
  if (!inv?.active) {
    throw new Error("Geen uitnodiging voor dit e-mailadres");
  }

  const usernameBase =
    inv.username ||
    email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").toLowerCase() ||
    "user";
  let username = usernameBase;
  let suffix = 0;
  for (;;) {
    const clash = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (clash.length === 0) break;
    suffix += 1;
    username = `${usernameBase}${suffix}`;
  }

  const [created] = await database
    .insert(users)
    .values({
      username,
      password: "",
      name: inv.name || auth.name,
      email,
      role: inv.role as UserRole,
      active: true,
      authUserId: auth.id,
      pin: null,
    })
    .returning();
  return created;
}

export function createAuth() {
  const database = requireDb();

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: {
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
    baseURL: authBaseUrl(),
    trustedOrigins: [
      authBaseUrl(),
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      process.env.AUTH_TRUSTED_ORIGIN,
    ].filter(Boolean) as string[],
    session: {
      expiresIn: SESSION_SECONDS,
      updateAge: UPDATE_AGE_SECONDS,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        allowedAttempts: 5,
        disableSignUp: false,
        async sendVerificationOTP({ email, otp, type }) {
          const allowed = await isEmailAllowed(email);
          if (!allowed) {
            console.warn(`[auth] OTP geweigerd (niet op allowlist): ${email}`);
            // Still "succeed" to avoid email enumeration; do not send mail.
            return;
          }
          if (type === "forget-password") return;
          await sendOtpEmail(email, otp);
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const allowed = await isEmailAllowed(user.email);
            if (!allowed) {
              throw new Error("Dit e-mailadres is niet uitgenodigd");
            }
            const database = requireDb();
            const invite = await database
              .select()
              .from(invitedUsers)
              .where(eq(invitedUsers.email, user.email.trim().toLowerCase()))
              .limit(1);
            return {
              data: {
                ...user,
                name: invite[0]?.name || user.name || user.email,
                email: user.email.trim().toLowerCase(),
              },
            };
          },
          after: async (user) => {
            try {
              await ensureAppUserFromAuth(user);
            } catch (err) {
              console.error("[auth] ensureAppUser after create failed:", err);
            }
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            try {
              const database = requireDb();
              const found = await database
                .select()
                .from(authUser)
                .where(eq(authUser.id, session.userId))
                .limit(1);
              if (found[0]) await ensureAppUserFromAuth(found[0]);
            } catch (err) {
              console.error("[auth] ensureAppUser after session failed:", err);
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let _auth: Auth | null = null;

export function getAuth(): Auth {
  if (!_auth) {
    if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BETTER_AUTH_SECRET is verplicht in productie");
      }
      process.env.BETTER_AUTH_SECRET =
        "dev-only-insecure-secret-change-me-anesthesie-kortrijk";
    }
    _auth = createAuth();
  }
  return _auth;
}
