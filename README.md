# Nooree Afghan Carpet

An Afghan shop for buying and selling carpets.

## Stack

- Next.js App Router with JavaScript (JSX)
- React
- Tailwind CSS
- Supabase PostgreSQL, authentication, and storage integration structure
- English, Dari, and Pashto localization structure

## Getting started

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and
   publishable/anon key.
4. Start the development server with `npm run dev`.

The local environment file is ignored by Git. Never commit credentials,
service-role keys, or other secrets. Public Supabase keys may be used in the
browser only when Row Level Security and appropriate policies are configured.

## Project structure

```text
src/
  app/                 App Router layouts and routes
    api/               Route-handler location for backend endpoints
  components/          Shared UI components
  features/
    auth/              Authentication feature location
    storage/           Supabase Storage feature location
  i18n/messages/       English, Dari (Afghanistan), and Pashto (Afghanistan)
  lib/supabase/        Shared Supabase integration location
supabase/migrations/   PostgreSQL migration location
```

The application route is intentionally an empty scaffold. No storefront pages
or authentication flows have been implemented yet.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
