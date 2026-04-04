import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const employmentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
]);

export const skillCategorySchema = z.enum([
  'technical',
  'soft_skill',
  'industry',
  'language',
  'tool',
]);

// ---------------------------------------------------------------------------
// Work Experience
// ---------------------------------------------------------------------------

export const workExperienceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_name: z.string().min(1),
  company_id: z.string().uuid().nullable(),
  job_title: z.string().min(1),
  employment_type: employmentTypeSchema.nullable(),
  location: z.string().nullable(),
  start_date: z.string().date(),
  end_date: z.string().date().nullable(),
  is_current: z.boolean(),
  description: z.string().nullable(),
  sort_order: z.number().int(),
  verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const workExperienceInsertSchema = workExperienceSchema.omit({
  id: true,
  verified: true,
  created_at: true,
  updated_at: true,
});

export const workExperienceUpdateSchema = workExperienceInsertSchema
  .omit({ user_id: true })
  .partial();

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  institution: z.string().min(1),
  degree: z.string().nullable(),
  field_of_study: z.string().nullable(),
  start_date: z.string().date().nullable(),
  end_date: z.string().date().nullable(),
  description: z.string().nullable(),
  verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const educationInsertSchema = educationSchema.omit({
  id: true,
  verified: true,
  created_at: true,
  updated_at: true,
});

export const educationUpdateSchema = educationInsertSchema.omit({ user_id: true }).partial();

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const skillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: skillCategorySchema.nullable(),
  usage_count: z.number().int().min(0),
});

// ---------------------------------------------------------------------------
// User Skills
// ---------------------------------------------------------------------------

export const userSkillSchema = z.object({
  user_id: z.string().uuid(),
  skill_id: z.string().uuid(),
  endorsement_count: z.number().int().min(0),
});

// ---------------------------------------------------------------------------
// Skill Endorsements
// ---------------------------------------------------------------------------

export const skillEndorsementSchema = z.object({
  id: z.string().uuid(),
  skill_id: z.string().uuid(),
  user_id: z.string().uuid(),
  endorser_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

export const certificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  issuing_organization: z.string().min(1),
  issue_date: z.string().date().nullable(),
  expiry_date: z.string().date().nullable(),
  credential_id: z.string().nullable(),
  credential_url: z.string().url().nullable(),
  verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const certificationInsertSchema = certificationSchema.omit({
  id: true,
  verified: true,
  created_at: true,
  updated_at: true,
});

export const certificationUpdateSchema = certificationInsertSchema
  .omit({ user_id: true })
  .partial();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;

export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type WorkExperienceInsert = z.infer<typeof workExperienceInsertSchema>;
export type WorkExperienceUpdate = z.infer<typeof workExperienceUpdateSchema>;

export type Education = z.infer<typeof educationSchema>;
export type EducationInsert = z.infer<typeof educationInsertSchema>;
export type EducationUpdate = z.infer<typeof educationUpdateSchema>;

export type Skill = z.infer<typeof skillSchema>;
export type UserSkill = z.infer<typeof userSkillSchema>;
export type SkillEndorsement = z.infer<typeof skillEndorsementSchema>;

export type Certification = z.infer<typeof certificationSchema>;
export type CertificationInsert = z.infer<typeof certificationInsertSchema>;
export type CertificationUpdate = z.infer<typeof certificationUpdateSchema>;
