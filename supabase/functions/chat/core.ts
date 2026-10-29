// Runtime-agnostic core of the "Assistant YB" edge function (no Deno APIs here, so it can be
// unit-tested with Vitest). index.ts wires it to Deno.serve, env vars and the database.

export type SearchDoc = {
  key: string;
  path: string;
  title: string;
  h1: string;
  headings: string[];
  excerpt: string;
  text: string;
};

export type SiteFacts = {
  name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  activities: string[];
  contacts: { name: string; phone: string; email: string }[];
};

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type LeadRow = {
  source: "chatbot";
  nom: string;
  telephone?: string | undefined;
  email?: string | undefined;
  societe?: string | undefined;
  activite: string;
  besoin: string;
  quantite?: string | undefined;
  delai?: string | undefined;
  page_path?: string | undefined;
  conversation?: unknown;
};

/** Events streamed to the browser as SSE `data:` lines. */
export type ClientEvent =
  | { type: "delta"; text: string }
  | { type: "cards"; cards: { title: string; path: string; key: string; excerpt: string }[] }
  | { type: "lead"; ok: boolean; message: string }
  | { type: "error"; code: number; message: string }
  | { type: "done" };

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const MODEL = "google/gemini-2.5-flash";
export const MAX_TOOL_ROUNDS = 4;

export const ERROR_MESSAGES: Record<number, string> = {
  429: "L'assistant reçoit beaucoup de demandes en ce moment. Merci de réessayer dans quelques instants, ou contactez-nous directement.",
  402: "L'assistant est momentanément indisponible. Vous pouvez nous joindre directement par téléphone, WhatsApp ou via la page contact.",
  500: "Une erreur est survenue. Vous pouvez nous joindre directement par téléphone, WhatsApp ou via la page contact.",
};

