# Wishlist App

A personal wishlist site: add gift ideas, share the link with family and
friends so they know what to get you, and keep a running list of things you
want instead of a bookmarks folder.

Built with Next.js (App Router, TypeScript, Tailwind CSS) and a local SQLite
database via `better-sqlite3`.

## Getting Started

```bash
cp .env.local.example .env.local
# edit .env.local: set ADMIN_PASSWORD, and AUTH_SECRET (openssl rand -hex 32)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

The SQLite database lives at `data/wishlist.db` and is created automatically
on first run (the file itself is gitignored).

## Access control

Anyone can view the wishlist — that's the point, so family and friends can
browse for gift ideas. Only whoever is signed in (via `/login`, using
`ADMIN_PASSWORD`) can add, edit, or remove items. The session is a signed
httpOnly cookie; there's no user database, just the one shared password.

## Project structure

- `src/app/page.tsx` — home page listing wishlist items with an add form
- `src/app/login/page.tsx` — sign-in page for the owner
- `src/app/api/items/route.ts` — list/create items (create requires auth)
- `src/app/api/items/[id]/route.ts` — update/delete an item (requires auth)
- `src/app/api/login/route.ts`, `src/app/api/logout/route.ts` — session endpoints
- `src/lib/auth.ts` — password check + session cookie helpers
- `src/lib/db.ts` — SQLite connection + schema setup
- `src/lib/items.ts` — data access helpers

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
