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

export {
  employmentTypeSchema,
  skillCategorySchema,
  workExperienceSchema,
  workExperienceInsertSchema,
  workExperienceUpdateSchema,
  educationSchema,
  educationInsertSchema,
  educationUpdateSchema,
  skillSchema,
  userSkillSchema,
  skillEndorsementSchema,
  certificationSchema,
  certificationInsertSchema,
  certificationUpdateSchema,
} from './profiles';

export type {
  EmploymentType,
  SkillCategory,
  WorkExperience,
  WorkExperienceInsert,
  WorkExperienceUpdate,
  Education,
  EducationInsert,
  EducationUpdate,
  Skill,
  UserSkill,
  SkillEndorsement,
  Certification,
  CertificationInsert,
  CertificationUpdate,
} from './profiles';