export function systemPrompt(f: SiteFacts, pagePath?: string): string {
  return [
    `Tu es l'assistant de ${f.name}, fabricant à Casablanca (confection sport et mode, sublimation, impression grand format et PLV, sacherie, équipements de protection). Réponds en français, court et professionnel. Base-toi uniquement sur le contenu du site via search_site ; n'invente jamais prix, délais, quantités minimales ou références clients au-delà de ce qui est écrit sur le site. Si l'information manque, propose un devis : collecte nom, téléphone ou e-mail, activité, besoin, quantité et délai, puis appelle create_lead. Donne les coordonnées (${f.phone}, ${f.email}) si on les demande.`,
    `Activités (libellés du site) : ${f.activities.join(" ; ")}.`,
    `Adresse : ${f.address}. Contacts : ${f.contacts.map((c) => `${c.name} ${c.phone} ${c.email}`).join(" ; ")}.`,
    `Liens : utilise des chemins relatifs du site (ex. /contact/) en markdown. Mets en gras avec **…** et fais des listes courtes.`,
    pagePath ? `Le visiteur consulte actuellement la page ${pagePath}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_site",
      description:
        "Recherche dans le contenu du site YB Company. Retourne jusqu'à 4 pages (titre, chemin, titre H1, intertitres, extrait verbatim).",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Mots-clés en français" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description:
        "Enregistre une demande de devis / prise de contact. Exige au moins un téléphone ou un e-mail.",
      parameters: {
        type: "object",
        properties: {
          nom: { type: "string" },
          telephone: { type: "string" },
          email: { type: "string" },
          societe: { type: "string" },
          activite: {
            type: "string",
            description: "Activité concernée (ex. tenues de sport, sacs, impression)",
          },
          besoin: { type: "string", description: "Description du besoin" },
          quantite: { type: "string" },
          delai: { type: "string" },
        },
        required: ["nom", "activite", "besoin"],
      },
    },
  },
] as const;

// ---------- search_site ----------

const STOP = new Set(
  "le la les un une des de du d l et ou en au aux pour par sur avec sans dans je j vous nous est sont ce ces cette mon ma mes votre vos que qui quoi quel quelle comment combien a à y il elle on se sa son ses leur leurs pas plus tres très".split(
    " ",
  ),
);

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

export function searchSite(index: SearchDoc[], query: string, limit = 4): SearchDoc[] {
  const q = tokens(query);
  if (!q.length) return [];
  const scored = index.map((d) => {
    const fields: [string, number][] = [
      [d.title, 5],
      [d.h1, 4],
      [d.headings.join(" "), 3],
      [d.text, 1],
    ];
    let score = 0;
    for (const [text, w] of fields) {
      const toks = tokens(text);
      for (const t of q) {
        const hits = toks.filter((x) => x === t || (t.length > 3 && x.startsWith(t))).length;
        score += Math.min(hits, 5) * w;
      }
    }
    return { d, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.d);
}

// ---------- create_lead ----------

export function validateLead(
  args: Record<string, unknown>,
):
  | { ok: true; lead: Omit<LeadRow, "source" | "page_path" | "conversation"> }
  | { ok: false; error: string } {
  const str = (k: string) => (typeof args[k] === "string" ? (args[k] as string).trim() : "");
  const nom = str("nom");
  const telephone = str("telephone");
  const email = str("email");
  const activite = str("activite");
  const besoin = str("besoin");
  if (nom.length < 2) return { ok: false, error: "Le nom est requis." };
  if (!telephone && !email)
    return { ok: false, error: "Il faut au moins un téléphone ou un e-mail." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Adresse e-mail invalide." };
  if (telephone && !/^[+\d][\d\s.()-]{7,}$/.test(telephone))
    return { ok: false, error: "Numéro de téléphone invalide." };
  if (!activite || !besoin) return { ok: false, error: "L'activité et le besoin sont requis." };
  const opt = (k: string) => (str(k) ? str(k).slice(0, 500) : undefined);
  return {
    ok: true,
    lead: {
      nom: nom.slice(0, 120),
      telephone: telephone || undefined,
      email: email || undefined,
      societe: opt("societe"),
      activite: activite.slice(0, 300),
      besoin: besoin.slice(0, 4000),
      quantite: opt("quantite"),
      delai: opt("delai"),
    },
  };
}

// ---------- gateway streaming ----------

type GatewayDelta = {
  content?: string | null;
  tool_calls?: {
    index: number;
    id?: string;
    type?: "function";
    function?: { name?: string; arguments?: string };
  }[];
};

/** Parses an OpenAI-compatible SSE stream, yielding parsed JSON chunks. */
export async function* readSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        // Malformed line: skip it.
      }
    }
  }
}

export type Deps = {
  fetch: typeof fetch;
  apiKey: string;
  index: SearchDoc[];
  facts: SiteFacts;
  insertLead: (row: LeadRow) => Promise<void>;
};

/**
 * Runs the tool-calling loop and emits client events. Text deltas are streamed as soon as the
 * gateway sends them; tool calls are executed between rounds.
 */
export async function runChat(
  deps: Deps,
  input: { messages: { role: "user" | "assistant"; content: string }[]; page?: string },
  emit: (e: ClientEvent) => void,
): Promise<void> {
  const history = input.messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(deps.facts, input.page) },
    ...history,
  ];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const res = await deps.fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${deps.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: round < MAX_TOOL_ROUNDS ? TOOLS : undefined,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const code = res.status === 429 || res.status === 402 ? res.status : 500;
      emit({ type: "error", code, message: ERROR_MESSAGES[code]! });
      return;
    }

    let text = "";
    const calls: ToolCall[] = [];
    for await (const chunk of readSSE(res.body)) {
      const choice = (
        chunk["choices"] as { delta?: GatewayDelta; finish_reason?: string | null }[] | undefined
      )?.[0];
      if (!choice) continue;
      const d = choice.delta ?? {};
      if (d.content) {
        text += d.content;
        emit({ type: "delta", text: d.content });
      }
      for (const tc of d.tool_calls ?? []) {
        const slot = (calls[tc.index] ??= {
          id: tc.id ?? `call_${tc.index}`,
          type: "function",
          function: { name: "", arguments: "" },
        });
        if (tc.id) slot.id = tc.id;
        if (tc.function?.name) slot.function.name += tc.function.name;
        if (tc.function?.arguments) slot.function.arguments += tc.function.arguments;
      }
    }

    const pending = calls.filter(Boolean);
    if (!pending.length) {
      emit({ type: "done" });
      return;
    }

    messages.push({ role: "assistant", content: text || null, tool_calls: pending });
    for (const call of pending) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        /* keep empty */
      }
      let result: unknown;
      if (call.function.name === "search_site") {
        const found = searchSite(deps.index, String(args["query"] ?? ""));
        emit({
          type: "cards",
          cards: found.map((d) => ({
            title: d.title,
            path: d.path,
            key: d.key,
            excerpt: d.excerpt,
          })),
        });
        result = found.map((d) => ({
          title: d.title,
          path: d.path,
          h1: d.h1,
          headings: d.headings.slice(0, 12),
          extrait: d.text.slice(0, 1200),
        }));
      } else if (call.function.name === "create_lead") {
        const v = validateLead(args);
        if (!v.ok) {
          result = { ok: false, error: v.error };
        } else {
          try {
            await deps.insertLead({
              source: "chatbot",
              ...v.lead,
              page_path: input.page,
              conversation: history,
            });
            emit({ type: "lead", ok: true, message: "Votre demande a bien été transmise" });
            result = {
              ok: true,
              message: "Demande enregistrée. Un conseiller YB Company vous recontactera.",
            };
          } catch (e) {
            result = { ok: false, error: "Enregistrement impossible pour le moment." };
            console.error("insertLead", e);
          }
        }
      } else {
        result = { error: `Outil inconnu : ${call.function.name}` };
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  emit({ type: "done" });
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Builds the SSE Response for a chat request. */
export function chatResponse(
  deps: Deps,
  input: { messages: { role: "user" | "assistant"; content: string }[]; page?: string },
): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ClientEvent) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        await runChat(deps, input, emit);
      } catch (e) {
        console.error(e);
        emit({ type: "error", code: 500, message: ERROR_MESSAGES[500]! });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
