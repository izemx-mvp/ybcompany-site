import { describe, expect, it, vi } from "vitest";

import {
  chatResponse,
  ERROR_MESSAGES,
  GATEWAY_URL,
  MODEL,
  runChat,
  searchSite,
  validateLead,
  type ClientEvent,
  type Deps,
  type LeadRow,
  type SearchDoc,
  type SiteFacts,
} from "../../supabase/functions/chat/core";
import index from "../../supabase/functions/chat/search-index.json";
import facts from "../../supabase/functions/chat/site-facts.json";
import { parseSSE } from "@/components/chat/chat-client";

// Mocked Lovable AI gateway: each call answers with the next scripted SSE stream.
function sse(chunks: unknown[]): Response {
  const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
  return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}
const text = (content: string) => ({ choices: [{ delta: { content } }] });
const toolCall = (name: string, args: unknown, id = "call_1") => ({
  choices: [
    {
      delta: {
        tool_calls: [
          { index: 0, id, type: "function", function: { name, arguments: JSON.stringify(args) } },
        ],
      },
    },
  ],
});

function setup(responses: Response[]) {
  const fetchMock = vi.fn(async () => responses.shift() ?? sse([text("…")]));
  const leads: LeadRow[] = [];
  const deps: Deps = {
    fetch: fetchMock as unknown as typeof fetch,
    apiKey: "test-key",
    index: index as SearchDoc[],
    facts: facts as SiteFacts,
    insertLead: async (row) => {
      leads.push(row);
    },
  };
  const events: ClientEvent[] = [];
  return { deps, fetchMock, leads, events, emit: (e: ClientEvent) => events.push(e) };
}

const ask = (content: string) => ({
  messages: [{ role: "user" as const, content }],
  page: "/contact/",
});

describe("Assistant YB — search_site", () => {
  it("ranks the matching page first", () => {
    const [first] = searchSite(index as SearchDoc[], "sac non tissé");
    expect(first?.path).toBe("/http-ybcompany-ma-production-de-sac/production-de-sac-non-tisse/");
  });

  it("finds the sport page for a football kit question", () => {
    const paths = searchSite(index as SearchDoc[], "maillots de football").map((d) => d.path);
    expect(paths).toContain("/textile-habillement/habillement-textile-sport-casual/");
  });

  it("returns nothing for an empty query", () => {
    expect(searchSite(index as SearchDoc[], "  ")).toEqual([]);
  });
});

describe("Assistant YB — runChat with a mocked gateway", () => {
  it("streams text deltas then done", async () => {
    const t = setup([sse([text("Bonjour"), text(" !")])]);
    await runChat(t.deps, ask("Bonjour"), t.emit);
    expect(t.events).toEqual([
      { type: "delta", text: "Bonjour" },
      { type: "delta", text: " !" },
      { type: "done" },
    ]);
    const [url, init] = t.fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(GATEWAY_URL);
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer test-key");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe(MODEL);
    expect(body.stream).toBe(true);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain("/contact/");
  });

  it("runs search_site, emits page cards and feeds results back to the model", async () => {
    const t = setup([
      sse([toolCall("search_site", { query: "sublimation" })]),
      sse([text("Voici la page.")]),
    ]);
    await runChat(t.deps, ask("Faites-vous de la sublimation ?"), t.emit);
    const cards = t.events.find((e) => e.type === "cards");
    expect(cards && cards.type === "cards" && cards.cards[0]?.path).toBe(
      "/textile-habillement/sublimation-textiles/",
    );
    expect(t.events.at(-1)).toEqual({ type: "done" });
    const second = JSON.parse(
      String((t.fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body),
    );
    const toolMsg = second.messages.at(-1);
    expect(toolMsg.role).toBe("tool");
    expect(toolMsg.tool_call_id).toBe("call_1");
  });

  it("create_lead stores a valid lead and confirms", async () => {
    const lead = {
      nom: "Sara El Amrani",
      telephone: "+212 600 00 00 00",
      activite: "Club de football",
      besoin: "200 maillots sublimés",
      quantite: "200",
    };
    const t = setup([sse([toolCall("create_lead", lead)]), sse([text("C'est noté.")])]);
    await runChat(t.deps, ask("Je veux un devis"), t.emit);
    expect(t.leads).toHaveLength(1);
    expect(t.leads[0]).toMatchObject({
      source: "chatbot",
      nom: "Sara El Amrani",
      page_path: "/contact/",
      quantite: "200",
    });
    expect(t.events).toContainEqual({
      type: "lead",
      ok: true,
      message: "Votre demande a bien été transmise",
    });
  });

  it("create_lead rejects a lead without phone or email and stores nothing", async () => {
    const t = setup([
      sse([toolCall("create_lead", { nom: "Sara", activite: "Club", besoin: "maillots" })]),
      sse([text("Il me faut un contact.")]),
    ]);
    await runChat(t.deps, ask("devis"), t.emit);
    expect(t.leads).toHaveLength(0);
    expect(t.events.some((e) => e.type === "lead")).toBe(false);
    const second = JSON.parse(
      String((t.fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body),
    );
    expect(JSON.parse(second.messages.at(-1).content)).toMatchObject({ ok: false });
  });

  it.each([429, 402])("maps gateway %i to its French message", async (status) => {
    const t = setup([new Response("limit", { status })]);
    await runChat(t.deps, ask("Bonjour"), t.emit);
    expect(t.events).toEqual([{ type: "error", code: status, message: ERROR_MESSAGES[status] }]);
  });

  it("maps other gateway failures to 500", async () => {
    const t = setup([new Response("boom", { status: 503 })]);
    await runChat(t.deps, ask("Bonjour"), t.emit);
    expect(t.events).toEqual([{ type: "error", code: 500, message: ERROR_MESSAGES[500] }]);
  });

  it("chatResponse streams SSE the browser parser understands", async () => {
    const t = setup([sse([text("Salam")])]);
    const res = chatResponse(t.deps, ask("Salam"));
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const { events, rest } = parseSSE(await res.text());
    expect(rest).toBe("");
    expect(events).toEqual([{ type: "delta", text: "Salam" }, { type: "done" }]);
  });
});

describe("validateLead", () => {
  it("rejects invalid email", () => {
    expect(validateLead({ nom: "Ali", email: "nope", activite: "x", besoin: "y" }).ok).toBe(false);
  });
  it("accepts email only", () => {
    expect(
      validateLead({ nom: "Ali", email: "ali@example.ma", activite: "x", besoin: "y" }).ok,
    ).toBe(true);
  });
});

describe("parseSSE", () => {
  it("keeps an incomplete trailing event for the next chunk and skips malformed lines", () => {
    const { events, rest } = parseSSE(
      'data: {"type":"delta","text":"a"}\n\ndata: not-json\n\ndata: {"type":"do',
    );
    expect(events).toEqual([{ type: "delta", text: "a" }]);
    expect(rest).toBe('data: {"type":"do');
  });
});
