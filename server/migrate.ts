import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    const migrations: string[] = [
      `DO $$ BEGIN
        CREATE TYPE "application_status" AS ENUM('pending', 'reviewed', 'accepted', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$`,

      `CREATE TABLE IF NOT EXISTS "familias_profesionales" (
        "id" serial PRIMARY KEY,
        "codigo" varchar(10) NOT NULL UNIQUE,
        "nombre" varchar(200) NOT NULL,
        "descripcion" text
      )`,

      `CREATE TABLE IF NOT EXISTS "ciclos_formativos" (
        "id" serial PRIMARY KEY,
        "codigo" varchar(20) NOT NULL UNIQUE,
        "nombre" varchar(200) NOT NULL,
        "grado" varchar(20) NOT NULL,
        "familia_id" integer REFERENCES "familias_profesionales"("id")
      )`,

      `CREATE TABLE IF NOT EXISTS "fp_centers" (
        "id" serial PRIMARY KEY,
        "codigo" varchar(20) NOT NULL UNIQUE,
        "nombre" varchar(300) NOT NULL,
        "isla" varchar(50) NOT NULL,
        "municipio" varchar(100),
        "tipo" varchar(50)
      )`,

      `CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "email" varchar(255) NOT NULL UNIQUE,
        "password" text NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" varchar(50) NOT NULL,
        "phone" varchar(50),
        "university" varchar(255),
        "graduation_year" integer,
        "skills" text,
        "experience" text,
        "gdpr_consent" boolean DEFAULT false,
        "gdpr_consent_date" timestamp,
        "profile_visibility" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "familia_profesional" varchar(200),
        "ciclo_formativo" varchar(200),
        "company_email" varchar(255),
        "company_cif" varchar(20),
        "profile_photo_url" text,
        "company_logo_url" text,
        "cv_url" text,
        "email_verified" boolean DEFAULT false NOT NULL,
        "email_verification_token" text,
        "email_verification_expires" timestamp,
        "password_reset_token" text,
        "password_reset_expires" timestamp,
        "totp_secret" text,
        "totp_enabled" boolean DEFAULT false NOT NULL,
        "cv_data" jsonb,
        "cv_updated_at" timestamp,
        "cv_reminder_sent_at" timestamp,
        "company_description" text,
        "company_website" varchar(500),
        "whatsapp_number" varchar(50),
        "job_notifications_enabled" boolean DEFAULT true NOT NULL,
        "profile_headline" text
      )`,

      `CREATE TABLE IF NOT EXISTS "job_offers" (
        "id" serial PRIMARY KEY,
        "company_id" integer NOT NULL REFERENCES "users"("id"),
        "title" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "location" varchar(255),
        "salary" varchar(100),
        "requirements" text,
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "familia_profesional" varchar(200),
        "ciclo_formativo" varchar(200),
        "expires_at" timestamp NOT NULL,
        "expiry_reminder_sent" boolean DEFAULT false NOT NULL,
        "contract_type" varchar(100),
        "work_schedule" varchar(100)
      )`,

      `CREATE TABLE IF NOT EXISTS "applications" (
        "id" serial PRIMARY KEY,
        "job_id" integer NOT NULL REFERENCES "job_offers"("id"),
        "alumni_id" integer NOT NULL REFERENCES "users"("id"),
        "status" "application_status" DEFAULT 'pending',
        "applied_at" timestamp DEFAULT now(),
        "cover_letter" text,
        "status_updated_at" timestamp
      )`,

      `CREATE TABLE IF NOT EXISTS "smtp_settings" (
        "id" serial PRIMARY KEY,
        "host" varchar(255),
        "port" integer DEFAULT 587,
        "secure" boolean DEFAULT false,
        "username" varchar(255),
        "password" text,
        "from_email" varchar(255),
        "from_name" varchar(255),
        "enabled" boolean DEFAULT false,
        "updated_at" timestamp DEFAULT now()
      )`,

      // Add columns that may not exist on older installations
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_notifications_enabled" boolean DEFAULT true NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_headline" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_description" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_website" varchar(500)`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsapp_number" varchar(50)`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_data" jsonb`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_updated_at" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_reminder_sent_at" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_secret" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_enabled" boolean DEFAULT false NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_photo_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_logo_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" timestamp`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "expiry_reminder_sent" boolean DEFAULT false NOT NULL`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "contract_type" varchar(100)`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "work_schedule" varchar(100)`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cover_letter" text`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "status_updated_at" timestamp`,
    ];

    for (const sql of migrations) {
      await client.query(sql);
    }

    console.log("[OK] Migraciones aplicadas correctamente");
  } catch (err) {
    console.error("[ERROR] Error en migraciones:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
