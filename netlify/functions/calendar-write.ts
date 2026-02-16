import type { Handler } from "@netlify/functions";
import { GoogleAuth } from "google-auth-library";
import { verifyToken } from "./shared/auth";

const CALENDAR_ID = process.env.PUBLIC_GOOGLE_CALENDAR_ID || "etuna.aikido@gmail.com";
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Service account not configured");
  return new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: SCOPES,
  });
}

async function getAccessToken() {
  const auth = getAuthClient();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, body: "" };
  }

  const token = event.headers.authorization?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    body = {};
  }

  const eventId = event.queryStringParameters?.eventId;

  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // SINGLE DELETE (with eventId query param)
    if (event.httpMethod === "DELETE" && eventId) {
      const res = await fetch(`${BASE_URL}/${eventId}`, { method: "DELETE", headers });
      if (!res.ok && res.status !== 410) {
        const err = await res.text();
        console.error("Delete error:", res.status, err);
        return { statusCode: res.status, body: JSON.stringify({ error: "Delete failed" }) };
      }
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    // BATCH DELETE (with eventIds in body)
    if (event.httpMethod === "DELETE" && Array.isArray(body.eventIds)) {
      const ids = body.eventIds as string[];
      if (ids.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "eventIds array is empty" }) };
      }
      let deleted = 0;
      let failed = 0;
      for (const id of ids) {
        try {
          const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
          if (res.ok || res.status === 410) {
            deleted++;
          } else {
            console.error("Batch delete error:", res.status);
            failed++;
          }
        } catch {
          failed++;
        }
      }
      return { statusCode: 200, body: JSON.stringify({ deleted, failed }) };
    }

    // DELETE without eventId or eventIds
    if (event.httpMethod === "DELETE") {
      return { statusCode: 400, body: JSON.stringify({ error: "eventId or eventIds required" }) };
    }

    // BATCH CREATE (POST with events array)
    if (event.httpMethod === "POST" && Array.isArray(body.events)) {
      const events = body.events as Array<{ summary: string; startDateTime: string; endDateTime: string; location?: string }>;
      if (events.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "events array is empty" }) };
      }
      let created = 0;
      let failed = 0;
      for (const ev of events) {
        if (!ev.summary || !ev.startDateTime || !ev.endDateTime) {
          failed++;
          continue;
        }
        const timedEvent: any = {
          summary: ev.summary,
          start: { dateTime: ev.startDateTime, timeZone: "Europe/Stockholm" },
          end: { dateTime: ev.endDateTime, timeZone: "Europe/Stockholm" },
        };
        if (ev.location) timedEvent.location = ev.location;
        try {
          const res = await fetch(BASE_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(timedEvent),
          });
          if (res.ok) {
            created++;
          } else {
            const err = await res.text();
            console.error("Batch create error:", res.status, err);
            failed++;
          }
        } catch (e) {
          console.error("Batch create fetch error:", e);
          failed++;
        }
      }
      return { statusCode: 201, body: JSON.stringify({ created, failed }) };
    }

    // Validate input for create/update
    const { summary, description, startDate, endDate } = body;
    if (!summary || !startDate || !endDate) {
      return { statusCode: 400, body: JSON.stringify({ error: "summary, startDate, endDate required" }) };
    }

    const eventData = {
      summary,
      description: description || "",
      start: { date: startDate },
      end: { date: endDate },
    };

    // UPDATE (PUT)
    if (event.httpMethod === "PUT") {
      if (!eventId) {
        return { statusCode: 400, body: JSON.stringify({ error: "eventId required for update" }) };
      }
      const res = await fetch(`${BASE_URL}/${eventId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Update error:", res.status, err);
        return { statusCode: res.status, body: JSON.stringify({ error: "Update failed" }) };
      }
      const updated = await res.json();
      return { statusCode: 200, body: JSON.stringify({ event: updated }) };
    }

    // CREATE (POST)
    if (event.httpMethod === "POST") {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Create error:", res.status, err);
        return { statusCode: res.status, body: JSON.stringify({ error: "Create failed" }) };
      }
      const created = await res.json();
      return { statusCode: 201, body: JSON.stringify({ event: created }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err: any) {
    console.error("calendar-write error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};

export { handler };
