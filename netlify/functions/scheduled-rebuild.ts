import type { Config } from "@netlify/functions";

export default async () => {
  const hookUrl = process.env.BUILD_HOOK_URL;
  if (!hookUrl) {
    console.error("BUILD_HOOK_URL not configured");
    return new Response("Missing BUILD_HOOK_URL", { status: 500 });
  }

  const res = await fetch(hookUrl, { method: "POST" });
  if (!res.ok) {
    console.error("Build hook failed:", res.status);
    return new Response("Build hook failed", { status: 500 });
  }

  console.log("Rebuild triggered successfully");
  return new Response("OK");
};

// Run daily at 05:00 Stockholm time (04:00 UTC in summer, 03:00 UTC in winter)
// Using 04:00 UTC as a reasonable middle ground
export const config: Config = {
  schedule: "0 4 * * *",
};
