# Conecta FP - Portal de Empleo Privado

## Overview
Portal de empleo privado para titulados de Formacion Profesional (FP) y empresas. Implementa funcionalidades de privacidad RGPD incluyendo consentimiento explicito, visibilidad selectiva de perfiles, y derecho al olvido.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Drizzle ORM)
- **Auth**: Passport.js local strategy + bcrypt + express-session (PgSession store)
- **Email**: Nodemailer with admin-configurable SMTP settings stored in DB
- **2FA**: TOTP-based (otpauth + qrcode libraries) - optional per user
- **File Uploads**: Multer with local disk storage (uploads/ directory)
- **Roles**: ALUMNI (titulados FP), COMPANY (empresas), and ADMIN (administradores)

## Project Structure
```
client/src/
  App.tsx          - Main router with protected/guest routes
  lib/auth.tsx     - Auth context provider (login, logout, user state)
  components/
    totp-security.tsx - Shared TOTP 2FA setup/disable component
  pages/
    landing.tsx    - Public landing page
    login.tsx      - Login form with TOTP step-up + forgot password link
    register.tsx   - Registration with consent checkbox + email verification notice
    verify-email.tsx - Email verification page (token from URL)
    forgot-password.tsx - Request password reset email
    reset-password.tsx  - Set new password (token from URL)
    alumni-dashboard.tsx - Job search, applications, profile management + 2FA
    company-dashboard.tsx - Job creation, candidate management, company profile + 2FA
    admin-dashboard.tsx  - Admin panel: stats, user/job/app management + SMTP config
server/
  index.ts         - Express server setup
  db.ts            - Database connection (drizzle + pg pool)
  auth.ts          - Passport.js setup, session config, middleware
  routes.ts        - All API endpoints
  storage.ts       - Database CRUD operations (IStorage interface)
  email.ts         - Email service (nodemailer, dynamic SMTP from DB)
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
- **Familias Profesionales y Ciclos**: Both user profiles and job offers include familia profesional and ciclo formativo fields with cascading selectors (23 familias, each with relevant ciclos). All names use proper Spanish characters (ñ, á, é, í, ó, ú)
- **Editable Job Offers**: Companies can edit their job offers (title, description, location, salary, requirements, etc.)
- **Company Details**: Companies have companyEmail and companyCif fields in registration and profile
- **Required Expiry Dates**: All job offers must have an expiry date (expiresAt is NOT NULL)
- **Search/Filter**: All dashboards (alumni, company, admin) include search and filter functionality
- **Admin Panel**: Full admin dashboard at /admin with platform stats, user management, job management, application overview, and SMTP configuration
- **Email Verification**: New registrations require email verification before login
- **Password Reset**: Forgot password flow sends reset link via email (1 hour expiry)
- **TOTP 2FA**: Optional two-factor authentication via authenticator apps (Google Authenticator, Authy, etc.)
- **Admin SMTP Config**: Admin can configure SMTP server, test email delivery, and enable/disable email sending
- **Dynamic CV Builder**: Alumni can build structured CVs (education, experience, languages, additional info) stored as JSONB
- **Annual CV Reminders**: Scheduler sends email reminders to alumni who haven't updated CV in 1+ year
- **Job Expiry System**: Companies can set expiry dates on job offers; auto-deactivated when expired; 7-day email reminders

## Important Notes
- DB column `university` stores "Centro de FP" (kept for backwards compat)
- DB column `graduation_year` stores "Ano de promocion" (kept for backwards compat)
- DB columns `familia_profesional` and `ciclo_formativo` on both `users` and `job_offers` tables
- DB columns `company_email` and `company_cif` on `users` table for company details
- Internal role value is "ALUMNI" but displayed as "Titulado FP" in the UI
- ADMIN role users are redirected to /admin dashboard on login
- `FAMILIAS_PROFESIONALES` and `CICLOS_POR_FAMILIA` constants exported from shared/schema.ts
- Existing users (pre-verification feature) have emailVerified=true
- Forgot password always returns success to prevent email enumeration
- TOTP uses window=1 for clock skew tolerance
- Password reset tokens expire after 1 hour
- DB table `smtp_settings` stores SMTP configuration (single row, id=1)

## API Endpoints

### Auth
- POST /api/auth/register - Register new user (sends verification email)
- POST /api/auth/login - Login (returns totpRequired if 2FA enabled)
- POST /api/auth/logout - Logout
- GET /api/auth/me - Current user
- PATCH /api/auth/profile - Update profile
- DELETE /api/auth/account - Delete account (GDPR right to erasure)
- GET /api/auth/verify-email?token= - Verify email address
- POST /api/auth/resend-verification - Resend verification email
- POST /api/auth/forgot-password - Request password reset email
- POST /api/auth/reset-password - Reset password with token

### TOTP 2FA
- POST /api/auth/totp/setup - Generate TOTP secret + QR code
- POST /api/auth/totp/confirm - Confirm TOTP setup with code
- POST /api/auth/totp/disable - Disable TOTP (requires password)
- POST /api/auth/totp/verify-login - Complete TOTP step during login

### File Uploads
- POST /api/uploads/profile-photo - Upload profile photo (authenticated, JPG/PNG/WebP, max 5MB)
- DELETE /api/uploads/profile-photo - Delete profile photo (authenticated)
- POST /api/uploads/company-logo - Upload company logo (COMPANY only, JPG/PNG/WebP, max 5MB)
- DELETE /api/uploads/company-logo - Delete company logo (COMPANY only)
- POST /api/uploads/cv - Upload CV (ALUMNI only, PDF, max 10MB)
- DELETE /api/uploads/cv - Delete CV (ALUMNI only)

### Jobs & Applications
- GET /api/jobs - List active jobs
- GET /api/jobs/mine - Company's own jobs
- POST /api/jobs - Create job (COMPANY only)
- PATCH /api/jobs/:id - Edit job (COMPANY only, own jobs)
- GET /api/applications/mine - Titulado FP's applications
- GET /api/jobs/:jobId/applications - Job applicants (COMPANY only)
- POST /api/applications - Apply to job (ALUMNI/Titulado FP only)
- PATCH /api/applications/:id/status - Update application status (COMPANY only)

### CV Builder
- GET /api/cv - Get own CV data (ALUMNI only)
- PUT /api/cv - Save/update CV data (ALUMNI only)
- GET /api/cv/:alumniId - View alumni CV (authenticated; companies only if alumni applied to their jobs)

### Job Expiry
- PATCH /api/jobs/:id/extend - Extend job expiry date (COMPANY only, own jobs)

### Admin
- GET /api/admin/stats - Platform statistics (ADMIN only)
- GET /api/admin/users - All users list (ADMIN only)
- GET /api/admin/jobs - All jobs list (ADMIN only)
- GET /api/admin/applications - All applications list (ADMIN only)
- DELETE /api/admin/users/:id - Delete user (ADMIN only)
- PATCH /api/admin/jobs/:id/toggle - Toggle job active status (ADMIN only)
- DELETE /api/admin/jobs/:id - Delete job (ADMIN only)
- GET /api/admin/smtp - Get SMTP configuration (ADMIN only)
- POST /api/admin/smtp - Save SMTP configuration (ADMIN only)
- POST /api/admin/smtp/test - Send test email (ADMIN only)

## File Upload Details
- Uploads stored in `uploads/` directory (avatars/, logos/, cvs/ subdirectories)
- Profile photos and logos served statically at `/uploads/avatars/...` and `/uploads/logos/...`
- CVs served via authenticated endpoint: GET /api/uploads/cv/:filename (requires login; alumni can only access own CV, companies/admin can access all)
- DB columns: `profile_photo_url`, `company_logo_url`, `cv_url` on users table
- Old files automatically deleted when replaced or account deleted
- Images: JPG/PNG/WebP, max 5MB; CV: PDF only, max 10MB
- Filenames randomized (crypto.randomBytes) to prevent conflicts and path traversal
- deleteFileIfExists enforces path stays within uploads/ directory (prevents path traversal deletion)

## Demo Credentials
- Admin: admin@conectafp.es / admin123
- Titulado FP: maria@alumni.com / password123
- Company: empresa@techcorp.es / password123
