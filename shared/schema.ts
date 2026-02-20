import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("user_role", ["ALUMNI", "COMPANY", "ADMIN"]);
export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]);
export const jobTypeEnum = pgEnum("job_type", ["FULL_TIME", "PART_TIME", "INTERNSHIP", "FREELANCE", "REMOTE"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  bio: text("bio"),
  cvUrl: text("cv_url"),
  university: text("university"),
  graduationYear: integer("graduation_year"),
  familiaProfesional: text("familia_profesional"),
  cicloFormativo: text("ciclo_formativo"),
  skills: text("skills"),
  profilePhotoUrl: text("profile_photo_url"),
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  companyWebsite: text("company_website"),
  companySector: text("company_sector"),
  companyLogoUrl: text("company_logo_url"),
  companyEmail: text("company_email"),
  companyCif: text("company_cif"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  profilePublic: boolean("profile_public").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  cvData: jsonb("cv_data"),
  cvLastUpdatedAt: timestamp("cv_last_updated_at"),
  cvReminderSentAt: timestamp("cv_reminder_sent_at"),
  jobNotificationsEnabled: boolean("job_notifications_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const smtpSettings = pgTable("smtp_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  host: text("host").notNull(),
  port: integer("port").notNull().default(587),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull().default("Conecta FP"),
  secure: boolean("secure").notNull().default(false),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  familiaProfesional: text("familia_profesional"),
  cicloFormativo: text("ciclo_formativo"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(),
  expiryReminderSentAt: timestamp("expiry_reminder_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fpCenters = pgTable("fp_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  municipio: text("municipio").notNull(),
  isla: text("isla").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const familiasProfesionales = pgTable("familias_profesionales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ciclosFormativos = pgTable("ciclos_formativos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  familiaId: varchar("familia_id").notNull().references(() => familiasProfesionales.id, { onDelete: "cascade" }),
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
  familiaProfesional: z.string().optional(),
  cicloFormativo: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el tratamiento de datos" }) }),
});

export const registerCompanySchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(2, "El nombre del contacto es obligatorio"),
  role: z.literal("COMPANY"),
  companyName: z.string().min(2, "El nombre de la empresa es obligatorio"),
  companyEmail: z.string().email("Email corporativo no válido").optional().or(z.literal("")),
  companyCif: z.string().optional(),
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
  expiryReminderSentAt: true,
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
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  familiaProfesional: z.string().optional(),
  cicloFormativo: z.string().optional(),
  skills: z.string().optional(),
  profilePublic: z.boolean().optional(),
});

export const updateProfileCompanySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyName: z.string().optional(),
  companyEmail: z.string().email("Email corporativo no válido").optional().or(z.literal("")),
  companyCif: z.string().optional(),
  companyDescription: z.string().optional(),
  companyWebsite: z.string().optional(),
  companySector: z.string().optional(),
  profilePublic: z.boolean().optional(),
});

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "El host es obligatorio"),
  port: z.number().min(1).max(65535),
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contrasena es obligatoria"),
  fromEmail: z.string().email("Email no valido"),
  fromName: z.string().min(1, "El nombre del remitente es obligatorio"),
  secure: z.boolean(),
  enabled: z.boolean(),
});

export const cvEducationSchema = z.object({
  institution: z.string(),
  title: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  description: z.string().optional(),
});

export const cvExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export const cvLanguageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

export const cvDataSchema = z.object({
  education: z.array(cvEducationSchema).optional().default([]),
  experience: z.array(cvExperienceSchema).optional().default([]),
  languages: z.array(cvLanguageSchema).optional().default([]),
  additionalInfo: z.string().optional().default(""),
});

export type CvData = z.infer<typeof cvDataSchema>;
export type CvEducation = z.infer<typeof cvEducationSchema>;
export type CvExperience = z.infer<typeof cvExperienceSchema>;
export type CvLanguage = z.infer<typeof cvLanguageSchema>;

