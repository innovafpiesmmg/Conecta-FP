import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    const migrations: string[] = [
      `DO $$ BEGIN
        CREATE TYPE "user_role" AS ENUM('ALUMNI', 'COMPANY', 'ADMIN');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$`,

      `DO $$ BEGIN
        CREATE TYPE "application_status" AS ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$`,

      `DO $$ BEGIN
        CREATE TYPE "job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'REMOTE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$`,

      `CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "role" "user_role" NOT NULL,
        "name" text NOT NULL,
        "phone" text,
        "whatsapp" text,
        "bio" text,
        "cv_url" text,
        "university" text,
        "graduation_year" integer,
        "familia_profesional" text,
        "ciclo_formativo" text,
        "skills" text,
        "profile_photo_url" text,
        "company_name" text,
        "company_description" text,
        "company_website" text,
        "company_sector" text,
        "company_logo_url" text,
        "company_email" text,
        "company_cif" text,
        "consent_given" boolean NOT NULL DEFAULT false,
        "consent_timestamp" timestamp,
        "profile_public" boolean NOT NULL DEFAULT false,
        "email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" text,
        "password_reset_token" text,
        "password_reset_expires" timestamp,
        "totp_secret" text,
        "totp_enabled" boolean NOT NULL DEFAULT false,
        "cv_data" jsonb,
        "cv_last_updated_at" timestamp,
        "cv_reminder_sent_at" timestamp,
        "job_notifications_enabled" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "smtp_settings" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "host" text NOT NULL,
        "port" integer NOT NULL DEFAULT 587,
        "username" text NOT NULL,
        "password" text NOT NULL,
        "from_email" text NOT NULL,
        "from_name" text NOT NULL DEFAULT 'Conecta FP',
        "secure" boolean NOT NULL DEFAULT false,
        "enabled" boolean NOT NULL DEFAULT false,
        "updated_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "job_offers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "location" text NOT NULL,
        "salary_min" integer,
        "salary_max" integer,
        "job_type" "job_type" NOT NULL,
        "requirements" text,
        "familia_profesional" text,
        "ciclo_formativo" text,
        "active" boolean NOT NULL DEFAULT true,
        "expires_at" timestamp NOT NULL,
        "expiry_reminder_sent_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "fp_centers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "municipio" text NOT NULL,
        "isla" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "familias_profesionales" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL UNIQUE,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "ciclos_formativos" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "familia_id" varchar NOT NULL REFERENCES "familias_profesionales"("id") ON DELETE CASCADE,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`,

      `CREATE TABLE IF NOT EXISTS "applications" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "alumni_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "job_offer_id" varchar NOT NULL REFERENCES "job_offers"("id") ON DELETE CASCADE,
        "cover_letter" text,
        "status" "application_status" NOT NULL DEFAULT 'PENDING',
        "applied_at" timestamp NOT NULL DEFAULT now()
      )`,

      // Add columns that may not exist on older installations
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_notifications_enabled" boolean NOT NULL DEFAULT true`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsapp" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_name" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_description" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_website" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_sector" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_logo_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_email" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_cif" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_photo_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_url" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_data" jsonb`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_last_updated_at" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cv_reminder_sent_at" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_secret" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_enabled" boolean NOT NULL DEFAULT false`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean NOT NULL DEFAULT false`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" text`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" timestamp`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_public" boolean NOT NULL DEFAULT false`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "consent_given" boolean NOT NULL DEFAULT false`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "consent_timestamp" timestamp`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "expiry_reminder_sent_at" timestamp`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "salary_min" integer`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "salary_max" integer`,
      `ALTER TABLE "job_offers" ADD COLUMN IF NOT EXISTS "job_type" "job_type"`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cover_letter" text`,
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
