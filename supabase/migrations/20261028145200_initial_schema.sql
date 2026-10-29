-- Nooree Afghan Carpet initial schema.
-- Safe for an empty Supabase project; this migration does not drop or rewrite
-- existing application data. Apply once through the Supabase SQL Editor.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (pg_catalog.char_length(full_name) <= 160),
  phone text check (phone is null or pg_catalog.char_length(phone) <= 40),
  preferred_locale text not null default 'en'
    check (preferred_locale in ('en', 'fa-AF', 'ps-AF')),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  recipient_name text not null check (pg_catalog.char_length(recipient_name) between 1 and 160),
  phone text not null check (pg_catalog.char_length(phone) between 1 and 40),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  region text not null check (pg_catalog.char_length(region) between 1 and 120),
  city text not null check (pg_catalog.char_length(city) between 1 and 120),
  address_line1 text not null check (pg_catalog.char_length(address_line1) between 1 and 240),
  address_line2 text check (address_line2 is null or pg_catalog.char_length(address_line2) <= 240),
  postal_code text check (postal_code is null or pg_catalog.char_length(postal_code) <= 32),
  delivery_instructions text
    check (delivery_instructions is null or pg_catalog.char_length(delivery_instructions) <= 500),
  is_default boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create unique index addresses_one_default_per_profile
  on public.addresses (profile_id) where is_default;
create index addresses_profile_created_idx
  on public.addresses (profile_id, created_at desc);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  locale text not null check (locale in ('en', 'fa-AF', 'ps-AF')),
  name text not null check (pg_catalog.char_length(name) between 1 and 160),
  description text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  unique (category_id, locale)
);

create index category_translations_locale_idx
  on public.category_translations (locale, category_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  sku text not null unique check (pg_catalog.char_length(sku) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  price_afn bigint not null check (price_afn >= 0),
  compare_at_price_afn bigint check (compare_at_price_afn is null or compare_at_price_afn >= price_afn),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  dimensions text check (dimensions is null or pg_catalog.char_length(dimensions) <= 120),
  material text check (material is null or pg_catalog.char_length(material) <= 160),
  origin_country_code text check (origin_country_code is null or origin_country_code ~ '^[A-Z]{2}$'),
  is_handmade boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create index products_category_status_idx on public.products (category_id, status);
create index products_status_created_idx on public.products (status, created_at desc);
create index products_published_price_idx on public.products (price_afn) where status = 'published';

create table public.product_translations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  locale text not null check (locale in ('en', 'fa-AF', 'ps-AF')),
  name text not null check (pg_catalog.char_length(name) between 1 and 200),
  description text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  unique (product_id, locale)
);

create index product_translations_locale_idx
  on public.product_translations (locale, product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null unique check (pg_catalog.char_length(storage_path) between 1 and 1024),
  alt_text text not null default '' check (pg_catalog.char_length(alt_text) <= 300),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  unique (product_id, sort_order)
);

create unique index product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;
create index product_images_product_order_idx
  on public.product_images (product_id, sort_order);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  movement_type text not null
    check (movement_type in ('receipt', 'sale', 'return', 'adjustment', 'reservation_release')),
  quantity_change integer not null check (quantity_change <> 0),
  reference text check (reference is null or pg_catalog.char_length(reference) <= 200),
  idempotency_key text unique check (idempotency_key is null or pg_catalog.char_length(idempotency_key) <= 200),
  note text check (note is null or pg_catalog.char_length(note) <= 1000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  check (
    (movement_type in ('receipt', 'return', 'reservation_release') and quantity_change > 0)
    or movement_type = 'adjustment'
    or (movement_type = 'sale' and quantity_change < 0)
  )
);

create index inventory_movements_product_created_idx
  on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_reference_idx
  on public.inventory_movements (reference) where reference is not null;

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique check (country_code ~ '^[A-Z]{2}$'),
  rate_afn bigint not null check (rate_afn >= 0),
  is_active boolean not null default true,
  notes text check (notes is null or pg_catalog.char_length(notes) <= 500),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.cod_areas (
  id uuid primary key default gen_random_uuid(),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  region text check (region is null or pg_catalog.char_length(region) <= 120),
  city text check (city is null or pg_catalog.char_length(city) <= 120),
  postal_prefix text check (postal_prefix is null or pg_catalog.char_length(postal_prefix) <= 32),
  is_active boolean not null default true,
  notes text check (notes is null or pg_catalog.char_length(notes) <= 500),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (region is not null or city is not null or postal_prefix is not null)
);

create index cod_areas_active_country_idx on public.cod_areas (country_code) where is_active;
create index cod_areas_location_idx on public.cod_areas (country_code, region, city);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (pg_catalog.char_length(order_number) between 1 and 40),
  profile_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text not null check (payment_method in ('cash_on_delivery', 'online')),
  currency text not null default 'AFN' check (currency = 'AFN'),
  subtotal_afn bigint not null check (subtotal_afn >= 0),
  shipping_fee_afn bigint not null check (shipping_fee_afn >= 0),
  discount_afn bigint not null default 0 check (discount_afn >= 0),
  total_afn bigint not null check (total_afn >= 0),
  shipping_rate_id uuid references public.shipping_rates (id) on delete set null,
  cod_area_id uuid references public.cod_areas (id) on delete set null,
  shipping_address jsonb not null check (pg_catalog.jsonb_typeof(shipping_address) = 'object'),
  customer_note text check (customer_note is null or pg_catalog.char_length(customer_note) <= 2000),
  admin_note text check (admin_note is null or pg_catalog.char_length(admin_note) <= 2000),
  placed_at timestamptz not null default pg_catalog.now(),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (discount_afn <= subtotal_afn),
  check (total_afn = subtotal_afn + shipping_fee_afn - discount_afn),
  check (
    (payment_method = 'cash_on_delivery' and cod_area_id is not null)
    or payment_method = 'online'
  )
);

