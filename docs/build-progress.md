# SixDegrees — Build Progress

**Last updated**: 2026-04-03 (core users/auth DB schema + Zod types)
**Current phase**: Platform Build — Phase 1, Cycle 2 (in progress)
**Requirements site**: https://sixdegrees.link (live, M5 complete)
**Platform repo**: https://github.com/six-degrees-link/sixdegrees-platform

---

## Platform Build Phase Status

| Phase | Name | Target | Status |
|-------|------|--------|--------|
| P1-C1 | Project Setup | Apr 18 | ✅ Complete |
| P1-C2 | Foundation Hardening | May 2 | 🔄 In Progress |
| P2 | Identity and Profiles | May 30 | ⏳ Upcoming |
| P3 | Networking and Communication | Jul 25 | ⏳ Upcoming |
| P4 | Content and Discovery | Sep 19 | ⏳ Upcoming |
| P5 | Professional Features | Nov 14 | ⏳ Upcoming |
| P6 | Polish, Security and MVP Launch | Dec 19 | ⏳ Upcoming |

---

## Requirements Gathering Site — Milestone Status (COMPLETE)

| # | Name | Status |
|---|------|--------|
| M1 | Foundation & Setup | ✅ Complete |
| M2 | Requirements Website Live | ✅ Complete |
| M3 | AI-Powered Refinement | ✅ Complete |
| M4 | Community Review (Admin Moderation) | ✅ Complete |
| M5 | Consolidation & Export | ✅ Complete |

---

## Platform Build — What's Built

### P1-C1 — Project Setup ✅

**Monorepo scaffold**
- Turborepo monorepo at `sixdegrees-platform`
- `apps/web` — Next.js 16 App Router (TypeScript strict)
- `packages/ui` — shared React components (scaffolded, empty)
- `packages/types` — shared Zod schemas and TypeScript types (scaffolded, empty)
- `packages/utils` — shared utilities (scaffolded, empty)
- Root `turbo.json` with `build`, `dev`, `lint`, `test`, `type-check` task graph
- `packageManager: npm@11.12.1`, `engines: node >=20`

**Design system**
- Tailwind v4 (CSS-first, `@theme` block in `globals.css`)
- Inter Variable via `next/font/google` — injected as `--font-inter` CSS variable
- Full brand token set: `--color-brand-primary/light/dark`, `--color-brand-accent/light/dark`
- Semantic colors: success, warning, error, info
- Warm gray neutral palette: `neutral-50` through `neutral-900`
- Typography scale: `xs` through `4xl`, font weights regular/medium/semibold/bold
- Surface tokens with automatic dark mode via `@media (prefers-color-scheme: dark)`
- `--surface-page/raised/overlay/sunken`, `--text-primary/secondary/tertiary/link`, `--border-default/strong/focus`, `--interactive-primary/accent`

**Deployment**
- `vercel.json` — `outputDirectory: apps/web/.next`, uses local `./node_modules/.bin/turbo`
- `postcss.config.js` (CJS) — `@tailwindcss/postcss` plugin

**Supabase connection**
- `@supabase/supabase-js` + `@supabase/ssr` installed in `apps/web`
- `lib/supabase/client.ts` — `createClient()` for Client Components (`createBrowserClient`)
- `lib/supabase/server.ts` — `createClient()` async SSR client + `createServiceClient()` sync service-role client (bypasses RLS, no session persistence)
- `lib/supabase/middleware.ts` — `createMiddlewareClient()` helper wiring cookies to both request and response
- `proxy.ts` — Next.js 16 session refresh interceptor; exports `proxy` (not `middleware`) — Next.js 16 requires the function name to match the filename
- `packages/types/src/database.ts` — placeholder `Database` type (replace with `supabase gen types typescript` output once schema is applied)
- `packages/utils/src/result.ts` — `Result<T,E>`, `ok()`, `err()`, `fromSupabase()`, `fromSupabaseMaybe()`
- `.env.local.example` — all three Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

