# SixDegrees MVP - Phase Tracker

Upload this file at the start of each new phase conversation. Update the DONE and ACTIVE sections as you progress. This gives Claude Code the context it needs to understand what exists and what comes next.

---

## DONE (completed phases and tasks)

### Requirements Gathering Project (COMPLETE)
- Requirements gathering website live at sixdegrees.link
- Community can submit, vote on, and discuss requirements
- Claude AI refines raw input into structured user stories
- Coverage dashboards across all 11 personas
- Tech: Next.js 16, TypeScript, Tailwind, Supabase, Vercel

### Phase 1, Cycle 1 — Completed items
- [x] Initialize Next.js 16 monorepo with TypeScript strict mode (Turborepo, apps/web, packages/ui|types|utils)
- [x] Configure Tailwind CSS with design system tokens (Tailwind v4, full brand/semantic/neutral/surface token set, dark mode)
- [x] Set up Vercel deployment pipeline with preview environments (vercel.json, outputDirectory, local turbo)
- [x] Create shared UI component library foundation (packages/ui scaffolded)

---

## ACTIVE (current phase tasks - update as you work)

### Phase 1, Cycle 1 (Apr 5-18): Project Setup — remaining
- [ ] Set up Supabase project and configure connection
- [ ] Configure ESLint, Prettier, and Husky pre-commit hooks
- [ ] Create CI/CD pipeline with GitHub Actions
- [ ] Design and implement core database schema - users and auth
- [ ] Design and implement database schema - profiles and credentials
- [ ] Set up Supabase Auth with magic link and OAuth providers
- [ ] Set up Zod validation schemas for all data models
- [ ] Implement responsive navigation shell and layout system

### Phase 1, Cycle 2 (Apr 19 - May 2): Foundation Hardening
- [ ] Implement error boundary and global error handling
- [ ] Build API route foundation with middleware patterns
- [ ] Set up testing infrastructure - Jest, React Testing Library, Playwright
- [ ] Implement database migration system and seed data
- [ ] Build email template system for transactional emails
- [ ] Create landing page and marketing site shell
- [ ] Implement feature flag system for progressive rollout
- [ ] Set up image upload and storage with Supabase Storage
- [ ] Create comprehensive TypeScript type system for the platform
- [ ] Implement server-side rendering and caching strategy

---

## UPCOMING (next phase preview - will be detailed when active)

### Phase 2: Identity and Profiles (May 3-30)
- User registration flow with email verification
- Handle/username system with validation
- Identity verification foundation (email and phone tiers)
- Profile setup wizard for new users
- Avatar upload with cropping and optimization
- User settings page (account, privacy, notifications)
- Public profile page with SEO
- Work experience, education, certifications editors
- Skills system with taxonomy and endorsements
- Profile completeness scoring
- LinkedIn profile import tool

### Phase 3: Networking and Communication (May 31 - Jul 25)
- Connection system with degree of separation
- Direct messaging with real-time delivery
- Chronological feed (no algorithm)
- Post creation and interactions
- Notification system (in-app and email)

### Phase 4: Content and Discovery (Jul 26 - Sep 19)
- Long-form article editor
- Content moderation pipeline
- Microsite system
- Unified search
- Company pages
- Reputation scoring

### Phase 5: Professional Features (Sep 20 - Nov 14)
- Job board with mandatory salary transparency
- Employer accountability scoring
- Service provider profiles
- Analytics and data export

### Phase 6: Polish, Security and MVP Launch (Nov 15 - Dec 19)
- Performance and security audit
- Accessibility compliance
- Beta onboarding and feedback
- Production hardening
- Open-source preparation
- Launch communications

---

## Key Architecture Reminders

When building new features, remember:
- Monorepo structure: apps/web, packages/ui, packages/types, packages/utils
- Database: Supabase with Row Level Security on every table
- Auth: Supabase Auth, check session via middleware on every request
- API pattern: createApiHandler with composable middleware (withAuth, withValidation, withRateLimit)
- Validation: Zod schemas in packages/types, infer TypeScript types from them
- Components: packages/ui with design token styling, all accessible
- Feature flags: check isFeatureEnabled() before exposing unreleased features
- Error handling: custom error classes, standardized ApiResponse format
- No em dashes or en dashes anywhere - use hyphens

## Repository Structure
```
sixdegrees-platform/
  apps/
    web/                    # Next.js 14 App Router
      app/
        (auth)/             # Login, registration
        (protected)/        # Authenticated pages
        (public)/           # Public pages (landing, profiles)
        api/                # API routes
      components/           # App-specific components
      lib/                  # Utilities, clients, helpers
      supabase/
        migrations/         # SQL migration files
        seed.sql            # Development seed data
  packages/
    ui/                     # Shared React components
    types/                  # Zod schemas and TypeScript types
    utils/                  # Shared utilities
    email/                  # Email templates
  .github/
    workflows/              # CI/CD pipelines
```
