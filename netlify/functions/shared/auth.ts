import { createHmac } from "crypto";

const TOKEN_TTL = 4 * 60 * 60 * 1000; // 4 hours

export function getSecret(): string {
  return process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "fallback-dev-secret";
}

export function createToken(): string {
  const payload = JSON.stringify({
    exp: Date.now() + TOKEN_TTL,
    iat: Date.now(),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encoded, sig] = parts;
  const expectedSig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (sig !== expectedSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
