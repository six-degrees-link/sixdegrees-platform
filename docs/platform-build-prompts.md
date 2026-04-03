# SixDegrees MVP Platform - Claude Code Build Prompts

## How To Use This File

Each prompt below maps to a specific Linear issue (referenced by title). Copy the prompt into Claude Code when you are ready to build that task. Prompts are ordered by phase and cycle. After completing each task, move the corresponding Linear issue to Done.

When starting a new phase, import the "Phase Completion Checklist" at the bottom of the previous phase as context so Claude Code understands what has already been built.

---

## PHASE 1: Foundation and Scaffolding

### Cycle 1 (Apr 5-18) - Project Setup

**Prompt 1: Initialize Next.js Monorepo**
```
Create a new Next.js 14 project called "sixdegrees-platform" using the App Router with TypeScript in strict mode.

Structure it as a monorepo with these packages:
- apps/web (the Next.js app)
- packages/ui (shared React components)
- packages/types (shared TypeScript types and Zod schemas)
- packages/utils (shared utilities)

Use Turborepo for the monorepo tooling. Configure path aliases so imports look like "@sixdegrees/ui", "@sixdegrees/types", "@sixdegrees/utils". Add a root package.json with workspace scripts for dev, build, lint, and test.

The app/web structure should follow Next.js App Router conventions:
- app/layout.tsx (root layout)
- app/page.tsx (landing page placeholder)
- app/globals.css (design tokens placeholder)
- lib/ (utilities, clients, constants)
- components/ (shared components)

Initialize a git repo with a .gitignore covering node_modules, .next, .env files, and Turborepo cache.
```

**Prompt 2: Design System and Tailwind Setup**
```
Set up the design system for the SixDegrees platform in apps/web.

Install and configure Tailwind CSS with these custom tokens in tailwind.config.ts:

Colors (CSS custom properties in globals.css):
- Brand: deep blue primary (#1a365d), teal accent (#2c7a7b), warm gray neutrals
- Semantic: success green, warning amber, error red, info blue
- Surface: white, gray-50 through gray-900 for dark mode preparation

Typography using Inter Variable font (loaded via next/font/google):
- Scale: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px)
- Weights: 400 (regular), 500 (medium), 590 (semi-bold for headings), 700 (bold)

Spacing follows Tailwind defaults (4px base unit).

Add CSS custom properties in globals.css for all colors so they can be referenced in both Tailwind classes and raw CSS. Include a dark mode media query with inverted color tokens (we will implement dark mode toggling later).

Do NOT use em dashes or en dashes anywhere in comments or documentation - use hyphens if needed.
```

**Prompt 3: Supabase Project Connection**
```
Set up the Supabase client for the SixDegrees platform.

Install @supabase/supabase-js and @supabase/ssr.

Create these files:
- lib/supabase/client.ts - Browser client using createBrowserClient
- lib/supabase/server.ts - Server component client using createServerClient with cookies
- lib/supabase/middleware.ts - Middleware client for auth session refresh
- middleware.ts - Next.js middleware that refreshes the Supabase auth session on every request

Add environment variables to .env.local.example:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

Create a typed client wrapper that uses the database types from packages/types (placeholder type for now). Include error handling helpers that wrap Supabase responses into a consistent Result<T, Error> pattern.
```

**Prompt 4: ESLint, Prettier, Husky Setup**
```
Configure code quality tooling for the sixdegrees-platform monorepo.

ESLint: Install eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-config-next, eslint-plugin-react-hooks. Create a root .eslintrc.json extending next/core-web-vitals and typescript-eslint recommended. Add strict rules: no-unused-vars as error, no-explicit-any as error, consistent-type-imports.

Prettier: Install prettier, eslint-config-prettier. Create .prettierrc with: semi: true, singleQuote: true, tabWidth: 2, trailingComma: 'all', printWidth: 100.

Husky + lint-staged: Install husky, lint-staged. Set up pre-commit hook that runs lint-staged. Lint-staged config: run eslint --fix and prettier --write on staged .ts/.tsx files.

Add an .editorconfig file for editor-agnostic settings.

Add scripts to root package.json: "lint", "lint:fix", "format", "format:check".
```

**Prompt 5: Vercel Deployment Configuration**
```
Create the Vercel deployment configuration for the sixdegrees-platform monorepo.

Create vercel.json in the project root configured for the apps/web Next.js app.

Set the root directory to apps/web, the build command to "cd ../.. && npx turbo run build --filter=web", and the output directory to .next.

Create a .env.production.example documenting all required environment variables with placeholder values and comments explaining each one.

Add headers in next.config.js for security: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy origin-when-cross-origin, Permissions-Policy with camera/microphone/geolocation disabled.

Create a simple health check API route at /api/health that returns { status: "ok", timestamp: ISO string, version: from package.json }.
```

**Prompt 6: GitHub Actions CI/CD**
```
Create GitHub Actions workflows for the sixdegrees-platform monorepo.

.github/workflows/ci.yml - runs on push to main and all PRs:
- Checkout code
- Setup Node.js 20 with pnpm
- Install dependencies with frozen lockfile
- Cache node_modules and .next/cache and turbo cache
- Run lint (turbo run lint)
- Run type check (turbo run type-check)
- Run unit tests (turbo run test)
- Run build (turbo run build)

.github/workflows/preview.yml - runs on PR open/sync:
- Comment on PR with Vercel preview URL

Add a "type-check" script to the web app's package.json that runs "tsc --noEmit".

Each job should fail fast and report clear error messages.
```

**Prompt 7: Core Database Schema - Users and Auth**
```
Create a Supabase migration file at supabase/migrations/001_users_and_auth.sql for the SixDegrees platform.

Create these tables:

users:
- id UUID PRIMARY KEY (references auth.users)
- email TEXT UNIQUE NOT NULL
- handle TEXT UNIQUE (3-30 chars, lowercase alphanumeric + underscores)
- display_name TEXT
- avatar_url TEXT
- cover_image_url TEXT
- headline TEXT (max 200 chars)
- bio TEXT (max 2000 chars)
- location TEXT
- website TEXT
- persona_type TEXT (enum: general_user, job_seeker, employer, recruiter, content_moderator, content_creator, company, service_provider, coach, educator, platform_admin)
- verification_status TEXT DEFAULT 'unverified' (enum: unverified, email_verified, phone_verified, identity_verified)
- profile_completeness INTEGER DEFAULT 0
- role TEXT DEFAULT 'user' (enum: user, moderator, admin)
- is_active BOOLEAN DEFAULT true
- last_active_at TIMESTAMPTZ
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()

user_settings:
- user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
- profile_visibility TEXT DEFAULT 'public' (public, connections_only, private)
- email_digest TEXT DEFAULT 'daily' (immediate, daily, weekly, off)
- show_activity BOOLEAN DEFAULT true
- search_indexable BOOLEAN DEFAULT true
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()

Create indexes on: users(handle), users(email), users(persona_type), users(verification_status), users(created_at DESC).

Add full-text search: add a search_vector tsvector column on users generated from display_name, handle, headline, bio. Create GIN index on it.

Add updated_at trigger function and apply to both tables.

Create Row Level Security policies:
- Users can read any active public profile
- Users can only update their own profile
- Users can only read their own settings
- Service role bypasses all policies

Do NOT use em dashes or en dashes in any comments - use hyphens.
```

**Prompt 8: Database Schema - Profiles