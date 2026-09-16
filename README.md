# Wishlist App

A personal wishlist site: add gift ideas, share the link with family and
friends so they know what to get you, and keep a running list of things you
want instead of a bookmarks folder.

Built with Next.js (App Router, TypeScript, Tailwind CSS) and a local SQLite
database via `better-sqlite3`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

The SQLite database lives at `data/wishlist.db` and is created automatically
on first run (the file itself is gitignored).

## Project structure

- `src/app/page.tsx` — home page listing wishlist items with an add form
- `src/app/api/items/route.ts` — list/create items
- `src/app/api/items/[id]/route.ts` — delete an item
- `src/lib/db.ts` — SQLite connection + schema setup
- `src/lib/items.ts` — data access helpers

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
