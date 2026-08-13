const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

/** HMAC-SHA256 using Web Crypto API (works in both Edge and Node.js runtimes) */
async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string comparison.
 *
 * Node's `timingSafeEqual` is unavailable in the Edge runtime where middleware
 * runs, so this is implemented with a branchless XOR accumulator instead. Every
 * character is compared regardless of where the first mismatch occurs, so the
 * duration does not leak how much of the signature was correct.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** URL-safe base64 so the email survives being placed inside a dot-delimited token. */
function encodeEmail(email: string): string {
  return btoa(email).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeEmail(encoded: string): string | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  } catch {
    return null;
  }
}

/**
 * Create a signed session token: `timestamp.random.email.signature`
 *
 * The email is carried in the token so audit logs can name the actor without
 * a database round-trip on every request. It is signed, not encrypted — it is
 * tamper-proof but readable, which is fine for an address the user already knows.
 */
export async function createSessionToken(email: string): Promise<string> {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const random = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const data = `${timestamp}.${random}.${encodeEmail(email)}`;
  const signature = await hmacSign(data);
  return `${data}.${signature}`;
}

export interface SessionPayload {
  email: string;
  issuedAt: number;
}

/**
 * Verify a session token's signature and expiry, returning its payload.
 *
 * This is a purely cryptographic check with no database access, so it is safe
 * to call from Edge middleware. It proves the token was issued by this server
 * and has not expired — it does NOT prove the account is still active. Callers
 * running in the Node runtime should additionally check `isActive` via
 * `getSessionUser()` in lib/admin-auth.ts.
 */
export async function readSessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [timestamp, , encodedEmail, signature] = parts;
  const data = parts.slice(0, 3).join(".");

  const expected = await hmacSign(data);
  if (!safeCompare(signature, expected)) return null;

  const issuedAt = parseInt(timestamp, 10);
  if (Number.isNaN(issuedAt)) return null;

  const age = (Date.now() - issuedAt) / 1000;
  if (age > MAX_AGE || age < 0) return null;

  const email = decodeEmail(encodedEmail);
  if (!email) return null;

  return { email, issuedAt };
}

/** Convenience wrapper for call sites that only need a yes/no answer. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  return (await readSessionToken(token)) !== null;
}

export { COOKIE_NAME, MAX_AGE };
