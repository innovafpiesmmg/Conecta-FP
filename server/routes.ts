import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import {
  registerAlumniSchema, registerCompanySchema, loginSchema,
  insertJobOfferSchema, insertApplicationSchema,
  updateProfileAlumniSchema, updateProfileCompanySchema
} from "@shared/schema";

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

      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
        consentGiven: parsed.consentGiven === true,
        consentTimestamp: parsed.consentGiven === true ? new Date() : undefined,
        profilePublic: false,
      });

      res.status(201).json({ id: user.id, email: user.email, role: user.role });
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

      req.logIn(user, (err) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Error al cerrar sesion" });
      res.json({ message: "Sesion cerrada" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ message: "No autenticado" });
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
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

      const { password, ...safeUser } = updated;
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
      req.logout(async (err) => {
        if (err) return next(err);
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
      const parsed = insertJobOfferSchema.parse(req.body);
      const job = await storage.createJob(req.user!.id, parsed);
      res.status(201).json(job);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
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
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: "Datos invalidos", errors: err.errors });
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
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
