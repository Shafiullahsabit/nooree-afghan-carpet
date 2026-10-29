# Nooree Afghan Carpet

Customer-facing multilingual storefront foundation for Nooree Afghan Carpet.
## Stack

- Next.js App Router with JavaScript (JSX), React, and Tailwind CSS
- Supabase PostgreSQL, Auth, and Storage integration
- English (`en`), Dari (`fa-AF`), and Pashto (`ps-AF`) storefronts with LTR/RTL layout
- AFN product prices and configured shipping-rate display

## Getting started

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. In the Supabase Dashboard, open **Project Settings → API** and copy your
   Project URL and publishable key (or legacy anon key) into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
   `.env.local`.
5. Start the development server with `npm run dev`.

The optional product-image bucket and business phone, WhatsApp, and location
values are configured with the matching blank entries in `.env.example`.
Leave unknown business details blank rather than publishing placeholders.

Never put a database password, service-role key, or other secret in a
`NEXT_PUBLIC_` variable or commit it to Git. `.env.local` is ignored.

## Database setup

The initial PostgreSQL schema is in
[`supabase/migrations/20261028145200_initial_schema.sql`](./supabase/migrations/20261028145200_initial_schema.sql).
It creates tables, indexes, triggers, helper functions, and Row Level Security
policies; it does not migrate or overwrite existing data. The separate
[`supabase/seed/development.sql`](./supabase/seed/development.sql) contains
optional sample development data. **Do not run the seed against production.**

To apply the schema through the Supabase SQL Editor:

1. Open the intended project in the Supabase Dashboard and confirm its project
   name before running SQL.
2. Open **SQL Editor → New query**.
3. Open the migration file above in this repository, copy its entire contents,
   paste them into the query, and click **Run**.
4. Confirm the query succeeds. In **Table Editor**, verify the `public`
   tables, and confirm RLS is enabled on each application table.
5. Only for a development project, open a second SQL Editor query, paste the
   entire contents of `supabase/seed/development.sql`, and click **Run**.

These are instructions only: no Supabase project has been connected, and no
migration or seed has been run. SQL Editor execution does not register the
migration in the Supabase CLI migration history.

New customer accounts use Supabase Auth. The database creates their `profiles`
row from the Auth user ID. The migration does not grant admin roles or create
Auth users. To promote an existing Auth user from the Supabase SQL Editor,
copy their UUID from **Authentication → Users**, then run:

```sql
select public.set_profile_admin_role('AUTH_USER_UUID'::uuid, true);
```

Only the project database operator and `service_role` can execute this
privileged function. Do not expose the service-role key to browser code.

Order, order-item, payment, and inventory writes are intentionally restricted
to administrators or trusted server-side code. Checkout therefore fails
closed: this storefront does not create orders or claim payment success. A
future checkout endpoint needs a trusted atomic operation that validates stock,
AFN prices, the selected fixed shipping rate, and COD location before creating
an order and recording inventory movements. The seed's sample carrier rates
and COD areas are illustrative and must be verified before use.

## Project structure

```text
src/
  app/
    (entry)/             Root route and default-locale redirect
    (localized)/         Localized homepage and page-specific customer routes
    api/cart/             Server-side cart revalidation endpoint
  components/            Shared shell, page routing, and UI
  features/
    account/             Customer profile and address actions
    auth/                Supabase Auth actions
    cart/                Local cart and product actions
    checkout/            Explicit checkout-unavailable state
    contact/             Contact message action
    custom-orders/       Custom inquiry action
    home/                Independent homepage sections
    products/            Catalog queries and product cards
    storage/             Public product-image URL helper
  i18n/messages/         English, Dari, and Pashto messages
  lib/supabase/          Server client and Auth helper
  services/              Shipping-rate and COD eligibility queries
  hooks/                 Shared cart hook
  lib/sample-products.js Clearly labeled development sample products
supabase/
  migrations/            PostgreSQL schema migrations (already verified)
  seed/                  Development-only sample data
```

The storefront routes are `/en`, `/fa-AF`, and `/ps-AF`; their document language
and text direction are set per locale. Each customer-facing URL has its own
App Router `page.jsx` entry under `src/app/(localized)/[locale]/`, including
the catalog, product detail, collections, heritage, carpet care, cart,
checkout-unavailable state, Auth, customer profile, addresses, order list and
details, custom inquiry, contact, shipping rates, policy pages, and safe
order/payment status states. The homepage entry is
`src/app/(localized)/[locale]/page.jsx`. Shared customer rendering and layout
are kept in components so individual pages can be refined without duplicating
the common shell.
The homepage is composed from separate components for the hero, categories,
offers, carpet overview, and featured collection. Its navigation includes
Home, Categories, Offers, Carpet Overview, Collection, search, account, and
cart controls. Search expands when selected, and the language control opens
English, Dari, and Pashto choices while preserving the current route. On small
screens, navigation collapses into an accessible menu. Category links use
published localized categories; Offers currently reports when no configured
offer is available rather than inventing discounts.

Products and customer data load from Supabase using the public anon key and
existing RLS policies. Cart contents store only product IDs and quantities in
the browser; names, price, and stock are revalidated server-side from published
catalog data. `price_afn = 0` is the agreed storefront convention for
price-on-request products; the verified database schema has no separate flag.
Images load only when a public Storage bucket is configured.

Customer Auth and RLS-backed profile, address, contact, and inquiry operations
are implemented but require a configured Supabase project and have not been
verified against a live deployment here. The customer-facing checkout remains
disabled because the verified schema policies provide no safe customer order
creation transaction. No online payment provider is configured, and the UI
never reports a payment as verified.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

Before launch, configure Supabase Auth redirect/email settings, confirm that
the product-image bucket is public if used, publish reviewed legal policies,
provide verified business contact details, configure real shipping/COD data,
and implement an atomic, server-trusted checkout plus a payment provider.
