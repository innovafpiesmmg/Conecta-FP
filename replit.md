# FP Empleo - Portal de Empleo Privado

## Overview
Portal de empleo privado para titulados de Formacion Profesional (FP) y empresas. Implementa funcionalidades de privacidad RGPD incluyendo consentimiento explicito, visibilidad selectiva de perfiles, y derecho al olvido.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Drizzle ORM)
- **Auth**: Passport.js local strategy + bcrypt + express-session (PgSession store)
- **Roles**: ALUMNI (titulados FP) and COMPANY (empresas)

## Project Structure
```
client/src/
  App.tsx          - Main router with protected/guest routes
  lib/auth.tsx     - Auth context provider (login, logout, user state)
  pages/
    landing.tsx    - Public landing page
    login.tsx      - Login form
    register.tsx   - Registration with consent checkbox (Titulado FP/Empresa tabs)
    alumni-dashboard.tsx - Job search, applications, profile management
    company-dashboard.tsx - Job creation, candidate management, company profile
server/
  index.ts         - Express server setup
  db.ts            - Database connection (drizzle + pg pool)
  auth.ts          - Passport.js setup, session config, middleware
  routes.ts        - All API endpoints
  storage.ts       - Database CRUD operations (IStorage interface)
  seed.ts          - Seed data for demo (FP centers, titulados)
shared/
  schema.ts        - Drizzle schema + Zod validation schemas
```

## Key Features
- **GDPR Consent**: Registration requires explicit consent checkbox, timestamp saved
- **Selective Visibility**: Titulado FP profiles are private; only visible to companies when they voluntarily apply to a specific job
- **Right to Erasure**: Users can permanently delete their account and all associated data
- **Role-based Access**: Titulados FP see job search + applications; COMPANY sees job management + candidates
- **FP-focused**: Tailored for Formacion Profesional graduates (CFGS DAW, ASIR, DAM, etc.)
- **Familias Profesionales y Ciclos**: Both user profiles and job offers include familia profesional and ciclo formativo fields with cascading selectors (23 familias, each with relevant ciclos)

## Important Notes
- DB column `university` stores "Centro de FP" (kept for backwards compat)
- DB column `graduation_year` stores "Ano de promocion" (kept for backwards compat)
- DB columns `familia_profesional` and `ciclo_formativo` on both `users` and `job_offers` tables
- Internal role value is "ALUMNI" but displayed as "Titulado FP" in the UI
- `FAMILIAS_PROFESIONALES` and `CICLOS_POR_FAMILIA` constants exported from shared/schema.ts

## API Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Current user
- PATCH /api/auth/profile - Update profile
- DELETE /api/auth/account - Delete account (GDPR right to erasure)
- GET /api/jobs - List active jobs
- GET /api/jobs/mine - Company's own jobs
- POST /api/jobs - Create job (COMPANY only)
- GET /api/applications/mine - Titulado FP's applications
- GET /api/jobs/:jobId/applications - Job applicants (COMPANY only)
- POST /api/applications - Apply to job (ALUMNI/Titulado FP only)
- PATCH /api/applications/:id/status - Update application status (COMPANY only)

## Demo Credentials
- Titulado FP: maria@alumni.com / password123
- Company: empresa@techcorp.es / password123
