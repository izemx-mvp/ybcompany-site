import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { leadSchema, submitLead, validateFile, type LeadSource } from "@/lib/prospects";
import { whatsappHref } from "@/content/site";

// Tab labels = the subject options of the live contact form.
const TABS: { key: LeadSource; label: string }[] = [
  { key: "contact", label: "Contact" },
  { key: "devis", label: "Devis" },
  { key: "partenariat", label: "Partenariat" },
  { key: "recrutement", label: "Recrutement" },
];

type Errors = Partial<Record<string, string>>;

function Field({
  name,
  label,
  type = "text",
  error,
  required,
  textarea,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string | undefined;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const common = {
    id,
    name,
    required,
    "aria-invalid": !!error || undefined,
    "aria-describedby": error ? errId : undefined,
    autoComplete,
  };
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required && <em className="not-italic text-navy"> *</em>}
      </span>
      {textarea ? <textarea {...common} rows={5} /> : <input {...common} type={type} />}
      {error && (
        <small id={errId} className="mt-2 block text-[13px] text-destructive">
          {error}
        </small>
      )}
    </label>
  );
}

/** Contact form with 4 tabs; submission goes through src/lib/prospects.ts into "prospects". */
export function ContactForm() {
  const [tab, setTab] = useState<LeadSource>("contact");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const form = useRef<HTMLFormElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + TABS.length) % TABS.length;
    setTab(TABS[n]!.key);
    tabsRef.current[n]?.focus();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null) ?? "";
    const file = (fd.get("fichier") as File | null) || null;
    const realFile = file && file.size > 0 ? file : null;
    const fileErr = validateFile(realFile);
    const nextErrors: Errors = {};
    if (fileErr) nextErrors["fichier"] = fileErr;
    if (!get("message").trim() && tab !== "recrutement")
      nextErrors["message"] = "Veuillez écrire votre message.";
    const payload = {
      source: tab,
      nom: get("nom"),
      email: get("email"),
      telephone: get("telephone"),
      societe: get("societe"),
      activite: get("activite"),
      quantite: get("quantite"),
      delai: get("delai"),
      message: get("message"),
      page_path: path,
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        nextErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const first = Object.keys(nextErrors)[0];
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    try {
      setState("sending");
      await submitLead(payload, realFile);
      setErrors({});
      setState("done");
      form.current?.reset();
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div
        className="flex min-h-[520px] flex-col items-start justify-center"
        role="status"
        aria-live="polite"
      >
        <svg viewBox="0 0 120 120" className="mb-10 size-28" aria-hidden="true">
          <path
            d="M60 6 L114 60 L60 114 L6 60 Z"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            pathLength={1}
            strokeDasharray="1 1"
            className="motion-safe:animate-[fil-casse_1.2s_cubic-bezier(.7,0,.3,1)_both]"
          />
          <path
            d="M40 61 L54 75 L82 45"
            fill="none"
            stroke="var(--navy)"
            strokeWidth="2"
            pathLength={1}
            strokeDasharray="1 1"
            className="motion-safe:animate-[fil-casse_1s_.6s_cubic-bezier(.7,0,.3,1)_both]"
          />
        </svg>
        <p className="display display-m text-navy">Votre demande a bien été transmise.</p>
        <button type="button" onClick={() => setState("idle")} className="btn-line mt-10 text-navy">
          Nouveau message
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Objet"
        className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls="contact-panel"
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={cn(
              "label relative -mb-px pb-4 transition-colors",
              tab === t.key
                ? "text-navy after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-navy"
                : "text-mute hover:text-navy",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        ref={form}
        id="contact-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        noValidate
        onSubmit={onSubmit}
        className="grid gap-x-8 gap-y-7 sm:grid-cols-2"
      >
        <Field name="nom" label="Nom" required error={errors["nom"]} autoComplete="name" />
        <Field
          name="email"
          label="Email"
          type="email"
          error={errors["email"]}
          autoComplete="email"
        />
        <Field
          name="telephone"
          label="Téléphone"
          type="tel"
          error={errors["telephone"]}
          autoComplete="tel"
        />
        {tab !== "contact" && (
          <Field
            name="societe"
            label="Société"
            error={errors["societe"]}
            autoComplete="organization"
          />
        )}
        {tab === "devis" && (
          <>
            <Field name="activite" label="Activité" error={errors["activite"]} />
            <Field name="quantite" label="Quantité" error={errors["quantite"]} />
            <Field name="delai" label="Délai" error={errors["delai"]} />
          </>
        )}
        <div className="sm:col-span-2">
          <Field
            name="message"
            label="Votre message"
            textarea
            required={tab !== "recrutement"}
            error={errors["message"]}
          />
        </div>
        {(tab === "recrutement" || tab === "devis") && (
          <label className="field sm:col-span-2">
            <span>{tab === "recrutement" ? "CV" : "Fichier"}</span>
            <input
              name="fichier"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="!border-dashed file:mr-4 file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:tracking-widest file:text-cotton file:uppercase"
              aria-invalid={!!errors["fichier"] || undefined}
            />
            {errors["fichier"] && (
              <small className="mt-2 block text-[13px] text-destructive">{errors["fichier"]}</small>
            )}
          </label>
        )}

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-gold !bg-navy !text-cotton hover:!bg-navy-deep disabled:opacity-60"
          >
            {state === "sending" ? "Envoi…" : "Envoyer"}
            <span className="size-2 rotate-45 bg-gold" aria-hidden="true" />
          </button>
          {state === "error" && (
            <p className="text-sm text-destructive" role="alert">
              Envoi impossible pour le moment.{" "}
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                WhatsApp
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
