# AGENTS.md

## Cursor Cloud specific instructions

### Overview

SixDegrees is a Turborepo monorepo with one Next.js 16 app (`apps/web`) and three shared packages (`packages/types`, `packages/ui`, `packages/utils`). See `CLAUDE.md` for full architecture decisions, tech stack, and coding conventions.

### Common commands

All standard commands (`dev`, `build`, `lint`, `type-check`, `format`) are in the root `package.json`. See `CLAUDE.md` § "Common Commands" for the full list.

### Environment variables

Copy `apps/web/.env.local.example` to `apps/web/.env.local` before running the dev server. Replace the placeholder values (`<your-anon-key>`, `<your-service-role-key>`, `<project-ref>`) with your own Supabase development credentials. Do **not** commit `.env.local`.

### Dev server

`npm run dev` starts the Next.js dev server on port 3000 via Turborepo. The app is currently in early foundation phase (P1-C2) with a landing page (`/`) and health endpoint (`/api/health`).

### Gotchas

- The repo declares `packageManager: npm@11.12.1`. The update script ensures this version is installed. Do not use yarn/pnpm/bun.
- ESLint is configured with `--max-warnings 0` — any warning fails the lint run.
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`. The exported function must be named `proxy`, not `middleware`.
- Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged `.ts`/`.tsx` files).
- The service Supabase client (`createServiceClient()`) is synchronous (no `await`), and `.single()` must not be used on update queries with it.