**Code quality tooling**
- `eslint.config.js` — ESLint v9 flat config; extends `eslint-config-next` + `@typescript-eslint/recommended` + `prettier`
- Rules enforced: `no-unused-vars` error, `no-explicit-any` error, `consistent-type-imports` error, `react-hooks/rules-of-hooks` error
- `.prettierrc` — `singleQuote`, `semi`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`
- `.editorconfig` — UTF-8, LF line endings, 2-space indent, final newline
- `.husky/pre-commit` — runs `lint-staged` on every commit
- `lint-staged` — ESLint `--fix` then Prettier on staged `.ts`/`.tsx` files
- Root scripts: `lint`, `lint:fix`, `format`, `format:check`

---

### P1-C2 — Foundation Hardening (in progress)

**Vercel deployment config**
- `vercel.json` — security headers at CDN layer: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation disabled)
- `next.config.ts` — same headers applied at Next.js server layer (defense in depth)
- `app/api/health/route.ts` — `GET /api/health` returns `{ status, timestamp, version }`
- `.env.production.example` — all required env vars documented (Supabase, app URL, Resend, Anthropic, admin emails)

**Core DB schema — Users and Auth** (SIX-53)
- `supabase/migrations/001_users_and_auth.sql` — applied to Supabase
- `public.users` table — 19 columns: id (FK → auth.users), email, handle (regex-validated 3-30 chars), display_name, avatar_url, cover_image_url, headline (max 200), bio (max 2000), location, website, persona_type (11 values), verification_status (4 values), profile_completeness (0-100), role (user/moderator/admin), is_active, last_active_at, timestamps, search_vector (tsvector)
- `public.user_settings` table — 7 columns: user_id (FK → users), profile_visibility (public/connections_only/private), email_digest (immediate/daily/weekly/off), show_activity, search_indexable, timestamps
- 7 CHECK constraints: handle format, headline/bio length, persona_type/verification_status/role enums, completeness range
- 7 indexes: PK, email UNIQUE, handle UNIQUE, persona_type, verification_status, created_at DESC, GIN on search_vector
- 4 triggers: `set_updated_at` (both tables), `users_search_vector_update` (tsvector maintenance via trigger — `GENERATED ALWAYS` not viable because `to_tsvector` is not immutable), `handle_new_user` on `auth.users` (SECURITY DEFINER — auto-creates profile + settings on signup)
- 6 RLS policies: SELECT visible profiles, UPDATE own profile, INSERT own profile, SELECT/UPDATE/INSERT own settings
- Zod schemas in `packages/types/src/users.ts` — 5 enum schemas, 5 table schemas (including insert/update variants), all TypeScript types inferred via `z.infer<>`

**Pending**
- CI/CD via GitHub Actions
- Supabase Auth (magic link + OAuth)
- Navigation shell and layout system

---

## Platform Build — Architecture Decisions & Lessons Learned

### proxy.ts — exported function must be named `proxy`

Next.js 16 renames `middleware.ts` to `proxy.ts`. The exported function must also be renamed from `middleware` to `proxy` — the runtime requires the name to match the file. Turbopack build fails with "Proxy is missing expected function export name" if the old name is kept.

```ts
// proxy.ts
export async function proxy(request: NextRequest) { ... }  // correct
export async function middleware(request: NextRequest) { ... }  // breaks build
```

### tsvector columns cannot use `GENERATED ALWAYS` with language-aware functions

`to_tsvector('english', ...)` is not immutable (the dictionary can change), so PostgreSQL rejects it in a `GENERATED ALWAYS AS (...) STORED` column. Use a `BEFORE INSERT OR UPDATE` trigger instead to maintain the `search_vector` column.

---

## Requirements Gathering Site — What's Built

### M1 — Foundation

- Next.js 16 App Router (TypeScript strict)
- Supabase project provisioned — database schema, RLS, triggers all applied
- Vercel deployment configured — production at `sixdegrees.link`
- `proxy.ts` for Supabase session refresh (Next.js 16 equivalent of `middleware.ts`)
- Google Tag Manager wired into root layout
- `@vercel/analytics` and `@vercel/speed-insights` installed
- `.env.local` with all required keys set

### M2 — Requirements Website

**Auth flow**
- Magic link sign-in at `/signin`
- `/auth/callback/route.ts` — exchanges code for session, sets cookies on the redirect response (not on a separate response), then redirects to `/auth/confirm`
- `/auth/confirm/page.tsx` — client component that calls `router.refresh()` then `router.replace(next)` to bust the Next.js router cache so the navbar updates without a manual page reload
- `/auth/error/page.tsx` — error page for auth failures

**Pages**
- `/` — landing page (Server Component)
- `/submit` — 3-step requirement submission form
- `/browse` — filterable, searchable, paginated requirements list (URL-driven, server-side)
- `/requirements/[id]` — full requirement detail with voting and comments

**API routes**
- `GET/POST /api/requirements` — list with filters/pagination; create (auth required)
- `GET/PATCH /api/requirements/[id]` — detail + user_vote; owner update (draft only)
- `POST/DELETE /api/requirements/[id]/vote` — upsert/remove vote; returns updated counts
- `GET/POST /api/requirements/[id]/comments` — paginated comments; post (auth required)

**Components**
- `Navbar` — sticky, shows Admin link only for admin users
- `NavbarUser` — client component for sign-in/out state
- `RequirementCard` — used on browse page
- `VoteButton` — optimistic vote UI
- `CommentForm` and `CommentList` — on detail page

### M3 — AI Refinement

- `POST /api/refine` — Claude API integration
  - Auth required
  - Rate limited: 10 refinements/user/hour (checked against `ai_usage_log`)
  - Daily cost cap: `CLAUDE_DAILY_COST_CAP_USD` env var (default $10), checked against `ai_usage_log` sum
  - Top 20 existing requirements injected into prompt for duplicate detection
  - Returns: `refined_title`, `user_story`, `refined_description`, `acceptance_criteria`, `persona_type`, `category`, `priority_suggestion`, `tags`, `clarifications_needed`, `similar_existing_titles`
  - Costs logged to `ai_usage_log` via service client
- `lib/claude/client.ts` — Anthropic SDK singleton
- `lib/claude/prompts.ts` — `REFINEMENT_SYSTEM_PROMPT` + `buildRefinementPrompt()`
- `lib/claude/parse.ts` — strips markdown fences, JSON.parse, validates required fields, enforces length caps
- Submit form (`components/submit/requirement-form.tsx`) — 3-step:
  1. Persona picker grid
  2. Textarea + category + "Refine with AI" + "Submit as draft" fallback
  3. Review AI output → Submit or Edit

**Model**: `claude-sonnet-4-20250514`, temperature 0.3, max_tokens 2000

### M4 — Admin Moderation

- `PATCH /api/requirements/[id]/review` — admin-only status transitions
- `lib/auth/admin.ts` — `isAdmin(user)` checks `user.email` against `ADMIN_EMAILS` env var (comma-split, lowercase)
- `/admin` page — server-gated, shows status stats + full queue
- `components/admin/admin-queue.tsx` — sortable table (in_review first), optimistic status updates
- `components/admin/review-actions.tsx` — Approve / Reject / Mark In Review buttons with spinner
- Approval email sent via Resend on status → `approved`
- Navbar shows Admin link (accent colour) for admin users only

**Admin emails configured**: `admin@sixdegrees.link,sudo@sixdegrees.link`

**Status transition rules**:
```
submitted  → in_review, approved, rejected
in_review  → approved, rejected
approved   → rejected
rejected   → in_review, approved
draft      → submitted, in_review, approved, rejected
```

### M5 — Consolidation & Export

- **DB migration** `20260402000000_m5_schema.sql` — `merged_into` FK, `is_flagged`/`flag_reason` on requirements and comments, `updated_at` on comments, `persona_subscriptions` table with RLS
- **AuthProvider** (`lib/auth/context.tsx`) — React context with `useAuth()` hook; wraps root layout
- **Comment edit/delete** — `PATCH/DELETE /api/requirements/[id]/comments/[commentId]`; `CommentSection` shows Edit/Delete for own comments, Flag for others
- **Leaderboard** (`/leaderboard`) — top contributors by approved submissions + upvotes received, with inline bar charts
- **Dashboard** (`/dashboard`) — persona coverage + category coverage bar charts, links to filtered browse
- **Deduplication/merge** — `PATCH /api/requirements/[id]/review` extended with `status=merged` + `merged_into`; `MergeDialog` component with live search in admin queue; `review-actions.tsx` updated
- **Export** (`GET /api/export?format=csv|json&status=approved`) — full requirements export; Export CSV button on browse page
- **Flag flow** — `POST /api/requirements/[id]/flag` and `POST /api/requirements/[id]/comments/[commentId]/flag`; flag button in requirement sidebar and on comments (non-owners)
- **Persona subscriptions** — `persona_subscriptions` table; `GET/POST/DELETE /api/subscriptions`
- **Navbar** — added Dashboard and Leaderboard links

**Updated status transition rules (now includes merged)**:
```
submitted  → in_review, approved, rejected, merged
in_review  → approved, rejected, merged
approved   → rejected, merged
rejected   → in_review, approved
draft      → submitted, in_review, approved, rejected
```

### Seed Data

15 initial requirements seeded from LinkedIn research doc, all in `approved` status.
Run `node scripts/seed-requirements.mjs` to re-seed (idempotent via insert, not upsert — don't run twice).

Categories covered: jobs, verification, content, messaging, analytics, microsites, billing, networking, admin.

---

## Platform File Map (current state)

```
apps/
  web/
    app/
      layout.tsx                    ✅ Root layout — Inter Variable, globals.css
      page.tsx                      🔄 Placeholder "Coming soon"
      globals.css                   ✅ Tailwind v4 @theme tokens + dark mode surface tokens
    lib/
      supabase/
        client.ts                   ✅ createClient() — browser (Client Components)
        server.ts                   ✅ createClient() — SSR + createServiceClient() — service role
        middleware.ts               ✅ createMiddlewareClient() — cookie wiring for proxy.ts
    app/
      api/
        health/route.ts             ✅ GET /api/health — status, timestamp, version
    proxy.ts                        ✅ Next.js 16 session refresh interceptor (runs on every request)
    tailwind.config.ts              ✅ Tailwind v4 config (content paths only, tokens in CSS)
    next.config.ts                  ✅ transpilePackages + security headers (server layer)
    package.json                    ✅ Next.js 16, tailwindcss v4, @supabase/ssr, @sixdegrees/* deps
    .env.local.example              ✅ Supabase env var template
    .env.production.example         ✅ All production env vars documented with comments
packages/
  ui/src/index.ts                   🔄 Scaffolded, empty
  types/src/
    database.ts                     ✅ Placeholder Database type (replace with generated output)
    users.ts                        ✅ Zod schemas + inferred types — users, user_settings, enums
    index.ts                        ✅ Exports Database, Json, all user schemas and types
  utils/src/
    result.ts                       ✅ Result<T,E>, ok(), err(), fromSupabase(), fromSupabaseMaybe()
    index.ts                        ✅ Exports result helpers
eslint.config.js                      ✅ ESLint v9 flat config — Next.js + TypeScript strict + Prettier compat
.prettierrc                           ✅ Prettier config — singleQuote, semi, trailingComma all, printWidth 100
.editorconfig                         ✅ Editor-agnostic: UTF-8, LF, 2-space indent, final newline
.husky/pre-commit                     ✅ Runs lint-staged on every commit
turbo.json                            ✅ Task graph — build, dev, lint, test, type-check
vercel.json                           ✅ outputDirectory, npx turbo build, security headers (CDN layer)
```

---

## Requirements Site — Architecture Decisions & Lessons Learned

### Service client must use `@supabase/supabase-js` directly

**Problem**: `createServiceClient()` was implemented using `createServerClient` from `@supabase/ssr`. When the service role key was passed to the SSR client, the cookie-based session conflicted with it, causing `.update()` queries to silently return 0 rows.

**Fix** (`lib/supabase/server.ts`):
```ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
```
Note: `createServiceClient()` is now **synchronous** (no `await` needed at call sites).

### Admin operations: anon client for auth check, service client for DB ops

The pattern in admin API routes:
```ts
const supabase = await createClient()          // anon — verify user identity
const { data: { user } } = await supabase.auth.getUser()
if (!isAdmin(user)) return 403

const service = createServiceClient()          // service role — bypass RLS for DB writes
```
Never use the service client to verify identity — it bypasses auth entirely.

### Auth callback: redirect response must be created BEFORE session exchange

**Problem**: Cookies set during `exchangeCodeForSession` weren't being attached to the redirect response because the response was created after the fact.

**Fix** (`app/auth/callback/route.ts`):
```ts
const response = NextResponse.redirect(confirmUrl)   // create response first
const supabase = createServerClient(..., {
  cookies: {
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)   // attach to the response
      )
    }
  }
})
await supabase.auth.exchangeCodeForSession(code)
return response
```

### Next.js router cache requires explicit bust after sign-in

After magic link auth, the Next.js router cache still served the pre-auth layout even though the session cookie was set. An intermediate `/auth/confirm` page calls `router.refresh()` before redirecting to the destination, which forces the router to re-fetch server components with the new auth state.

### `.single()` on `.update()` throws with service role

Supabase's `.single()` on an update query throws "Cannot coerce the result to a single JSON object" when used with the direct supabase-js client (not the SSR wrapper). Use array result and index instead:
```ts
const { data: rows, error } = await service
  .from('requirements')
  .update({ status: newStatus })
  .eq('id', id)
  .select('id, status')
// do NOT call .single() here

const updated = rows?.[0]
```

---

## Requirements Site — File Map

```
app/
  layout.tsx                      ✅ Root layout — Inter font, GTM, Analytics, AuthProvider
  page.tsx                        ✅ Landing page
  globals.css                     ✅ Design system tokens + all component styles
  proxy.ts                        ✅ Supabase session refresh middleware
  auth/
    callback/route.ts             ✅ Magic link code exchange
    confirm/page.tsx              ✅ Router cache bust intermediate page
    error/page.tsx                ✅ Auth error page
  signin/page.tsx                 ✅ Sign-in page
  submit/page.tsx                 ✅ Submit requirement (3-step form with AI)
  browse/page.tsx                 ✅ Browse with URL-driven filters, search, pagination + Export CSV
  requirements/[id]/page.tsx      ✅ Requirement detail — voting, comments, flag
  dashboard/page.tsx              ✅ Persona + category coverage bar charts
  leaderboard/page.tsx            ✅ Top contributors by submissions + upvotes
  admin/page.tsx                  ✅ Admin moderation queue (admin-gated)
  api/
    requirements/route.ts         ✅ GET list + POST create
    requirements/[id]/route.ts    ✅ GET detail + PATCH owner update
    requirements/[id]/vote/       ✅ POST upsert + DELETE remove vote
    requirements/[id]/comments/   ✅ GET paginated + POST create
    requirements/[id]/comments/[commentId]/ ✅ PATCH edit + DELETE own comment
    requirements/[id]/comments/[commentId]/flag/ ✅ POST flag comment
    requirements/[id]/review/     ✅ PATCH admin status transition (incl. merged + merged_into)
    requirements/[id]/flag/       ✅ POST flag requirement
    refine/route.ts               ✅ Claude AI refinement
    export/route.ts               ✅ GET CSV/JSON export (?format=csv|json&status=approved)
    subscriptions/route.ts        ✅ GET/POST/DELETE persona subscriptions

components/
  navbar.tsx                      ✅ Sticky navbar — Browse, Contribute, Dashboard, Leaderboard, Admin
  navbar-user.tsx                 ✅ Client sign-in/out state
  admin/
    admin-queue.tsx               ✅ Sortable requirements table
    review-actions.tsx            ✅ Approve / Reject / In Review / Merge buttons
    merge-dialog.tsx              ✅ Live-search merge target dialog
  browse/
    filter-bar.tsx                ✅ Search + persona/category/status/sort filters
    requirement-card.tsx          ✅ Card used in browse grid
    pagination.tsx                ✅ Pagination controls
  requirements/
    comment-section.tsx           ✅ Comments with edit/delete (own) + flag (others)
    vote-buttons.tsx              ✅ Optimistic up/down vote UI
    flag-button.tsx               ✅ Flag button for requirements and comments
  submit/
    requirement-form.tsx          ✅ 3-step submit form
  auth/
    sign-in-form.tsx              ✅ Magic link sign-in form

lib/
  supabase/
    client.ts                     ✅ createBrowserClient (client components)
    server.ts                     ✅ createClient (anon SSR) + createServiceClient (service role, sync)
    types.ts                      ✅ Database types (updated for M5 columns)
  auth/
    admin.ts                      ✅ isAdmin(user) — checks ADMIN_EMAILS env
    context.tsx                   ✅ AuthProvider + useAuth() React context
  claude/
    client.ts                     ✅ Anthropic SDK singleton
    prompts.ts                    ✅ REFINEMENT_SYSTEM_PROMPT + buildRefinementPrompt()
    parse.ts                      ✅ parseRefinementResponse()
  validators/
    requirements.ts               ✅ Zod schemas — PersonaType, FeatureCategory, etc.
  constants/
    personas.ts                   ✅ PERSONAS array + CATEGORIES array (alphabetical, Other last)
  email.ts                        ✅ sendRequirementApproved() via Resend

scripts/
  seed-requirements.mjs           ✅ Seeds 15 initial requirements from LinkedIn research

supabase/migrations/
  001_users_and_auth.sql              ✅ Platform — users + user_settings tables, indexes, triggers, RLS, signup trigger
  20260401000000_initial_schema.sql   ✅ Requirements site — Tables, enums, indexes
  20260401000001_rls_policies.sql     ✅ Requirements site — Row-level security
  20260401000002_functions_triggers.sql ✅ Requirements site — Triggers + find_similar_requirements()
  20260402000000_m5_schema.sql        ✅ Requirements site — M5 — merged_into, is_flagged, flag_reason, updated_at, persona_subscriptions
```

---

## Feature Categories (current)

Alphabetical, `other` always last:
`accessibility`, `admin`, `analytics`, `billing`, `content`, `jobs`, `messaging`, `microsites`, `moderation`, `networking`, `notifications`, `profile`, `search`, `verification`, `other`

---

## Environment Variables (all set in Vercel + .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
CLAUDE_DAILY_COST_CAP_USD=10
NEXT_PUBLIC_APP_URL=https://sixdegrees.link
ADMIN_EMAILS=admin@sixdegrees.link,sudo@sixdegrees.link
RESEND_API_KEY
EMAIL_FROM=noreply@sixdegrees.link
```

---

## Known Gaps / Deferred Items

- No pagination on comments (currently loads all, capped at 50 — acceptable for now)
- Persona subscription emails not yet sent (table + API exist; email digest not implemented)
- No GitHub Issues / Linear export (CSV + JSON only; deeper integrations deferred)
- Admin unflag UI not built (admins can clear flags via service client directly)
