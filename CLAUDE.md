@AGENTS.md

# Wishlist App

Personal wishlist site: the owner adds gift ideas, shares the link with
family/friends who can browse (read-only) for gift ideas. Next.js App Router

- TypeScript + Tailwind CSS, SQLite via `better-sqlite3` (no ORM).

## Auth

Single shared password, not a user table. `src/lib/auth.ts`:

- `ADMIN_PASSWORD` (env) checked on `/login` (`src/app/login/page.tsx` ->
  `POST /api/login`).
- On success, sets an httpOnly session cookie whose value is
  `HMAC-SHA256(AUTH_SECRET, "wishlist-owner")` — a single deterministic
  token, not per-session state, so there's nothing to store server-side.
- `isAuthenticated()` (server-only, reads cookies via `next/headers`) gates
  every mutation: `POST /api/items`, `PATCH`/`DELETE /api/items/[id]`.
  `GET /api/items` and the home page are public.
- The "Sign in" link is intentionally not shown anywhere in the UI — `/login`
  is only reachable by navigating there directly.

Required env vars (`.env.local`, gitignored; template in
`.env.local.example`): `ADMIN_PASSWORD`, `AUTH_SECRET` (`openssl rand -hex
32`).

## Data layer

- `src/lib/db.ts` — single shared `better-sqlite3` connection (reused across
  hot reloads via `global.__wishlistDb`), WAL mode. Schema changes are
  additive `ALTER TABLE ... ADD COLUMN`, guarded by checking
  `PRAGMA table_info` first (better-sqlite3 has no migration framework) —
  follow that pattern for future schema changes rather than dropping/
  recreating the table.
- `src/lib/items.ts` — `WishlistItem` type + `getAllItems`/`addItem`/
  `updateItem`/`deleteItem`. `normalizeUrl` prepends `https://` when a URL
  has no protocol (bare domains like `www.example.com` would otherwise
  resolve as a relative path on the current host).
- DB file lives at `data/wishlist.db` (gitignored). Deleting it resets to
  empty; the schema/migrations re-run on next request.

## Categories

Free-text field on items, no separate categories table — the set of
available categories (for the filter dropdown and the add/edit forms'
`<datalist>` autocomplete) is derived dynamically as the distinct
`category` values currently in use. A category stops appearing once no
item uses it anymore; there's no way to pre-register one with zero items
without changing this to a fixed/maintained list.

## Product images

`src/lib/scrape-image.ts` fetches the item's link server-side (5s timeout)
and pulls `og:image`, falling back to `twitter:image`. Only the resulting
image URL is stored (`image_url` column) — nothing is downloaded or
hosted. Runs on every add/edit that has a URL; a changed URL re-scrapes
(and clears the thumbnail if the new page has neither tag). Cards render
images with a plain `<img>` (not `next/image`, since source domains are
arbitrary and can't be allow-listed) with `loading="lazy"` and an
`onError` fallback to `/placeholder.svg`.

## Wishlist UI

`src/components/WishlistList.tsx` owns sort, category filter, and lazy-load
pagination together:

- Sort and filter are client-side (`useState` + `useMemo`), not query
  params — sorting/filtering never hits the network.
- Pagination renders `PAGE_SIZE=12` cards at a time, growing via an
  `IntersectionObserver` on a sentinel div. Resetting the visible count on
  sort/filter change is done as a render-time state adjustment (comparing
  against a `prevKey` state), not inside a `useEffect` — the ESLint
  `react-hooks/set-state-in-effect` rule flags synchronous `setState`
  in effects, and this is React's documented alternative.
- `WishlistCard.tsx` is the read-only card; `EditItemForm.tsx` swaps in
  for the card being edited (same grid cell).

## Dev workflow

- `npm run dev` — this repo's `.git` is nested inside a shared `NextJS/`
  folder alongside sibling projects (`inventory-management-system`,
  `next-auth-app`, etc.) that may already have a dev server on :3000; Next
  auto-increments to the next free port, so check the terminal output
  (or `ps aux | grep next-server`) rather than assuming :3000. Never kill
  a `next dev`/`next-server` process without confirming which project's
  PID it is first — sibling projects' dev servers are not this repo's to
  stop.
- No automated test suite. Verification has been manual: `npm run lint`,
  `npm run build`, curl smoke tests against the running dev server, and
  the `claude-in-chrome` skill for visual/interactive checks.
- Seeding local test data: insert directly into `data/wishlist.db` (e.g.
  via `sqlite3` or a throwaway Python script) rather than looping the
  add API — looping would trigger a real `scrapeImageUrl` fetch per item.

## Deployment

SQLite needs a persistent disk, so this doesn't drop straight onto
serverless hosts (e.g. Vercel) without swapping `better-sqlite3` for
something like Turso/LibSQL.

Deployed via Docker (see `Dockerfile`, `docker-compose.yml`, README's
"Deploying with Docker" section) — built and runtime-tested locally
(build, run, restart, and full container recreation against a mounted
volume) before being handed off. `next.config.ts` has `output: "standalone"`
for this. Two non-obvious fixes baked into the Dockerfile, both found by
actually running the build rather than assuming it would work:
- `better-sqlite3` bundles prebuilt binaries for every platform, but (a)
  it also has a `binding.gyp` with no custom install script, so npm's
  default behavior still runs `node-gyp rebuild` on `npm ci` regardless —
  needs `python3 make g++` in the deps stage's `apk add` even though the
  compiled output goes unused, and (b) Next's standalone output tracing
  can't follow the runtime `process.platform`/`arch` detection used to
  pick which prebuild to load, so it only bundles whichever single one
  happened to run during `next build` (the build machine's platform, not
  the container's) — the Dockerfile re-copies the full untraced
  `node_modules/better-sqlite3` from the deps stage to fix this.
- `src/lib/db.ts` opens the database as a module-level side effect, which
  Next executes during `next build`'s page-data collection for the API
  routes — it now `fs.mkdirSync`s the data directory first (also just a
  general robustness fix: better-sqlite3 won't create missing parent
  directories on its own).

The `data` directory must be a mounted volume — without one, every
container rebuild/redeploy wipes the wishlist. `ADMIN_PASSWORD`/`AUTH_SECRET`
are passed as container env vars, never baked into the image.

## Git workflow

Never `git commit` or `git push` in this repo unless the user explicitly
asks for it in that turn — implement and verify the change, then stop and
leave it staged/unstaged for review. Do not assume a prior "commit and
push" instruction carries forward to later changes in the same
conversation; ask or wait each time.

## Repo

Pushed to https://github.com/PinkTaco97/wishlist-app (public). `gh` is
authenticated as `PinkTaco97` in this environment.
