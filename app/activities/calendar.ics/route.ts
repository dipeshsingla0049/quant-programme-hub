import { getActivities } from "@/lib/data";

export const dynamic = "force-static";

function toIcsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const activities = await getActivities();
  const stamp = toIcsDate(new Date().toISOString());

  const events = activities.map((a) => {
    const end = new Date(new Date(a.startsAt).getTime() + a.durationMinutes * 60_000).toISOString();
    return [
      "BEGIN:VEVENT",
      `UID:${a.id}@quant-research-hub`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsDate(a.startsAt)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escape(`[${a.kind}] ${a.title}`)}`,
      `DESCRIPTION:${escape(a.description)}`,
      `LOCATION:${escape(a.location)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NST Quant Research Hub//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:NST Quant Programme",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="quant-programme.ics"',
    },
  });
}
