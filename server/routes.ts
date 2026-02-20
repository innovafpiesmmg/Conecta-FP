import express, { type Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "./storage";
import { pool } from "./db";
import { setupAuth, requireAuth, requireRole } from "./auth";
import {
  registerAlumniSchema, registerCompanySchema, loginSchema,
  insertJobOfferSchema, insertApplicationSchema,
  updateProfileAlumniSchema, updateProfileCompanySchema,
  smtpSettingsSchema, cvDataSchema
} from "@shared/schema";
import type { User } from "@shared/schema";
import { sendVerificationEmail, sendPasswordResetEmail, sendTestEmail, sendApplicationStatusEmail, sendNewApplicationEmail, sendSuggestionEmail } from "./email";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_CV_TYPES = ["application/pdf"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CV_SIZE = 10 * 1024 * 1024;

for (const dir of ["avatars", "logos", "cvs"]) {
  const dirPath = path.join(UPLOADS_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createUploadMiddleware(subfolder: string, allowedTypes: string[], maxSize: number) {
  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOADS_DIR, subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage: diskStorage,
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido. Tipos aceptados: ${allowedTypes.join(", ")}`));
      }
    },
  });
}

const uploadAvatar = createUploadMiddleware("avatars", ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
const uploadLogo = createUploadMiddleware("logos", ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
const uploadCv = createUploadMiddleware("cvs", ALLOWED_CV_TYPES, MAX_CV_SIZE);

function deleteFileIfExists(filePath: string | null | undefined) {
  if (!filePath) return;
  const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  const fullPath = path.resolve(process.cwd(), relativePath);
  const uploadsRoot = path.resolve(UPLOADS_DIR);
  if (!fullPath.startsWith(uploadsRoot)) return;
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // ============ AUTH ROUTES ============

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { role } = req.body;
      let parsed;
      if (role === "COMPANY") {
        parsed = registerCompanySchema.parse(req.body);
      } else {
        parsed = registerAlumniSchema.parse(req.body);
      }

      if (!parsed.consentGiven) {
        return res.status(400).json({ message: "Debes aceptar el tratamiento de datos para registrarte" });
      }

      const existing = await storage.getUserByEmail(parsed.email);
      if (existing) return res.status(409).json({ message: "Este email ya esta registrado" });

      const hashedPassword = await bcrypt.hash(parsed.password, 12);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
        consentGiven: parsed.consentGiven === true,
        consentTimestamp: parsed.consentGiven === true ? new Date() : undefined,
        profilePublic: false,
        emailVerified: false,
        emailVerificationToken: verificationToken,
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      sendVerificationEmail(user.email, verificationToken, baseUrl).catch(console.error);

      res.status(201).json({ id: user.id, email: user.email, role: user.role, emailVerified: false });
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
      }
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: "Datos invalidos" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credenciales invalidas" });

      if (!user.emailVerified) {
        return res.status(403).json({ message: "Debes verificar tu correo electronico antes de iniciar sesion", code: "EMAIL_NOT_VERIFIED", email: user.email });
      }

      if (user.totpEnabled) {
        (req.session as any).pendingUserId = user.id;
        return res.status(200).json({ totpRequired: true, message: "Se requiere codigo de autenticacion" });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        const { password, totpSecret, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/totp/verify-login", async (req, res, next) => {
    try {
      const { code } = req.body;
      const pendingUserId = (req.session as any).pendingUserId;
      if (!pendingUserId) {
        return res.status(400).json({ message: "No hay inicio de sesion pendiente" });
      }

      const user = await storage.getUser(pendingUserId);
      if (!user || !user.totpSecret || !user.totpEnabled) {
        return res.status(400).json({ message: "Configuracion TOTP invalida" });
      }

      const totp = new OTPAuth.TOTP({
        issuer: "Conecta FP",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.totpSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(401).json({ message: "Codigo de autenticacion invalido" });
      }

      delete (req.session as any).pendingUserId;

      req.logIn(user, (err) => {
        if (err) return next(err);
        const { password, totpSecret, ...safeUser } = user;
        res.json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Error al cerrar sesion" });
      res.json({ message: "Sesion cerrada" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ message: "No autenticado" });
    const { password, totpSecret, ...safeUser } = req.user;
    res.json(safeUser);
  });

  // ============ EMAIL VERIFICATION ============

  app.get("/api/auth/verify-email", async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token no valido" });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Token de verificacion invalido o expirado" });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email ya verificado" });
      }

      await storage.updateUser(user.id, { emailVerified: true, emailVerificationToken: null } as any);
      res.json({ message: "Email verificado correctamente" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/resend-verification", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email requerido" });

      const user = await storage.getUserByEmail(email);
      if (!user || user.emailVerified) {
        return res.json({ message: "Si el email existe y no esta verificado, se ha enviado un correo de verificacion" });
      }

      const newToken = crypto.randomBytes(32).toString("hex");
      await storage.updateUser(user.id, { emailVerificationToken: newToken } as any);

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      sendVerificationEmail(user.email, newToken, baseUrl).catch(console.error);

      res.json({ message: "Si el email existe y no esta verificado, se ha enviado un correo de verificacion" });
    } catch (err) {
      next(err);
    }
  });

  // ============ PASSWORD RESET ============

  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email requerido" });

      const user = await storage.getUserByEmail(email);
      if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await storage.updateUser(user.id, { passwordResetToken: resetToken, passwordResetExpires: expires } as any);

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        sendPasswordResetEmail(user.email, resetToken, baseUrl).catch(console.error);
      }

      res.json({ message: "Si el email existe, se ha enviado un correo con instrucciones para restablecer la contrasena" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token y nueva contrasena son requeridos" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrasena debe tener al menos 8 caracteres" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
        return res.status(400).json({ message: "Token invalido o expirado" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      } as any);

      res.json({ message: "Contrasena restablecida correctamente" });
    } catch (err) {
      next(err);
    }
  });

  // ============ TOTP 2FA ============

  app.post("/api/auth/totp/setup", requireAuth, async (req, res, next) => {
    try {
      const user = req.user!;
      if (user.totpEnabled) {
        return res.status(400).json({ message: "2FA ya esta activado" });
      }

      const secret = new OTPAuth.Secret({ size: 20 });
      const totp = new OTPAuth.TOTP({
        issuer: "Conecta FP",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
      });

      const uri = totp.toString();
      const qrCode = await QRCode.toDataURL(uri);

      await storage.updateUser(user.id, { totpSecret: secret.base32 } as any);

      res.json({ qrCode, secret: secret.base32, uri });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/totp/confirm", requireAuth, async (req, res, next) => {
    try {
      const user = req.user!;
      const { code } = req.body;

      if (!user.totpSecret) {
        return res.status(400).json({ message: "Primero debes iniciar la configuracion 2FA" });
      }

      const totp = new OTPAuth.TOTP({
        issuer: "Conecta FP",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.totpSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(401).json({ message: "Codigo invalido" });
      }

      await storage.updateUser(user.id, { totpEnabled: true } as any);
      res.json({ message: "2FA activado correctamente" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/totp/disable", requireAuth, async (req, res, next) => {
    try {
      const user = req.user!;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Se requiere la contrasena para desactivar 2FA" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Contrasena incorrecta" });
      }

      await storage.updateUser(user.id, { totpEnabled: false, totpSecret: null } as any);
      res.json({ message: "2FA desactivado correctamente" });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req, res, next) => {
    try {
      const user = req.user!;
      let parsed;
      if (user.role === "ALUMNI") {
        parsed = updateProfileAlumniSchema.parse(req.body);
      } else {
        parsed = updateProfileCompanySchema.parse(req.body);
      }

      const updated = await storage.updateUser(user.id, parsed);
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });

      const { password, totpSecret, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
      next(err);
    }
  });

  // ============ RIGHT TO ERASURE (GDPR Art. 17) ============
  app.delete("/api/auth/account", requireAuth, async (req, res, next) => {
    try {
      if (req.user!.role === "ADMIN") {
        return res.status(403).json({ message: "Los administradores no pueden eliminar su propia cuenta desde aqui" });
      }
      const userId = req.user!.id;
      const userProfilePhoto = req.user!.profilePhotoUrl;
      const userCvUrl = req.user!.cvUrl;
      const userCompanyLogo = req.user!.companyLogoUrl;
      req.logout(async (err) => {
        if (err) return next(err);
        deleteFileIfExists(userProfilePhoto as string);
        deleteFileIfExists(userCvUrl as string);
        deleteFileIfExists(userCompanyLogo as string);
        await storage.deleteUser(userId);
        req.session.destroy((err) => {
          if (err) console.error("Error destroying session:", err);
          res.json({ message: "Cuenta y datos eliminados permanentemente" });
        });
      });
    } catch (err) {
      next(err);
    }
  });

  // ============ JOB ROUTES ============

  app.get("/api/public/alumni", async (_req, res, next) => {
    try {
      const alumni = await storage.getPublicAlumni();
      res.json(alumni);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/public/companies", async (_req, res, next) => {
    try {
      const companies = await storage.getPublicCompanies();
      res.json(companies);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/suggestions", async (req, res, next) => {
    try {
      const { name, email, category, message } = req.body;
      if (!name || !email || !category || !message) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
      if (typeof name !== "string" || name.length > 100) {
        return res.status(400).json({ message: "Nombre inválido" });
      }
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Email inválido" });
      }
      if (!["general", "bug", "feature", "ux", "other"].includes(category)) {
        return res.status(400).json({ message: "Categoría inválida" });
      }
      if (typeof message !== "string" || message.length < 10 || message.length > 2000) {
        return res.status(400).json({ message: "El mensaje debe tener entre 10 y 2000 caracteres" });
      }

      const sanitizedName = name.replace(/[<>&"']/g, "");
      const sanitizedMessage = message.replace(/[<>&"']/g, "");
      const sanitizedEmail = email.replace(/[<>&"']/g, "");

      const sent = await sendSuggestionEmail(sanitizedName, sanitizedEmail, category, sanitizedMessage);
      if (sent) {
        res.json({ message: "Sugerencia enviada correctamente" });
      } else {
        res.json({ message: "Sugerencia registrada. El servicio de correo no está configurado actualmente, pero hemos recibido tu mensaje." });
      }
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/jobs", requireAuth, async (req, res, next) => {
    try {
      const jobs = await storage.getActiveJobs();
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/jobs/mine", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const jobs = await storage.getJobsByCompany(req.user!.id);
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/jobs", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (body.expiresAt && typeof body.expiresAt === "string") {
        body.expiresAt = new Date(body.expiresAt);
      }
      const parsed = insertJobOfferSchema.parse(body);
      const job = await storage.createJob(req.user!.id, parsed);
      res.status(201).json(job);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
      next(err);
    }
  });

  app.patch("/api/jobs/:id", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.companyId !== req.user!.id) {
        return res.status(403).json({ message: "No autorizado" });
      }
      const body = { ...req.body };
      if (body.expiresAt && typeof body.expiresAt === "string") {
        body.expiresAt = new Date(body.expiresAt);
      }
      const allowedFields = ["title", "description", "location", "salaryMin", "salaryMax", "jobType", "requirements", "familiaProfesional", "cicloFormativo", "expiresAt"];
      const updateData: any = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
      const updated = await storage.updateJob(req.params.id, updateData);
      res.json(updated);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos inválidos", errors: err.errors });
      next(err);
    }
  });

  // ============ APPLICATION ROUTES ============

  app.get("/api/applications/mine", requireRole("ALUMNI"), async (req, res, next) => {
    try {
      const apps = await storage.getApplicationsByAlumni(req.user!.id);
      res.json(apps);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/jobs/:jobId/applications", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job || job.companyId !== req.user!.id) {
        return res.status(403).json({ message: "No autorizado" });
      }
      const apps = await storage.getApplicationsByJob(req.params.jobId);
      res.json(apps);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/applications", requireRole("ALUMNI"), async (req, res, next) => {
    try {
      const parsed = insertApplicationSchema.parse(req.body);
      const existing = await storage.getApplication(req.user!.id, parsed.jobOfferId);
      if (existing) return res.status(409).json({ message: "Ya te has postulado a esta oferta" });

      const job = await storage.getJob(parsed.jobOfferId);
      if (!job || !job.active) return res.status(404).json({ message: "Oferta no encontrada o inactiva" });

      const app = await storage.createApplication(req.user!.id, parsed);
      res.status(201).json(app);

      try {
        const company = await storage.getUser(job.companyId);
        if (company) {
          const alumniUser = req.user as User;
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          const companyEmail = company.companyEmail || company.email;
          sendNewApplicationEmail(
            companyEmail,
            company.companyName || company.name,
            alumniUser.name,
            job.title,
            baseUrl
          ).catch(() => {});
        }
      } catch (_) {}
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
      next(err);
    }
  });

  // ============ CV BUILDER ROUTES ============

  app.get("/api/cv", requireRole("ALUMNI"), async (req, res, next) => {
    try {
      const user = req.user as User;
      res.json({ cvData: user.cvData || null, cvLastUpdatedAt: user.cvLastUpdatedAt || null });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/cv", requireRole("ALUMNI"), async (req, res, next) => {
    try {
      const parsed = cvDataSchema.parse(req.body);
      const updated = await storage.updateUserCv(req.user!.id, parsed);
      res.json({ cvData: updated.cvData, cvLastUpdatedAt: updated.cvLastUpdatedAt });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos del CV inválidos", errors: err.errors });
      next(err);
    }
  });

  app.get("/api/cv/:alumniId", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const alumniId = req.params.alumniId;
      if (user.role === "ALUMNI" && user.id !== alumniId) {
        return res.status(403).json({ message: "No autorizado" });
      }
      if (user.role === "COMPANY") {
        const hasApplication = await storage.hasApplicationFromAlumni(alumniId, user.id);
        if (!hasApplication) {
          return res.status(403).json({ message: "Solo puedes ver el CV de candidatos que se han postulado a tus ofertas" });
        }
      }
      const alumni = await storage.getUser(alumniId);
      if (!alumni || alumni.role !== "ALUMNI") {
        return res.status(404).json({ message: "Candidato no encontrado" });
      }
      res.json({ cvData: alumni.cvData || null, cvLastUpdatedAt: alumni.cvLastUpdatedAt || null });
    } catch (err) {
      next(err);
    }
  });

  // ============ JOB EXPIRY ROUTES ============

  app.patch("/api/jobs/:id/extend", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.companyId !== req.user!.id) {
        return res.status(403).json({ message: "No autorizado" });
      }
      const { expiresAt } = req.body;
      if (!expiresAt) return res.status(400).json({ message: "Fecha de expiración requerida" });
      const newDate = new Date(expiresAt);
      if (newDate <= new Date()) return res.status(400).json({ message: "La fecha de expiración debe ser futura" });
      const updated = await storage.extendJobExpiry(req.params.id, newDate);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // ============ ADMIN ROUTES ============

  app.get("/api/admin/stats", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/metrics", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const jobsByFamilia = await pool.query(`
        SELECT familia_profesional AS name, COUNT(*) AS job_count,
          COUNT(*) FILTER (WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())) AS active_jobs,
          COALESCE((SELECT COUNT(*) FROM applications a JOIN job_offers j2 ON a.job_offer_id = j2.id WHERE j2.familia_profesional = jo.familia_profesional), 0) AS application_count
        FROM job_offers jo
        WHERE familia_profesional IS NOT NULL AND familia_profesional != ''
        GROUP BY familia_profesional
        ORDER BY job_count DESC
      `);

      const jobsByCiclo = await pool.query(`
        SELECT ciclo_formativo AS name, familia_profesional AS familia, COUNT(*) AS job_count,
          COUNT(*) FILTER (WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())) AS active_jobs,
          COALESCE((SELECT COUNT(*) FROM applications a JOIN job_offers j2 ON a.job_offer_id = j2.id WHERE j2.ciclo_formativo = jo.ciclo_formativo), 0) AS application_count
        FROM job_offers jo
        WHERE ciclo_formativo IS NOT NULL AND ciclo_formativo != ''
        GROUP BY ciclo_formativo, familia_profesional
        ORDER BY job_count DESC
      `);

      const jobsByLocation = await pool.query(`
        SELECT location AS name, COUNT(*) AS job_count,
          COUNT(*) FILTER (WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())) AS active_jobs,
          COALESCE((SELECT COUNT(*) FROM applications a JOIN job_offers j2 ON a.job_offer_id = j2.id WHERE j2.location = jo.location), 0) AS application_count
        FROM job_offers jo
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY job_count DESC
      `);

      const alumniByFamilia = await pool.query(`
        SELECT familia_profesional AS name, COUNT(*) AS alumni_count
        FROM users
        WHERE role = 'ALUMNI' AND familia_profesional IS NOT NULL AND familia_profesional != ''
        GROUP BY familia_profesional
        ORDER BY alumni_count DESC
      `);

      const alumniByCiclo = await pool.query(`
        SELECT ciclo_formativo AS name, familia_profesional AS familia, COUNT(*) AS alumni_count
        FROM users
        WHERE role = 'ALUMNI' AND ciclo_formativo IS NOT NULL AND ciclo_formativo != ''
        GROUP BY ciclo_formativo, familia_profesional
        ORDER BY alumni_count DESC
      `);

      res.json({
        jobsByFamilia: jobsByFamilia.rows.map(r => ({ name: r.name, jobCount: Number(r.job_count), activeJobs: Number(r.active_jobs), applicationCount: Number(r.application_count) })),
        jobsByCiclo: jobsByCiclo.rows.map(r => ({ name: r.name, familia: r.familia, jobCount: Number(r.job_count), activeJobs: Number(r.active_jobs), applicationCount: Number(r.application_count) })),
        jobsByLocation: jobsByLocation.rows.map(r => ({ name: r.name, jobCount: Number(r.job_count), activeJobs: Number(r.active_jobs), applicationCount: Number(r.application_count) })),
        alumniByFamilia: alumniByFamilia.rows.map(r => ({ name: r.name, alumniCount: Number(r.alumni_count) })),
        alumniByCiclo: alumniByCiclo.rows.map(r => ({ name: r.name, familia: r.familia, alumniCount: Number(r.alumni_count) })),
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/users", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const allUsers = await storage.getAllUsers();
      const safeUsers = allUsers.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/jobs", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const allJobs = await storage.getAllJobs();
      res.json(allJobs);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/applications", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const allApps = await storage.getAllApplications();
      res.json(allApps);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/users/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const target = await storage.getUser(req.params.id);
      if (!target) return res.status(404).json({ message: "Usuario no encontrado" });
      if (target.role === "ADMIN") return res.status(403).json({ message: "No se puede eliminar un administrador" });
      await storage.deleteUser(req.params.id);
      res.json({ message: "Usuario eliminado" });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/jobs/:id/toggle", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) return res.status(404).json({ message: "Oferta no encontrada" });
      const updated = await storage.toggleJobActive(job.id, !job.active);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/jobs/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) return res.status(404).json({ message: "Oferta no encontrada" });
      await storage.adminDeleteJob(req.params.id);
      res.json({ message: "Oferta eliminada" });
    } catch (err) {
      next(err);
    }
  });

  // ============ SMTP ADMIN ROUTES ============

  app.get("/api/admin/smtp", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const settings = await storage.getSmtpSettings();
      if (!settings) return res.json(null);
      const { password, ...safe } = settings;
      res.json({ ...safe, password: "••••••••" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/smtp", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const parsed = smtpSettingsSchema.parse(req.body);
      const existing = await storage.getSmtpSettings();
      let passwordToSave = parsed.password;
      if (parsed.password === "••••••••" && existing) {
        passwordToSave = existing.password;
      }
      const settings = await storage.upsertSmtpSettings({ ...parsed, password: passwordToSave });
      const { password, ...safe } = settings;
      res.json({ ...safe, password: "••••••••" });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
      next(err);
    }
  });

  app.post("/api/admin/smtp/test", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email de destino requerido" });
      const sent = await sendTestEmail(email);
      if (sent) {
        res.json({ message: "Correo de prueba enviado correctamente" });
      } else {
        res.status(400).json({ message: "No se pudo enviar el correo. Verifica la configuracion SMTP." });
      }
    } catch (err) {
      next(err);
    }
  });

  // ============ FP CENTERS (Admin CRUD) ============

  app.get("/api/admin/fp-centers", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const centers = await storage.getAllFpCenters();
      res.json(centers);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/fp-centers", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const { name, municipio, isla, active } = req.body;
      if (!name || !municipio || !isla) return res.status(400).json({ message: "Nombre, municipio e isla son obligatorios" });
      const center = await storage.createFpCenter({ name, municipio, isla, active: active ?? true });
      res.status(201).json(center);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/fp-centers/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const center = await storage.updateFpCenter(req.params.id, req.body);
      if (!center) return res.status(404).json({ message: "Centro no encontrado" });
      res.json(center);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/fp-centers/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      await storage.deleteFpCenter(req.params.id);
      res.json({ message: "Centro eliminado" });
    } catch (err) { next(err); }
  });

  // ============ FAMILIAS PROFESIONALES (Admin CRUD) ============

  app.get("/api/admin/familias", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const familias = await storage.getAllFamilias();
      res.json(familias);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/familias", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const { name, active } = req.body;
      if (!name) return res.status(400).json({ message: "El nombre es obligatorio" });
      const familia = await storage.createFamilia({ name, active: active ?? true });
      res.status(201).json(familia);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/familias/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const familia = await storage.updateFamilia(req.params.id, req.body);
      if (!familia) return res.status(404).json({ message: "Familia no encontrada" });
      res.json(familia);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/familias/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      await storage.deleteFamilia(req.params.id);
      res.json({ message: "Familia eliminada" });
    } catch (err) { next(err); }
  });

  // ============ CICLOS FORMATIVOS (Admin CRUD) ============

  app.get("/api/admin/ciclos", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const ciclos = await storage.getAllCiclos();
      res.json(ciclos);
    } catch (err) { next(err); }
  });

  app.get("/api/admin/ciclos/by-familia/:familiaId", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const ciclos = await storage.getCiclosByFamilia(req.params.familiaId);
      res.json(ciclos);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/ciclos", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const { name, familiaId, active } = req.body;
      if (!name || !familiaId) return res.status(400).json({ message: "Nombre y familia son obligatorios" });
      const ciclo = await storage.createCiclo({ name, familiaId, active: active ?? true });
      res.status(201).json(ciclo);
    } catch (err) { next(err); }
  });

  app.patch("/api/admin/ciclos/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const ciclo = await storage.updateCiclo(req.params.id, req.body);
      if (!ciclo) return res.status(404).json({ message: "Ciclo no encontrado" });
      res.json(ciclo);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/ciclos/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      await storage.deleteCiclo(req.params.id);
      res.json({ message: "Ciclo eliminado" });
    } catch (err) { next(err); }
  });

  // ============ PUBLIC ENDPOINTS for Familias/Ciclos/Centers ============

  app.get("/api/public/familias", async (req, res, next) => {
    try {
      const familias = await storage.getActiveFamilias();
      res.json(familias);
    } catch (err) { next(err); }
  });

  app.get("/api/public/ciclos/:familiaId", async (req, res, next) => {
    try {
      const ciclos = await storage.getActiveCiclosByFamilia(req.params.familiaId);
      res.json(ciclos);
    } catch (err) { next(err); }
  });

  app.get("/api/public/fp-centers", async (req, res, next) => {
    try {
      const centers = await storage.getActiveFpCenters();
      res.json(centers);
    } catch (err) { next(err); }
  });

  // ============ FILE UPLOAD ROUTES ============

  app.use("/uploads/avatars", express.static(path.join(UPLOADS_DIR, "avatars")));
  app.use("/uploads/logos", express.static(path.join(UPLOADS_DIR, "logos")));

  app.get("/api/uploads/cv/:filename", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.role !== "COMPANY" && user.role !== "ADMIN") {
      if (!user.cvUrl || !user.cvUrl.endsWith(req.params.filename)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }
    const filePath = path.resolve(UPLOADS_DIR, "cvs", req.params.filename);
    const uploadsRoot = path.resolve(UPLOADS_DIR);
    if (!filePath.startsWith(uploadsRoot)) return res.status(400).json({ message: "Ruta no valida" });
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Archivo no encontrado" });
    res.sendFile(filePath);
  });

  app.post("/api/uploads/profile-photo", requireAuth, (req, res, next) => {
    uploadAvatar.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "El archivo es demasiado grande. Maximo 5MB." });
        }
        return res.status(400).json({ message: err.message || "Error al subir el archivo" });
      }
      if (!req.file) return res.status(400).json({ message: "No se ha proporcionado ningun archivo" });

      const fileUrl = `/uploads/avatars/${req.file.filename}`;
      deleteFileIfExists(req.user!.profilePhotoUrl);
      storage.updateUser(req.user!.id, { profilePhotoUrl: fileUrl } as any)
        .then((updated) => {
          if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
          const { password, totpSecret, ...safeUser } = updated;
          res.json(safeUser);
        })
        .catch(next);
    });
  });

  app.delete("/api/uploads/profile-photo", requireAuth, async (req, res, next) => {
    try {
      deleteFileIfExists(req.user!.profilePhotoUrl);
      const updated = await storage.updateUser(req.user!.id, { profilePhotoUrl: null } as any);
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      const { password, totpSecret, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/uploads/company-logo", requireRole("COMPANY"), (req, res, next) => {
    uploadLogo.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "El archivo es demasiado grande. Maximo 5MB." });
        }
        return res.status(400).json({ message: err.message || "Error al subir el archivo" });
      }
      if (!req.file) return res.status(400).json({ message: "No se ha proporcionado ningun archivo" });

      const fileUrl = `/uploads/logos/${req.file.filename}`;
      deleteFileIfExists(req.user!.companyLogoUrl);
      storage.updateUser(req.user!.id, { companyLogoUrl: fileUrl } as any)
        .then((updated) => {
          if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
          const { password, totpSecret, ...safeUser } = updated;
          res.json(safeUser);
        })
        .catch(next);
    });
  });

  app.delete("/api/uploads/company-logo", requireRole("COMPANY"), async (req, res, next) => {
    try {
      deleteFileIfExists(req.user!.companyLogoUrl);
      const updated = await storage.updateUser(req.user!.id, { companyLogoUrl: null } as any);
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      const { password, totpSecret, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/uploads/cv", requireRole("ALUMNI"), (req, res, next) => {
    uploadCv.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "El archivo es demasiado grande. Maximo 10MB." });
        }
        return res.status(400).json({ message: err.message || "Error al subir el archivo" });
      }
      if (!req.file) return res.status(400).json({ message: "No se ha proporcionado ningun archivo" });

      const fileUrl = `/uploads/cvs/${req.file.filename}`;
      deleteFileIfExists(req.user!.cvUrl);
      storage.updateUser(req.user!.id, { cvUrl: fileUrl } as any)
        .then((updated) => {
          if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
          const { password, totpSecret, ...safeUser } = updated;
          res.json(safeUser);
        })
        .catch(next);
    });
  });

  app.delete("/api/uploads/cv", requireRole("ALUMNI"), async (req, res, next) => {
    try {
      deleteFileIfExists(req.user!.cvUrl);
      const updated = await storage.updateUser(req.user!.id, { cvUrl: null } as any);
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      const { password, totpSecret, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  // ============ APPLICATION STATUS ROUTES ============

  app.patch("/api/applications/:id/status", requireRole("COMPANY"), async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].includes(status)) {
        return res.status(400).json({ message: "Estado invalido" });
      }

      const application = await storage.getApplicationById(req.params.id);
      if (!application) return res.status(404).json({ message: "Candidatura no encontrada" });

      const job = await storage.getJob(application.jobOfferId);
      if (!job || job.companyId !== req.user!.id) {
        return res.status(403).json({ message: "No autorizado para modificar esta candidatura" });
      }

      const updated = await storage.updateApplicationStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ message: "Candidatura no encontrada" });

      if (status === "ACCEPTED") {
        await storage.deactivateJob(job.id);
      }

      const alumni = await storage.getUser(application.alumniId);
      if (alumni && job) {
        const companyName = req.user!.companyName || req.user!.name;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        sendApplicationStatusEmail(alumni.email, alumni.name, job.title, companyName, status, baseUrl).catch(() => {});
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
