// Browser side of the "Assistant YB" protocol (see supabase/functions/chat/core.ts).

export type PageCard = { title: string; path: string; key: string; excerpt: string };

export type ClientEvent =
  | { type: "delta"; text: string }
  | { type: "cards"; cards: PageCard[] }
  | { type: "lead"; ok: boolean; message: string }
  | { type: "error"; code: number; message: string }
  | { type: "done" };

export type Endpoint = { url: string; headers: Record<string, string> } | null;

/** VITE_CHAT_ENDPOINT wins; otherwise the Lovable Cloud / Supabase function URL. */
export function chatEndpoint(): Endpoint {
  const env = import.meta.env as Record<string, string | undefined>;
  const explicit = env["VITE_CHAT_ENDPOINT"];
  const supa = env["VITE_SUPABASE_URL"];
  const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_ANON_KEY"];
  if (explicit)
    return { url: explicit, headers: key ? { apikey: key, Authorization: `Bearer ${key}` } : {} };
  if (supa && key)
    return {
      url: `${supa.replace(/\/$/, "")}/functions/v1/chat`,
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    };
  return null;
}

/** Parses `data: {...}` SSE lines from a text buffer; returns events and the unconsumed rest. */
export function parseSSE(buffer: string): { events: ClientEvent[]; rest: string } {
  const events: ClientEvent[] = [];
  const parts = buffer.split(/\r?\n\r?\n/);
  const rest = parts.pop() ?? "";
  for (const part of parts) {
    for (const line of part.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        events.push(JSON.parse(data) as ClientEvent);
      } catch {
        /* ignore malformed */
      }
    }
  }
  return { events, rest };
}

export async function streamChat(
  endpoint: NonNullable<Endpoint>,
  body: { messages: { role: "user" | "assistant"; content: string }[]; page: string },
  onEvent: (e: ClientEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(endpoint.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...endpoint.headers },
    body: JSON.stringify(body),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    const code = res.status === 429 || res.status === 402 ? res.status : 500;
    onEvent({ type: "error", code, message: "" });
    return;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const { events, rest } = parseSSE(buf);
    buf = rest;
    events.forEach(onEvent);
  }
  const { events } = parseSSE(buf + "\n\n");
  events.forEach(onEvent);
}
