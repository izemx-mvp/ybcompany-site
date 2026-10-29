// Supabase / Lovable Cloud edge function: "Assistant YB".
// POST { messages: [{ role, content }], page?: string } → text/event-stream of ClientEvent.
//
// Env (provided by Lovable Cloud): LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// search-index.json and site-facts.json are generated from the site by `npm run chat:data`.
import {
  chatResponse,
  CORS_HEADERS,
  type LeadRow,
  type SearchDoc,
  type SiteFacts,
} from "./core.ts";
import searchIndex from "./search-index.json" with { type: "json" };
import siteFacts from "./site-facts.json" with { type: "json" };

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

async function insertLead(row: LeadRow): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) {
    console.log("[chat] Base non configurée, prospect :", JSON.stringify(row));
    return;
  }
  const res = await fetch(`${url}/rest/v1/prospects`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`prospects ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY manquant" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: { messages?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON invalide" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const messages = Array.isArray(body.messages)
    ? (body.messages as { role: "user" | "assistant"; content: string }[])
    : [];
  const page = typeof body.page === "string" ? body.page.slice(0, 300) : undefined;

  return chatResponse(
    { fetch, apiKey, index: searchIndex as SearchDoc[], facts: siteFacts as SiteFacts, insertLead },
    { messages, page },
  );
});
