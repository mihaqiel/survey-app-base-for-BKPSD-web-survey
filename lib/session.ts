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

/** Create a signed session token: `timestamp.random.signature` */
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const random = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const data = `${timestamp}.${random}`;
  const signature = await hmacSign(data);
  return `${data}.${signature}`;
}

/** Verify a session token is valid and not expired */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  // Support both old format (2 parts) and new format (3 parts) during transition
  if (parts.length < 2 || parts.length > 3) return false;

  const signature = parts[parts.length - 1];
  const data = parts.slice(0, -1).join(".");
  const timestamp = parts[0];

  // Check signature
  const expected = await hmacSign(data);
  if (signature !== expected) return false;

  // Check expiry
  const age = (Date.now() - parseInt(timestamp, 10)) / 1000;
  if (age > MAX_AGE || age < 0) return false;

  return true;
}

export { COOKIE_NAME, MAX_AGE };
