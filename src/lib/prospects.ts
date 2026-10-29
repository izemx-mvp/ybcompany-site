import { z } from "zod";

/**
 * Leads ("prospects") — shared by the contact form and the chatbot.
 *
 * Writes go straight to Lovable Cloud / Supabase over REST with the publishable key
 * (RLS allows anonymous INSERT only, see supabase/migrations/*_prospects.sql).
 * When the backend is not configured the lead is logged and the UI still succeeds.
 */

export const LEAD_SOURCES = ["chatbot", "contact", "devis", "partenariat", "recrutement"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

const optional = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const leadSchema = z
  .object({
    source: z.enum(LEAD_SOURCES),
    nom: z.string().trim().min(2, "Veuillez indiquer votre nom.").max(120),
    societe: optional,
    telephone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s.()-]{7,}$/, "Numéro de téléphone invalide.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    email: z
      .string()
      .trim()
      .email("Adresse e-mail invalide.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    activite: optional,
    besoin: z.string().trim().max(4000).optional(),
    quantite: optional,
    delai: optional,
    message: z.string().trim().max(5000).optional(),
    page_path: z.string().max(300).optional(),
    conversation: z.unknown().optional(),
  })
  .refine((v) => !!(v.telephone || v.email), {
    message: "Indiquez au moins un téléphone ou un e-mail.",
    path: ["email"],
  });

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

export type BackendConfig = { url: string; key: string } | null;

export function backendConfig(): BackendConfig {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env["VITE_SUPABASE_URL"];
  const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_ANON_KEY"];
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

const MAX_FILE = 10 * 1024 * 1024;
const FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function validateFile(file: File | null | undefined): string | null {
  if (!file) return null;
  if (file.size > MAX_FILE) return "Fichier trop volumineux (10 Mo maximum).";
  if (file.type && !FILE_TYPES.includes(file.type))
    return "Format accepté : PDF, Word, JPG, PNG ou WebP.";
  return null;
}

async function uploadFile(cfg: NonNullable<BackendConfig>, file: File): Promise<string> {
  const safe = file.name
    .normalize("NFD")
    .replace(/[^\w.-]+/g, "-")
    .slice(-80);
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;
  const res = await fetch(`${cfg.url}/storage/v1/object/uploads/${path}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });
  if (!res.ok) throw new Error(`upload ${res.status}`);
  return `uploads/${path}`;
}

/** Validates and stores a lead. Returns `stored: false` when no backend is configured. */
export async function submitLead(
  input: LeadInput,
  file?: File | null,
): Promise<{ ok: true; stored: boolean }> {
  const lead = leadSchema.parse(input);
  const cfg = backendConfig();
  if (!cfg) {
    console.info("[leads] Backend non configuré — prospect non enregistré :", {
      ...lead,
      file: file?.name,
    });
    return { ok: true, stored: false };
  }
  const file_url = file ? await uploadFile(cfg, file) : undefined;
  const res = await fetch(`${cfg.url}/rest/v1/prospects`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...lead, file_url }),
  });
  if (!res.ok) throw new Error(`prospects ${res.status}: ${await res.text()}`);
  return { ok: true, stored: true };
}
