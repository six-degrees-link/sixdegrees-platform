# SixDegrees MVP Platform - Architecture Decision Records

Upload this file to your Claude Project. It captures key architectural decisions and the reasoning behind them, so Claude Code understands the "why" behind the codebase.

---

## ADR-001: Monorepo with Turborepo

We use a Turborepo monorepo with separate packages for UI components, TypeScript types, and utilities. This keeps shared code DRY across potential future apps (mobile, admin dashboard) and enforces clean dependency boundaries. The main Next.js app lives in apps/web.

## ADR-002: Supabase as Backend

Supabase provides PostgreSQL, auth, real-time subscriptions, storage, and edge functions in one platform. This dramatically reduces infrastructure complexity for a volunteer-driven project. Row Level Security at the database level means security is enforced even if application code has bugs.

## ADR-003: Magic Link as Primary Auth

Magic link authentication removes the password management burden entirely. Users never create or forget passwords. OAuth (Google, GitHub) is offered as a convenience. This aligns with the verification-first philosophy since every account starts with a verified email.

## ADR-004: Chronological Feed Only

The feed is strictly reverse-chronological. No engagement-weighted algorithm, no "recommended" posts injected, no promoted content. This is a fundamental architectural decision and core differentiator from LinkedIn. If users want to see what their connections posted, they see it in order. This eliminates the incentive structure that creates engagement bait.

## ADR-005: Mandatory Salary Transparency

All job listings require salary_min and salary_max fields. The database schema enforces NOT NULL constraints. The API validates that salary fields are present and that min is less than max. There is no way to post a job without salary information. This is non-negotiable.

## ADR-006: Progressive Identity Verification

Verification is tiered: email (automatic via magic link), phone (OTP via Twilio), identity (future KYC integration). Each tier unlocks additional trust signals and features. The system is designed to be extensible for future verification methods (employer verification, education verification via institution APIs).

## ADR-007: Feature Flags for Progressive Rollout

Every major feature area (messaging, jobs, microsites, company pages) is gated behind feature flags stored in Supabase. This allows us to ship code for future features without exposing them to users, enable features for specific users or roles for testing, and progressively roll out features to the user base.

## ADR-008: Server Components by Default

React Server Components are the default. We only add "use client" when a component needs interactivity (event handlers, hooks, browser APIs). This keeps the JavaScript bundle small and page loads fast. Data fetching happens on the server, close to the database.

## ADR-009: Zod as Single Source of Truth

Zod schemas define the shape of all data in the system. TypeScript types are inferred from Zod using z.infer<>. The same schemas validate API request bodies, form submissions, and environment variables. This eliminates the drift between types and runtime validation that plagues many TypeScript projects.

## ADR-010: Composable API Middleware

API routes use a createApiHandler pattern with composable middleware: withAuth (session validation), withValidation (Zod schema checking), withRateLimit (per-user or per-IP limits). This keeps route handlers focused on business logic and ensures consistent auth checks, input validation, and rate limiting across all endpoints.

## ADR-011: Open Source from Day One

The repository will be public before or at MVP launch. This means all code must be written assuming public scrutiny. No hardcoded secrets, no security through obscurity, clean commit history, comprehensive documentation. The open-source nature is central to the trust proposition.

## ADR-012: Data Portability as a Feature

Users can export all their data at any time (profile, posts, messages, connections, applications) in JSON and CSV formats. Account deletion includes a 30-day grace period with full data download before permanent removal. This is both a GDPR requirement and a core philosophical commitment.

## ADR-013: Content Moderation with AI and Humans

Content is screened automatically using Claude API for spam, hate speech, and policy violations. Flagged content goes to a human moderator queue. All moderation actions are logged and appealable. This balances speed (AI catches obvious violations) with fairness (humans make nuanced decisions).

## ADR-014: No Dark Patterns

The platform explicitly avoids: infinite scroll (use pagination with explicit "load more"), hidden metrics that drive anxiety, notification spam, engagement-bait incentive structures, premium features that create a two-tier system. The UI should respect the user's time and attention.

## ADR-015: Database Naming Conventions

All database tables use snake_case. Primary keys are UUID (gen_random_uuid()). Timestamps use TIMESTAMPTZ with DEFAULT now(). Foreign keys include ON DELETE CASCADE where appropriate. Every table with mutable data has created_at and updated_at columns with automatic trigger functions for updated_at.
