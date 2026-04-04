# SixDegrees Platform — CLAUDE.md

## Project Overview

SixDegrees is an open-source professional networking platform designed as an ethical alternative to LinkedIn. It prioritises verified identity, mandatory salary transparency, chronological feeds, and no dark patterns.

- **Repo**: https://github.com/six-degrees-link/sixdegrees-platform
- **Current phase**: P1-C2 — Foundation Hardening (in progress)
- **Requirements site** (separate project, complete): https://sixdegrees.link

## Monorepo Structure

Turborepo monorepo. `npm` is the package manager (`packageManager: npm@11.12.1`).

```
apps/
  web/          Next.js 16 App Router (primary app, deployed to Vercel)
packages/
  types/        Shared TypeScript types + Zod schemas (inferred from Zod)
  ui/           Shared React components (scaffolded, currently empty)
  utils/        Shared utilities — Result<T,E> helper
```

## Common Commands

```bash
npm run dev          # turbo dev (all apps)
npm run build        # turbo build
npm run lint         # ESLint across all packages (0 warnings allowed)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run type-check   # tsc --noEmit across all packages
```

Run a single app: `npx turbo run dev --filter=@sixdegrees/web`

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, TypeScript strict |
| Styling | Tailwind v4 (CSS-first, `@theme` block in `globals.css`) |
| Database / Auth | Supabase (PostgreSQL + RLS + magic link auth) |
| Deployment | Vercel (`vercel.json` → `apps/web/.next`) |
| Monorepo | Turborepo |
| Validation | Zod — single source of truth; types inferred via `z.infer<>` |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Email | Resend |
| Linting | ESLint v9 flat config + `@typescript-eslint` + Prettier |
| Pre-commit | Husky + lint-staged |

## Architecture Decisions (binding)

**Server Components by default.** Only add `'use client'` when a component needs event handlers, hooks, or browser APIs.

**Chronological feed only.** No algorithmic ranking, ever. Core product differentiator.

**Mandatory salary transparency.** Job listings require `salary_min` / `salary_max` — NOT NULL in the schema, validated in the API.

**Zod as single source of truth.** Define shapes in Zod first; infer TypeScript types from them. Never duplicate type definitions.

**No dark patterns.** No infinite scroll (use pagination), no engagement-bait notifications, no promoted content.

**Open source from day one.** All code written for public scrutiny. No hardcoded secrets, no security-through-obscurity.

## Critical Patterns and Gotchas

### proxy.ts — NOT middleware.ts

Next.js 16 renames `middleware.ts` → `proxy.ts`. The exported function must be named `proxy` (not `middleware`) — the runtime requires the name to match the filename.

```ts
// proxy.ts
export async function proxy(request: NextRequest) { ... }  // correct
export async function middleware(request: NextRequest) { ... }  // breaks build
```

### Supabase clients — three distinct clients

| Client | Import | Use |
|---|---|---|
| Browser | `lib/supabase/client.ts` → `createClient()` | Client Components |
| SSR (anon) | `lib/supabase/server.ts` → `await createClient()` | Server Components, Route Handlers (identity check) |
| Service role | `lib/supabase/server.ts` → `createServiceClient()` | Admin DB ops (bypasses RLS, no session) — **sync, no await** |
| Middleware | `lib/supabase/middleware.ts` → `createMiddlewareClient(req, res)` | `proxy.ts` only |

**Never use the service client to verify user identity — it bypasses auth entirely.**

Admin route pattern:
```ts
const supabase = await createClient()         // anon — check identity
const { data: { user } } = await supabase.auth.getUser()
if (!isAdmin(user)) return 403

const service = createServiceClient()         // service role — DB writes
```

### Service client: no `.single()` on updates

`.single()` throws with the direct supabase-js client on update queries. Use array result:
```ts
const { data: rows } = await service.from('x').update({...}).eq('id', id).select('id')
const updated = rows?.[0]
```

### Auth callback: create redirect response BEFORE exchanging session

```ts
const response = NextResponse.redirect(confirmUrl)  // create first
const supabase = createServerClient(..., {
  cookies: { setAll(cs) { cs.forEach(({name, value, options}) => response.cookies.set(name, value, options)) } }
})
await supabase.auth.exchangeCodeForSession(code)
return response  // cookies are attached
```

### Router cache bust after sign-in

After magic link auth, the Next.js router cache serves stale pre-auth layout. The `/auth/confirm` page calls `router.refresh()` before redirecting to bust the cache.

### ESLint strictness

- `no-unused-vars` — error
- `no-explicit-any` — error
- `consistent-type-imports` — error
- Max warnings: 0 (lint fails on any warning)

## Database Conventions

- Tables: `snake_case`
- PKs: UUID via `gen_random_uuid()`
- Timestamps: `TIMESTAMPTZ DEFAULT now()`
- Every mutable table has `created_at` + `updated_at` (auto-updated via trigger)
- FKs use `ON DELETE CASCADE` where appropriate

## Environment Variables

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

See `apps/web/.env.production.example` for full documentation.

## GitHub Pull Requests

When creating PR descriptions or comments, do not use `#` headings — GitHub renders them as large headers, not bullet points. Use **bold text** or `- ` bullet lists for structure instead.

## Vercel Deployment

- `vercel.json` — build command: `npx turbo run build --filter=@sixdegrees/web`, output: `apps/web/.next`
- Security headers applied at both CDN layer (`vercel.json`) and Next.js server layer (`next.config.ts`) for defence in depth
- `turbo.json` includes `SUPABASE_SERVICE_ROLE_KEY` in build env

## Current Build Status

- **P1-C1 Complete**: monorepo scaffold, Tailwind v4 design system, Supabase client setup, ESLint/Prettier/Husky, `vercel.json`
- **P1-C2 In Progress**: Vercel deployment config ✅, health check endpoint ✅ — pending: CI/CD (GitHub Actions), core DB schema, Supabase Auth, Zod schemas in `packages/types`, navigation shell