export const insertFpCenterSchema = createInsertSchema(fpCenters).omit({ id: true, createdAt: true });
export const insertFamiliaProfesionalSchema = createInsertSchema(familiasProfesionales).omit({ id: true, createdAt: true });
export const insertCicloFormativoSchema = createInsertSchema(ciclosFormativos).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = z.infer<typeof insertJobOfferSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type SmtpSettings = typeof smtpSettings.$inferSelect;
export type FpCenter = typeof fpCenters.$inferSelect;
export type InsertFpCenter = z.infer<typeof insertFpCenterSchema>;
export type FamiliaProfesional = typeof familiasProfesionales.$inferSelect;
export type InsertFamiliaProfesional = z.infer<typeof insertFamiliaProfesionalSchema>;
export type CicloFormativo = typeof ciclosFormativos.$inferSelect;
export type InsertCicloFormativo = z.infer<typeof insertCicloFormativoSchema>;

export const FAMILIAS_PROFESIONALES = [
  "Informática y Comunicaciones",
  "Administración y Gestión",
  "Comercio y Marketing",
  "Electricidad y Electrónica",
  "Sanidad",
  "Hostelería y Turismo",
  "Edificación y Obra Civil",
  "Fabricación Mecánica",
  "Imagen y Sonido",
  "Transporte y Mantenimiento de Vehículos",
  "Energía y Agua",
  "Actividades Físicas y Deportivas",
  "Artes Gráficas",
  "Industrias Alimentarias",
  "Química",
  "Servicios Socioculturales y a la Comunidad",
  "Seguridad y Medio Ambiente",
  "Agraria",
  "Marítimo-Pesquera",
  "Textil, Confección y Piel",
  "Instalación y Mantenimiento",
  "Madera, Mueble y Corcho",
  "Vidrio y Cerámica",
] as const;

