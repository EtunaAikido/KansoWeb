import type { Handler } from "@netlify/functions";
import { createHash } from "crypto";
import { createToken } from "./shared/auth";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const pinHash = process.env.ADMIN_PIN_HASH;
  if (!pinHash) {
    return { statusCode: 500, body: JSON.stringify({ error: "Admin not configured" }) };
  }

  let pin: string;
  try {
    const body = JSON.parse(event.body || "{}");
    pin = body.pin;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  if (!pin) {
    return { statusCode: 400, body: JSON.stringify({ error: "PIN required" }) };
  }

  const inputHash = createHash("sha256").update(pin).digest("hex");

  if (inputHash !== pinHash.toLowerCase()) {
    return { statusCode: 401, body: JSON.stringify({ error: "Fel PIN-kod" }) };
  }

  const token = createToken();
  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};

export { handler };
