import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const personaTypeSchema = z.enum([
  'general_user',
  'job_seeker',
  'employer',
  'recruiter',
  'content_moderator',
  'content_creator',
  'company',
  'service_provider',
  'coach',
  'educator',
  'platform_admin',
]);

export const verificationStatusSchema = z.enum([
  'unverified',
  'email_verified',
  'phone_verified',
  'identity_verified',
]);

export const userRoleSchema = z.enum(['user', 'moderator', 'admin']);

export const profileVisibilitySchema = z.enum(['public', 'connections_only', 'private']);

export const emailDigestSchema = z.enum(['immediate', 'daily', 'weekly', 'off']);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  handle: z
    .string()
    .regex(
      /^[a-z0-9_]{3,30}$/,
      'Handle must be 3-30 lowercase alphanumeric or underscore characters',
    )
    .nullable(),
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  cover_image_url: z.string().url().nullable(),
  headline: z.string().max(200).nullable(),
  bio: z.string().max(2000).nullable(),
  location: z.string().nullable(),
  website: z.string().url().nullable(),
  persona_type: personaTypeSchema.nullable(),
  verification_status: verificationStatusSchema,
  profile_completeness: z.number().int().min(0).max(100),
  role: userRoleSchema,
  is_active: z.boolean(),
  last_active_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const userInsertSchema = userSchema.pick({
  id: true,
  email: true,
});

export const userUpdateSchema = userSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

// ---------------------------------------------------------------------------
// User Settings
// ---------------------------------------------------------------------------

export const userSettingsSchema = z.object({
  user_id: z.string().uuid(),
  profile_visibility: profileVisibilitySchema,
  email_digest: emailDigestSchema,
  show_activity: z.boolean(),
  search_indexable: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const userSettingsUpdateSchema = userSettingsSchema
  .omit({ user_id: true, created_at: true, updated_at: true })
  .partial();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type PersonaType = z.infer<typeof personaTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>;
export type EmailDigest = z.infer<typeof emailDigestSchema>;

export type User = z.infer<typeof userSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UserSettingsUpdate = z.infer<typeof userSettingsUpdateSchema>;