export const CICLOS_POR_FAMILIA: Record<string, string[]> = {
  "Informática y Comunicaciones": [
    "CFGS Desarrollo de Aplicaciones Web (DAW)",
    "CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)",
    "CFGS Administración de Sistemas Informáticos en Red (ASIR)",
    "CFGM Sistemas Microinformáticos y Redes (SMR)",
  ],
  "Administración y Gestión": [
    "CFGS Administración y Finanzas",
    "CFGS Asistencia a la Dirección",
    "CFGM Gestión Administrativa",
  ],
  "Comercio y Marketing": [
    "CFGS Marketing y Publicidad",
    "CFGS Comercio Internacional",
    "CFGS Gestión de Ventas y Espacios Comerciales",
    "CFGS Transporte y Logística",
    "CFGM Actividades Comerciales",
  ],
  "Electricidad y Electrónica": [
    "CFGS Sistemas Electrotécnicos y Automatizados",
    "CFGS Sistemas de Telecomunicaciones e Informáticos",
    "CFGS Automatización y Robótica Industrial",
    "CFGM Instalaciones Eléctricas y Automáticas",
    "CFGM Instalaciones de Telecomunicaciones",
  ],
  "Sanidad": [
    "CFGS Laboratorio Clínico y Biomédico",
    "CFGS Imagen para el Diagnóstico y Medicina Nuclear",
    "CFGS Higiene Bucodental",
    "CFGS Anatomía Patológica y Citodiagnóstico",
    "CFGM Cuidados Auxiliares de Enfermería",
    "CFGM Farmacia y Parafarmacia",
    "CFGM Emergencias Sanitarias",
  ],
  "Hostelería y Turismo": [
    "CFGS Gestión de Alojamientos Turísticos",
    "CFGS Agencias de Viajes y Gestión de Eventos",
    "CFGS Dirección de Cocina",
    "CFGS Dirección de Servicios de Restauración",
    "CFGM Cocina y Gastronomía",
    "CFGM Servicios en Restauración",
  ],
  "Edificación y Obra Civil": [
    "CFGS Proyectos de Edificación",
    "CFGS Proyectos de Obra Civil",
    "CFGM Construcción",
  ],
  "Fabricación Mecánica": [
    "CFGS Diseño en Fabricación Mecánica",
    "CFGS Programación de la Producción en Fabricación Mecánica",
    "CFGM Mecanizado",
    "CFGM Soldadura y Calderería",
  ],
  "Imagen y Sonido": [
    "CFGS Animaciones 3D, Juegos y Entornos Interactivos",
    "CFGS Producción de Audiovisuales y Espectáculos",
    "CFGS Realización de Proyectos Audiovisuales y Espectáculos",
    "CFGS Iluminación, Captación y Tratamiento de Imagen",
    "CFGS Sonido para Audiovisuales y Espectáculos",
    "CFGM Vídeo Disc-jockey y Sonido",
  ],
  "Transporte y Mantenimiento de Vehículos": [
    "CFGS Automoción",
    "CFGM Electromecánica de Vehículos Automóviles",
    "CFGM Carrocería",
  ],
  "Energía y Agua": [
    "CFGS Energías Renovables",
    "CFGS Eficiencia Energética y Energía Solar Térmica",
    "CFGM Redes e Instalaciones de Gas",
  ],
  "Actividades Físicas y Deportivas": [
    "CFGS Enseñanza y Animación Sociodeportiva",
    "CFGS Acondicionamiento Físico",
    "CFGM Conducción de Actividades Físico-deportivas en el Medio Natural",
  ],
  "Artes Gráficas": [
    "CFGS Diseño y Producción Editorial",
    "CFGS Diseño y Gestión de la Producción Gráfica",
    "CFGM Preimpresión Digital",
    "CFGM Impresión Gráfica",
  ],
  "Industrias Alimentarias": [
    "CFGS Vitivinicultura",
    "CFGS Procesos y Calidad en la Industria Alimentaria",
    "CFGM Elaboración de Productos Alimenticios",
    "CFGM Aceites de Oliva y Vinos",
  ],
  "Química": [
    "CFGS Laboratorio de Análisis y de Control de Calidad",
    "CFGS Química Industrial",
    "CFGM Planta Química",
    "CFGM Operaciones de Laboratorio",
  ],
  "Servicios Socioculturales y a la Comunidad": [
    "CFGS Educación Infantil",
    "CFGS Integración Social",
    "CFGS Animación Sociocultural y Turística",
    "CFGS Mediación Comunicativa",
    "CFGM Atención a Personas en Situación de Dependencia",
  ],
  "Seguridad y Medio Ambiente": [
    "CFGS Educación y Control Ambiental",
    "CFGS Química y Salud Ambiental",
    "CFGM Emergencias y Protección Civil",
  ],
  "Agraria": [
    "CFGS Gestión Forestal y del Medio Natural",
    "CFGS Paisajismo y Medio Rural",
    "CFGM Producción Agroecológica",
    "CFGM Jardinería y Floristería",
  ],
  "Marítimo-Pesquera": [
    "CFGS Transporte Marítimo y Pesca de Altura",
    "CFGS Organización del Mantenimiento de Maquinaria de Buques y Embarcaciones",
    "CFGM Navegación y Pesca de Litoral",
  ],
  "Textil, Confección y Piel": [
    "CFGS Patronaje y Moda",
    "CFGS Vestuario a Medida y de Espectáculos",
    "CFGM Confección y Moda",
  ],
  "Instalación y Mantenimiento": [
    "CFGS Mecatrónica Industrial",
    "CFGS Mantenimiento de Instalaciones Térmicas y de Fluidos",
    "CFGM Instalaciones de Producción de Calor",
    "CFGM Mantenimiento Electromecánico",
  ],
  "Madera, Mueble y Corcho": [
    "CFGS Diseño y Amueblamiento",
    "CFGM Carpintería y Mueble",
    "CFGM Instalación y Amueblamiento",
  ],
  "Vidrio y Cerámica": [
    "CFGS Desarrollo y Fabricación de Productos Cerámicos",
    "CFGM Fabricación de Productos Cerámicos",
  ],
};
