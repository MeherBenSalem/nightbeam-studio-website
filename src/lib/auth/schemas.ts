import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Display name must be at least 2 characters").max(48),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  password: passwordSchema,
  turnstileToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(128),
  rememberMe: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .default(false)
    .transform((value) => value === true || value === "true"),
  turnstileToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  turnstileToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters").max(48).optional(),
  bio: z.string().trim().max(280).optional(),
  website: z.string().trim().url("Enter a valid URL").max(200).optional().or(z.literal("")),
  preferredVersions: z.array(z.string()).max(12).default([]),
  preferredLoaders: z.array(z.string()).max(8).default([]),
});

export const notificationPrefsSchema = z.object({
  emailEnabled: z.boolean().default(true),
  digestEnabled: z.boolean().default(true),
  digestFrequency: z.enum(["WEEKLY", "DAILY", "NEVER"]).default("WEEKLY"),
  projectNotifications: z.boolean().default(true),
  follows: z.boolean().default(true),
  comments: z.boolean().default(true),
  announcements: z.boolean().default(true),
});

export const commentSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export const announcementSchema = z.object({
  slug: z.string().trim().min(2).max(64).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, dashes"),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(4000),
  active: z.boolean().default(true),
  dismissible: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const projectOverrideSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().max(120).optional().nullable(),
  summary: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(20000).optional().nullable(),
  iconUrl: z.string().url().max(500).optional().nullable(),
  bannerUrl: z.string().url().max(500).optional().nullable(),
  featured: z.boolean().optional().nullable(),
  status: z.string().max(24).optional().nullable(),
  downloads: z.coerce.number().int().min(0).optional().nullable(),
  followers: z.coerce.number().int().min(0).optional().nullable(),
  views: z.coerce.number().int().min(0).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
});

export const adminUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "SUPPORT_AGENT", "USER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  checks: { label: string; ok: boolean }[];
}

export function passwordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length as 0 | 1 | 2 | 3 | 4;
  return { score, checks };
}
