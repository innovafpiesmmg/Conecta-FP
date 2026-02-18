import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("user_role", ["ALUMNI", "COMPANY"]);
export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]);
export const jobTypeEnum = pgEnum("job_type", ["FULL_TIME", "PART_TIME", "INTERNSHIP", "FREELANCE", "REMOTE"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  bio: text("bio"),
  cvUrl: text("cv_url"),
  university: text("university"),
  graduationYear: integer("graduation_year"),
  skills: text("skills"),
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  companyWebsite: text("company_website"),
  companySector: text("company_sector"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  profilePublic: boolean("profile_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobOffers = pgTable("job_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  jobType: jobTypeEnum("job_type").notNull(),
  requirements: text("requirements"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alumniId: varchar("alumni_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobOfferId: varchar("job_offer_id").notNull().references(() => jobOffers.id, { onDelete: "cascade" }),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").notNull().default("PENDING"),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  consentTimestamp: true,
});

export const registerAlumniSchema = z.object({
  email: z.string().email("Email no valido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  name: z.string().min(2, "El nombre es obligatorio"),
  role: z.literal("ALUMNI"),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el tratamiento de datos" }) }),
});

export const registerCompanySchema = z.object({
  email: z.string().email("Email no valido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  name: z.string().min(2, "El nombre del contacto es obligatorio"),
  role: z.literal("COMPANY"),
  companyName: z.string().min(2, "El nombre de la empresa es obligatorio"),
  companySector: z.string().optional(),
  companyWebsite: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el tratamiento de datos" }) }),
});

export const loginSchema = z.object({
  email: z.string().email("Email no valido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

export const insertJobOfferSchema = createInsertSchema(jobOffers).omit({
  id: true,
  companyId: true,
  createdAt: true,
  active: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  alumniId: true,
  appliedAt: true,
  status: true,
});

export const updateProfileAlumniSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  cvUrl: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  skills: z.string().optional(),
  profilePublic: z.boolean().optional(),
});

export const updateProfileCompanySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  companyWebsite: z.string().optional(),
  companySector: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = z.infer<typeof insertJobOfferSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