create index orders_profile_placed_idx on public.orders (profile_id, placed_at desc);
create index orders_status_placed_idx on public.orders (status, placed_at desc);
create index orders_cod_area_idx on public.orders (cod_area_id) where cod_area_id is not null;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_sku text not null check (pg_catalog.char_length(product_sku) between 1 and 80),
  product_name text not null check (pg_catalog.char_length(product_name) between 1 and 200),
  quantity integer not null check (quantity > 0),
  unit_price_afn bigint not null check (unit_price_afn >= 0),
  line_total_afn bigint generated always as (quantity::bigint * unit_price_afn) stored,
  created_at timestamptz not null default pg_catalog.now()
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id) where product_id is not null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  provider text not null check (provider in ('cash_on_delivery', 'manual', 'other')),
  status text not null default 'pending'
    check (status in ('pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled')),
  amount_afn bigint not null check (amount_afn >= 0),
  provider_reference text unique
    check (provider_reference is null or pg_catalog.char_length(provider_reference) <= 200),
  paid_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create index payments_order_created_idx on public.payments (order_id, created_at desc);
create index payments_status_created_idx on public.payments (status, created_at desc);

create table public.custom_inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  name text not null check (pg_catalog.char_length(name) between 1 and 160),
  email text not null check (pg_catalog.char_length(email) between 3 and 320),
  phone text check (phone is null or pg_catalog.char_length(phone) <= 40),
  locale text not null default 'en' check (locale in ('en', 'fa-AF', 'ps-AF')),
  details text not null check (pg_catalog.char_length(details) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'closed')),
  admin_notes text check (admin_notes is null or pg_catalog.char_length(admin_notes) <= 3000),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create index custom_inquiries_profile_created_idx
  on public.custom_inquiries (profile_id, created_at desc);
create index custom_inquiries_status_created_idx
  on public.custom_inquiries (status, created_at desc);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null check (pg_catalog.char_length(name) between 1 and 160),
  email text not null check (pg_catalog.char_length(email) between 3 and 320),
  subject text not null check (pg_catalog.char_length(subject) between 1 and 200),
  message text not null check (pg_catalog.char_length(message) between 1 and 5000),
  locale text not null default 'en' check (locale in ('en', 'fa-AF', 'ps-AF')),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  admin_notes text check (admin_notes is null or pg_catalog.char_length(admin_notes) <= 3000),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create index contact_messages_profile_created_idx
  on public.contact_messages (profile_id, created_at desc);
create index contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create table public.translations (
  id uuid primary key default gen_random_uuid(),
  namespace text not null check (pg_catalog.char_length(namespace) between 1 and 100),
  translation_key text not null check (pg_catalog.char_length(translation_key) between 1 and 200),
  locale text not null check (locale in ('en', 'fa-AF', 'ps-AF')),
  value text not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  unique (namespace, translation_key, locale)
);

create index translations_locale_namespace_idx on public.translations (locale, namespace);

