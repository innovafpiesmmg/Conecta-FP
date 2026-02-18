import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
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
  bio: text("bio"),
  cvUrl: text("cv_url"),
  university: text("university"),
  graduationYear: integer("graduation_year"),
  familiaProfesional: text("familia_profesional"),
  cicloFormativo: text("ciclo_formativo"),
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
  familiaProfesional: text("familia_profesional"),
  cicloFormativo: text("ciclo_formativo"),
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
  familiaProfesional: z.string().optional(),
  cicloFormativo: z.string().optional(),
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

export const FAMILIAS_PROFESIONALES = [
  "Informatica y Comunicaciones",
  "Administracion y Gestion",
  "Comercio y Marketing",
  "Electricidad y Electronica",
  "Sanidad",
  "Hosteleria y Turismo",
  "Edificacion y Obra Civil",
  "Fabricacion Mecanica",
  "Imagen y Sonido",
  "Transporte y Mantenimiento de Vehiculos",
  "Energia y Agua",
  "Actividades Fisicas y Deportivas",
  "Artes Graficas",
  "Industrias Alimentarias",
  "Quimica",
  "Servicios Socioculturales y a la Comunidad",
  "Seguridad y Medio Ambiente",
  "Agraria",
  "Maritimo-Pesquera",
  "Textil, Confeccion y Piel",
  "Instalacion y Mantenimiento",
  "Madera, Mueble y Corcho",
  "Vidrio y Ceramica",
] as const;

