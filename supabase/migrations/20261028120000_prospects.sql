-- Leads shared by the contact form (src/lib/prospects.ts) and the chatbot (functions/chat).
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('chatbot', 'contact', 'devis', 'partenariat', 'recrutement')),
  nom text not null check (char_length(nom) between 2 and 120),
  societe text check (char_length(societe) <= 500),
  telephone text check (char_length(telephone) <= 40),
  email text check (char_length(email) <= 254),
  activite text check (char_length(activite) <= 500),
  besoin text check (char_length(besoin) <= 4000),
  quantite text check (char_length(quantite) <= 500),
  delai text check (char_length(delai) <= 500),
  message text check (char_length(message) <= 5000),
  file_url text check (char_length(file_url) <= 500),
  page_path text check (char_length(page_path) <= 300),
  conversation jsonb,
  constraint prospects_contact_present check (telephone is not null or email is not null)
);

create index if not exists prospects_created_at_idx on public.prospects (created_at desc);

-- RLS: anonymous visitors may INSERT only. No SELECT/UPDATE/DELETE policies → nobody can read
-- leads with the publishable key; read them from the dashboard (service role).
alter table public.prospects enable row level security;

drop policy if exists "prospects_insert_anon" on public.prospects;
create policy "prospects_insert_anon"
  on public.prospects
  for insert
  to anon, authenticated
  with check (true);

revoke select, update, delete on public.prospects from anon, authenticated;
grant insert on public.prospects to anon, authenticated;

-- Private storage bucket for attachments (CV, briefs). Insert-only for visitors.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

drop policy if exists "uploads_insert_anon" on storage.objects;
create policy "uploads_insert_anon"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'uploads');
