import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site, whatsappHref } from "@/content/site";
import { ambienceImage, heroImage } from "@/lib/images";
import { Img } from "@/components/media/Img";
import { Logo } from "@/components/layout/Logo";
import { lockScroll } from "@/components/fx/SmoothScroll";
import { chatEndpoint, streamChat, type ClientEvent, type PageCard } from "./chat-client";
import { Markdown } from "./Markdown";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: PageCard[];
  lead?: string;
  error?: number;
};

const STORAGE_KEY = "yb-chat-v1";
const WELCOME = "Bonjour, je suis l'Assistant YB. Comment puis-je vous aider ?";
const CHIPS = ["Tenues de sport", "Sacs personnalisés", "Impression & PLV", "Demander un devis"];

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
}
function save(msgs: Msg[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
  } catch {
    /* storage unavailable */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

function errorText(code: number): string {
  if (code === 429)
    return "L'assistant reçoit beaucoup de demandes en ce moment. Réessayez dans un instant ou contactez-nous directement.";
  if (code === 402)
    return "L'assistant est momentanément indisponible. Contactez-nous directement :";
  if (code === 0)
    return "L'assistant n'est pas encore activé sur ce site. Contactez-nous directement :";
  return "Une erreur est survenue. Contactez-nous directement :";
}

function cardImage(c: PageCard) {
  return heroImage(c.key) ?? ambienceImage("fabric-poster");
}

/** The chat dialog (lazy chunk). Desktop: docked 400×620 panel. Mobile: fullscreen sheet. */
export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => load());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => save(msgs), [msgs]);

  // Focus management, Esc, focus trap; lock page scroll on mobile sheet.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    field.current?.focus();
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const unlock = mobile ? lockScroll() : () => {};
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab" && panel.current) {
        const f = Array.from(
          panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),textarea"),
        ).filter((el) => el.offsetParent !== null);
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      prev?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [msgs, open]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      const user: Msg = { id: uid(), role: "user", content };
      const reply: Msg = { id: uid(), role: "assistant", content: "" };
      const history = [...msgs, user];
      setMsgs([...history, reply]);
      setInput("");
      const endpoint = chatEndpoint();
      const patch = (fn: (m: Msg) => Msg) =>
        setMsgs((all) => all.map((m) => (m.id === reply.id ? fn(m) : m)));
      if (!endpoint) {
        patch((m) => ({ ...m, error: 0 }));
        return;
      }
      setBusy(true);
      abort.current = new AbortController();
      try {
        await streamChat(
          endpoint,
          {
            messages: history
              .filter((m) => !m.error && m.content)
              .map((m) => ({ role: m.role, content: m.content })),
            page: pathname,
          },
          (e: ClientEvent) => {
            if (e.type === "delta") patch((m) => ({ ...m, content: m.content + e.text }));
            else if (e.type === "cards" && e.cards.length) patch((m) => ({ ...m, cards: e.cards }));
            else if (e.type === "lead" && e.ok) patch((m) => ({ ...m, lead: e.message }));
            else if (e.type === "error") patch((m) => ({ ...m, error: e.code }));
          },
          abort.current.signal,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") patch((m) => ({ ...m, error: 500 }));
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, msgs, pathname],
  );

  const reset = () => {
    abort.current?.abort();
    setMsgs([]);
    setBusy(false);
    field.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const last = msgs[msgs.length - 1];
  const typing = busy && last?.role === "assistant" && !last.content && !last.cards;

  return (
    <div
      ref={panel}
      id="yb-chat"
      role="dialog"
      aria-modal="true"
      aria-label="Assistant YB"
      hidden={!open}
      className={cn(
        "fixed z-[90] flex flex-col overflow-hidden bg-cotton text-ink shadow-[0_30px_80px_-20px_rgb(1_39_79/0.55)]",
        "inset-0 sm:inset-auto sm:right-[5.5rem] sm:bottom-6 sm:h-[620px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:border sm:border-navy/15",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300",
      )}
    >
      {/* Header: glass navy, white logo */}
      <div className="flex items-center gap-3 bg-navy/95 px-4 py-3 text-cotton backdrop-blur">
        <Logo variant="white" className="!h-10" />
        <p className="label flex-1 text-gold-soft">Assistant YB</p>
        <button
          type="button"
          onClick={reset}
          className="grid size-9 place-items-center hover:text-gold"
          aria-label="Nouvelle conversation"
          title="Nouvelle conversation"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center hover:text-gold"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        ref={list}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
        aria-live="polite"
        aria-relevant="additions text"
        data-lenis-prevent
      >
        <Bubble role="assistant">
          <p>{WELCOME}</p>
        </Bubble>
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-1">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void send(c)}
                className="border border-navy/25 bg-white/60 px-3 py-2 text-[13px] text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cotton"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {msgs.map((m) => (
          <div key={m.id} className="space-y-3">
            {(m.content || m.role === "user") && (
              <Bubble role={m.role}>
                {m.role === "assistant" ? (
                  <Markdown text={m.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </Bubble>
            )}
            {m.cards && (
              <ul className="grid gap-2">
                {m.cards.map((c) => (
                  <li key={c.path}>
                    <Link
                      to={c.path}
                      className="group flex gap-3 border border-navy/12 bg-white/70 p-2 transition-colors hover:border-navy/40"
                    >
                      <Img
                        image={{ ...cardImage(c), alt: "" }}
                        ratio={1}
                        className="w-16 shrink-0"
                      />
                      <span className="min-w-0 py-0.5">
                        <span className="block truncate text-[13px] font-medium text-navy">
                          {c.title}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-ink/70">
                          {c.excerpt}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {m.lead && (
              <div
                className="flex items-center gap-3 border border-gold/60 bg-navy px-4 py-3 text-cotton"
                role="status"
              >
                <span className="size-3 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                <p className="text-sm">{m.lead}</p>
              </div>
            )}
            {m.error !== undefined && (
              <div
                className="space-y-3 border border-destructive/30 bg-white/70 p-3 text-sm"
                role="alert"
              >
                <p>{errorText(m.error)}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] px-3 py-2 text-[13px] font-medium text-white"
                  >
                    WhatsApp
                  </a>
                  <Link
                    to="/contact/"
                    className="inline-flex items-center border border-navy px-3 py-2 text-[13px] text-navy hover:bg-navy hover:text-cotton"
                  >
                    Contact
                  </Link>
                  <a
                    href={site.phoneHref}
                    className="inline-flex items-center px-3 py-2 text-[13px] text-navy underline"
                  >
                    {site.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex gap-1.5 pl-2" role="status" aria-label="L'assistant écrit">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block size-2 bg-gold motion-safe:animate-[diamond-blink_1.2s_ease-in-out_infinite] motion-reduce:rotate-45"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 border-t border-navy/12 bg-white/60 p-3"
      >
        <label htmlFor="yb-chat-input" className="sr-only">
          Votre message
        </label>
        <textarea
          id="yb-chat-input"
          ref={field}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Votre message"
          className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-[15px] outline-none placeholder:text-ink/45"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="grid size-11 shrink-0 place-items-center bg-navy text-cotton transition-colors hover:bg-navy-deep disabled:opacity-40"
          aria-label="Envoyer"
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] px-4 py-3 text-[14.5px] leading-relaxed",
          role === "user"
            ? "bg-navy text-cotton"
            : "border border-navy/10 bg-white/80 text-ink [&_strong]:text-navy",
        )}
      >
        {children}
      </div>
    </div>
  );
}
