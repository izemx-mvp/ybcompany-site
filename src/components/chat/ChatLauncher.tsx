import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// The whole chat UI is a separate chunk, fetched on first open only.
const ChatPanel = lazy(() => import("./ChatPanel"));

export function openChat() {
  window.dispatchEvent(new CustomEvent("yb:chat-open"));
}

/** Navy diamond launcher with a gold thread pulse. Only this button is in the prerendered HTML. */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const show = useCallback(() => {
    setLoaded(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("yb:chat-open", show);
    return () => window.removeEventListener("yb:chat-open", show);
  }, [show]);

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        onPointerEnter={() => import("./ChatPanel")}
        aria-label={open ? "Fermer l'Assistant YB" : "Ouvrir l'Assistant YB"}
        aria-expanded={open}
        aria-controls="yb-chat"
        className={cn("group relative grid size-14 place-items-center", open && "max-sm:hidden")}
      >
        <span
          className="absolute inset-1.5 rotate-45 border border-gold motion-safe:animate-[thread-pulse_2.4s_ease-out_infinite]"
          aria-hidden="true"
        />
        <span
          className="absolute inset-1.5 rotate-45 border border-gold/70 bg-navy shadow-[0_10px_30px_-10px_rgb(1_39_79/0.8)] transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 24 24"
          className="relative size-5 text-gold-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 5h16v11H9l-5 4V5z" />}
        </svg>
      </button>
      {loaded && (
        <Suspense fallback={null}>
          <ChatPanel open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
