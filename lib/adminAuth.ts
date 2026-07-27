import crypto from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

// Creates a signed token: "<expiryTimestamp>.<signature>"
// Anyone can read the expiry, but can't forge a valid signature without the secret.
export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || !SECRET) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  const expectedSignature = sign(payload);

  // Constant-time comparison to avoid timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export const ADMIN_SESSION_COOKIE_NAME = "xpress_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;
