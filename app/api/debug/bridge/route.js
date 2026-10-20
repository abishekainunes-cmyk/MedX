export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = process.env.SOCIAL_STATE_API_URL || process.env.SOCIAL_STATE_BRIDGE_URL || "";
  const secret = process.env.SOCIAL_STATE_SHARED_SECRET || process.env.SOCIAL_STATE_BRIDGE_SECRET || "";

  if (!url || !secret) {
    return Response.json({ ok: false, error: "Missing URL or secret" });
  }

  const tests = [
    { name: "x-nunes-secret", headers: { "x-nunes-secret": secret } },
    { name: "bearer", headers: { "Authorization": `Bearer ${secret}` } },
    { name: "x-api-key", headers: { "x-api-key": secret } },
    { name: "x-bridge-secret", headers: { "x-bridge-secret": secret } },
    { name: "query-secret", headers: {}, query: { secret } },
    { name: "query-token", headers: {}, query: { token: secret } }
  ];

  const results = {};

  for (const t of tests) {
    try {
      const u = new URL(url);
      u.searchParams.set("key", "token:facebook");
      if (t.query) {
        for (const [k, v] of Object.entries(t.query)) u.searchParams.set(k, v);
      }
      const res = await fetch(u, {
        headers: t.headers,
        cache: "no-store"
      });
      const json = await res.json().catch(e => ({ parseError: e.message }));
      results[t.name] = { status: res.status, ok: json?.ok, body: json };
    } catch (e) {
      results[t.name] = { error: e.message };
    }
  }

  return Response.json({ ok: true, url, results });
}
