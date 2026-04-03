// @sixdegrees/types — shared TypeScript types and Zod schemas
export type { Database, Json } from './database';

export {
  personaTypeSchema,
  verificationStatusSchema,
  userRoleSchema,
  profileVisibilitySchema,
  emailDigestSchema,
  userSchema,
  userInsertSchema,
  userUpdateSchema,
  userSettingsSchema,
  userSettingsUpdateSchema,
} from './users';

export type {
  PersonaType,
  VerificationStatus,
  UserRole,
  ProfileVisibility,
  EmailDigest,
  User,
  UserInsert,
  UserUpdate,
  UserSettings,
  UserSettingsUpdate,
} from './users';
