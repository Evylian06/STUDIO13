-- Studio 13 — ejecutar en Supabase → SQL Editor
-- Datos de galería. Las imágenes viven en Cloudinary (storage_path = public_id).
-- El bucket gallery-images es opcional (legado); el flujo actual usa solo Cloudinary.

-- Tabla principal de galería
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('studio13', 'colorimetria')),
  category text not null default 'general',
  title text not null,
  description text default '',
  tag text default '',
  technique text default '',
  artist text default '',
  image_url text not null,
  storage_path text not null,
  layout text default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_section_idx on public.gallery_items (section, published, sort_order);

-- Permisos base para que RLS pueda aplicar sus políticas.
-- Sin estos GRANT, Supabase devuelve "permission denied for table gallery_items".
grant usage on schema public to anon, authenticated;
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

-- Actualizar updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gallery_items_updated_at on public.gallery_items;
create trigger gallery_items_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

-- RLS
alter table public.gallery_items enable row level security;

drop policy if exists "Público ve publicados" on public.gallery_items;
create policy "Público ve publicados"
  on public.gallery_items for select
  using (published = true);

drop policy if exists "Admin ve todo" on public.gallery_items;
create policy "Admin ve todo"
  on public.gallery_items for select
  to authenticated
  using (true);

drop policy if exists "Admin inserta" on public.gallery_items;
create policy "Admin inserta"
  on public.gallery_items for insert
  to authenticated
  with check (true);

drop policy if exists "Admin actualiza" on public.gallery_items;
create policy "Admin actualiza"
  on public.gallery_items for update
  to authenticated
  using (true);

drop policy if exists "Admin elimina" on public.gallery_items;
create policy "Admin elimina"
  on public.gallery_items for delete
  to authenticated
  using (true);

-- Bucket de imágenes (público para lectura en la web)
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do update set public = true;

-- Storage: lectura pública
drop policy if exists "Imágenes públicas" on storage.objects;
create policy "Imágenes públicas"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

-- Storage: solo admin autenticado sube/edita/borra
drop policy if exists "Admin sube imágenes" on storage.objects;
create policy "Admin sube imágenes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-images');

drop policy if exists "Admin actualiza imágenes" on storage.objects;
create policy "Admin actualiza imágenes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery-images');

drop policy if exists "Admin borra imágenes" on storage.objects;
drop policy if exists "Admin elimina imágenes" on storage.objects;
create policy "Admin elimina imágenes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery-images');
