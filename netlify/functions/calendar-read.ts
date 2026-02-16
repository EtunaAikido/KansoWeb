import type { Handler } from "@netlify/functions";
import { GoogleAuth } from "google-auth-library";
import { verifyToken } from "./shared/auth";

const CALENDAR_ID = process.env.PUBLIC_GOOGLE_CALENDAR_ID || "etuna.aikido@gmail.com";
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Service account not configured");
  return new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: SCOPES,
  });
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const token = event.headers.authorization?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const auth = getAuthClient();
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=100`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken.token}` },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Calendar API error:", response.status, err);
      return { statusCode: response.status, body: JSON.stringify({ error: "Calendar API error" }) };
    }

    const data = await response.json();
    const events = (data.items || []).map((e: any) => ({
      id: e.id,
      summary: e.summary || "",
      description: e.description || "",
      location: e.location || "",
      start: e.start,
      end: e.end,
      isAllDay: !!e.start?.date && !e.start?.dateTime,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    };
  } catch (err: any) {
    console.error("calendar-read error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};

export { handler };