export const CICLOS_POR_FAMILIA: Record<string, string[]> = {
  "Informatica y Comunicaciones": [
    "CFGS Desarrollo de Aplicaciones Web (DAW)",
    "CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)",
    "CFGS Administracion de Sistemas Informaticos en Red (ASIR)",
    "CFGM Sistemas Microinformaticos y Redes (SMR)",
  ],
  "Administracion y Gestion": [
    "CFGS Administracion y Finanzas",
    "CFGS Asistencia a la Direccion",
    "CFGM Gestion Administrativa",
  ],
  "Comercio y Marketing": [
    "CFGS Marketing y Publicidad",
    "CFGS Comercio Internacional",
    "CFGS Gestion de Ventas y Espacios Comerciales",
    "CFGS Transporte y Logistica",
    "CFGM Actividades Comerciales",
  ],
  "Electricidad y Electronica": [
    "CFGS Sistemas Electrotecnicos y Automatizados",
    "CFGS Sistemas de Telecomunicaciones e Informaticos",
    "CFGS Automatizacion y Robotica Industrial",
    "CFGM Instalaciones Electricas y Automaticas",
    "CFGM Instalaciones de Telecomunicaciones",
  ],
  "Sanidad": [
    "CFGS Laboratorio Clinico y Biomedico",
    "CFGS Imagen para el Diagnostico y Medicina Nuclear",
    "CFGS Higiene Bucodental",
    "CFGS Anatomia Patologica y Citodiagnostico",
    "CFGM Cuidados Auxiliares de Enfermeria",
    "CFGM Farmacia y Parafarmacia",
    "CFGM Emergencias Sanitarias",
  ],
  "Hosteleria y Turismo": [
    "CFGS Gestion de Alojamientos Turisticos",
    "CFGS Agencias de Viajes y Gestion de Eventos",
    "CFGS Direccion de Cocina",
    "CFGS Direccion de Servicios de Restauracion",
    "CFGM Cocina y Gastronomia",
    "CFGM Servicios en Restauracion",
  ],
  "Edificacion y Obra Civil": [
    "CFGS Proyectos de Edificacion",
    "CFGS Proyectos de Obra Civil",
    "CFGM Construccion",
  ],
  "Fabricacion Mecanica": [
    "CFGS Diseno en Fabricacion Mecanica",
    "CFGS Programacion de la Produccion en Fabricacion Mecanica",
    "CFGM Mecanizado",
    "CFGM Soldadura y Caldereria",
  ],
  "Imagen y Sonido": [
    "CFGS Animaciones 3D, Juegos y Entornos Interactivos",
    "CFGS Produccion de Audiovisuales y Espectaculos",
    "CFGS Realizacion de Proyectos Audiovisuales y Espectaculos",
    "CFGS Iluminacion, Captacion y Tratamiento de Imagen",
    "CFGS Sonido para Audiovisuales y Espectaculos",
    "CFGM Video Disc-jockey y Sonido",
  ],
  "Transporte y Mantenimiento de Vehiculos": [
    "CFGS Automocion",
    "CFGM Electromecánica de Vehiculos Automoviles",
    "CFGM Carroceria",
  ],
  "Energia y Agua": [
    "CFGS Energias Renovables",
    "CFGS Eficiencia Energetica y Energia Solar Termica",
    "CFGM Redes e Instalaciones de Gas",
  ],
  "Actividades Fisicas y Deportivas": [
    "CFGS Ensenanza y Animacion Sociodeportiva",
    "CFGS Acondicionamiento Fisico",
    "CFGM Conduccion de Actividades Fisico-deportivas en el Medio Natural",
  ],
  "Artes Graficas": [
    "CFGS Diseno y Produccion Editorial",
    "CFGS Diseno y Gestion de la Produccion Grafica",
    "CFGM Preimpresion Digital",
    "CFGM Impresion Grafica",
  ],
  "Industrias Alimentarias": [
    "CFGS Vitivinicultura",
    "CFGS Procesos y Calidad en la Industria Alimentaria",
    "CFGM Elaboracion de Productos Alimenticios",
    "CFGM Aceites de Oliva y Vinos",
  ],
  "Quimica": [
    "CFGS Laboratorio de Analisis y de Control de Calidad",
    "CFGS Quimica Industrial",
    "CFGM Planta Quimica",
    "CFGM Operaciones de Laboratorio",
  ],
  "Servicios Socioculturales y a la Comunidad": [
    "CFGS Educacion Infantil",
    "CFGS Integracion Social",
    "CFGS Animacion Sociocultural y Turistica",
    "CFGS Mediacion Comunicativa",
    "CFGM Atencion a Personas en Situacion de Dependencia",
  ],
  "Seguridad y Medio Ambiente": [
    "CFGS Educacion y Control Ambiental",
    "CFGS Quimica y Salud Ambiental",
    "CFGM Emergencias y Proteccion Civil",
  ],
  "Agraria": [
    "CFGS Gestion Forestal y del Medio Natural",
    "CFGS Paisajismo y Medio Rural",
    "CFGM Produccion Agroecologica",
    "CFGM Jardineria y Floristeria",
  ],
  "Maritimo-Pesquera": [
    "CFGS Transporte Maritimo y Pesca de Altura",
    "CFGS Organizacion del Mantenimiento de Maquinaria de Buques y Embarcaciones",
    "CFGM Navegacion y Pesca de Litoral",
  ],
  "Textil, Confeccion y Piel": [
    "CFGS Patronaje y Moda",
    "CFGS Vestuario a Medida y de Espectaculos",
    "CFGM Confeccion y Moda",
  ],
  "Instalacion y Mantenimiento": [
    "CFGS Mecatronica Industrial",
    "CFGS Mantenimiento de Instalaciones Termicas y de Fluidos",
    "CFGM Instalaciones de Produccion de Calor",
    "CFGM Mantenimiento Electromecanico",
  ],
  "Madera, Mueble y Corcho": [
    "CFGS Diseno y Amueblamiento",
    "CFGM Carpinteria y Mueble",
    "CFGM Instalacion y Amueblamiento",
  ],
  "Vidrio y Ceramica": [
    "CFGS Desarrollo y Fabricacion de Productos Ceramicos",
    "CFGM Fabricacion de Productos Ceramicos",
  ],
};
