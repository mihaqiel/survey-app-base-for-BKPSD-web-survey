const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  return process.env.SESSION_SECRET || "fallback-dev-secret-change-in-production";
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

/** Create a signed session token: `timestamp.signature` */
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const signature = await hmacSign(timestamp);
  return `${timestamp}.${signature}`;
}

/** Verify a session token is valid and not expired */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;

  // Check signature
  const expected = await hmacSign(timestamp);
  if (signature !== expected) return false;

  // Check expiry
  const age = (Date.now() - parseInt(timestamp, 10)) / 1000;
  if (age > MAX_AGE || age < 0) return false;

  return true;
}

export { COOKIE_NAME, MAX_AGE };