create table public.business_settings (
  key text primary key check (pg_catalog.char_length(key) between 1 and 100),
  value jsonb not null,
  is_public boolean not null default false,
  description text check (description is null or pg_catalog.char_length(description) <= 500),
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    pg_catalog.left(
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      160
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and not (select public.is_admin())
    and coalesce((select auth.role()), '') <> 'service_role'
    and coalesce(
      pg_catalog.current_setting('nooree.allow_profile_role_change', true),
      ''
    ) <> 'on'
  then
    raise exception 'Only an administrator can change profile roles'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update of role on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.products
  set stock_quantity = stock_quantity + new.quantity_change
  where id = new.product_id
    and stock_quantity + new.quantity_change >= 0;

  if not found then
    raise exception 'Inventory movement would make stock negative or product is missing'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger inventory_movement_apply
  after insert on public.inventory_movements
  for each row execute function public.apply_inventory_movement();

create or replace function public.prevent_inventory_movement_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Inventory movements are immutable; record a correcting movement instead'
    using errcode = '42501';
end;
$$;

create trigger inventory_movement_immutable
  before update or delete on public.inventory_movements
  for each row execute function public.prevent_inventory_movement_mutation();

create or replace function public.is_cod_available(
  p_country_code text,
  p_region text,
  p_city text,
  p_postal_code text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cod_areas as ca
    where ca.is_active
      and ca.country_code = pg_catalog.upper(pg_catalog.btrim(p_country_code))
      and (ca.region is null or pg_catalog.lower(ca.region) = pg_catalog.lower(pg_catalog.btrim(p_region)))
      and (ca.city is null or pg_catalog.lower(ca.city) = pg_catalog.lower(pg_catalog.btrim(p_city)))
      and (
        ca.postal_prefix is null
        or (
          p_postal_code is not null
          and pg_catalog.upper(pg_catalog.btrim(p_postal_code))
            like pg_catalog.upper(ca.postal_prefix) || '%'
        )
      )
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
revoke all on function public.is_cod_available(text, text, text, text) from public;
grant execute on function public.is_cod_available(text, text, text, text)
  to anon, authenticated, service_role;

create or replace function public.set_profile_admin_role(
  p_profile_id uuid,
  p_make_admin boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_profile_id is null or p_make_admin is null then
    raise exception 'Profile ID and administrator status are required'
      using errcode = '22004';
  end if;

  if coalesce((select auth.role()), '') <> 'service_role'
    and session_user not in ('postgres', 'supabase_admin')
  then
    raise exception 'Only a trusted project operator can change administrator access'
      using errcode = '42501';
  end if;

  perform pg_catalog.set_config('nooree.allow_profile_role_change', 'on', true);
  update public.profiles
  set role = case when p_make_admin then 'admin' else 'customer' end
  where id = p_profile_id;

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  perform pg_catalog.set_config('nooree.allow_profile_role_change', 'off', true);
end;
$$;

revoke all on function public.set_profile_admin_role(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_profile_admin_role(uuid, boolean) to service_role;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger category_translations_set_updated_at before update on public.category_translations
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_translations_set_updated_at before update on public.product_translations
  for each row execute function public.set_updated_at();
create trigger shipping_rates_set_updated_at before update on public.shipping_rates
  for each row execute function public.set_updated_at();
create trigger cod_areas_set_updated_at before update on public.cod_areas
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create trigger custom_inquiries_set_updated_at before update on public.custom_inquiries
  for each row execute function public.set_updated_at();
create trigger contact_messages_set_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();
create trigger translations_set_updated_at before update on public.translations
  for each row execute function public.set_updated_at();
create trigger business_settings_set_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.cod_areas enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.custom_inquiries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.translations enable row level security;
alter table public.business_settings enable row level security;

create policy "Profiles readable by owner or admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Profiles updateable by owner or admin"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "Addresses manageable by owner"
  on public.addresses for all to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()))
  with check (profile_id = (select auth.uid()) or (select public.is_admin()));

create policy "Active categories are public"
  on public.categories for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins manage categories"
  on public.categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Translations for active categories are public"
  on public.category_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.categories c
      where c.id = category_id and (c.is_active or (select public.is_admin()))
    )
  );
create policy "Admins manage category translations"
  on public.category_translations for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Published products are public"
  on public.products for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));
create policy "Admins manage products"
  on public.products for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Translations for published products are public"
  on public.product_translations for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.status = 'published' or (select public.is_admin()))
    )
  );
create policy "Admins manage product translations"
  on public.product_translations for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Images for published products are public"
  on public.product_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.status = 'published' or (select public.is_admin()))
    )
  );
create policy "Admins manage product images"
  on public.product_images for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins read inventory movements"
  on public.inventory_movements for select to authenticated
  using ((select public.is_admin()));
create policy "Admins insert inventory movements"
  on public.inventory_movements for insert to authenticated
  with check ((select public.is_admin()));

create policy "Active shipping rates are public"
  on public.shipping_rates for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins manage shipping rates"
  on public.shipping_rates for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Active COD areas are public"
  on public.cod_areas for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins manage COD areas"
  on public.cod_areas for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Customers read own orders"
  on public.orders for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins manage orders"
  on public.orders for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Customers read own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.profile_id = (select auth.uid()) or (select public.is_admin()))
    )
  );
create policy "Admins manage order items"
  on public.order_items for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Customers read own payments"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.profile_id = (select auth.uid()) or (select public.is_admin()))
    )
  );
create policy "Admins manage payments"
  on public.payments for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Submit custom inquiries"
  on public.custom_inquiries for insert to anon, authenticated
  with check (
    status = 'new'
    and admin_notes is null
    and (profile_id is null or profile_id = (select auth.uid()))
  );
create policy "Customers read own inquiries"
  on public.custom_inquiries for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins manage inquiries"
  on public.custom_inquiries for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (
    status = 'new'
    and admin_notes is null
    and (profile_id is null or profile_id = (select auth.uid()))
  );
create policy "Customers read own contact messages"
  on public.contact_messages for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins manage contact messages"
  on public.contact_messages for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Public UI translations are readable"
  on public.translations for select to anon, authenticated
  using (true);
create policy "Admins manage UI translations"
  on public.translations for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Public business settings are readable"
  on public.business_settings for select to anon, authenticated
  using (is_public or (select public.is_admin()));
create policy "Admins manage business settings"
  on public.business_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
