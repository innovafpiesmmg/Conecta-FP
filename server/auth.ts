import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { Express } from "express";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends import("@shared/schema").User {}
  }
}

const PgSession = connectPgSimple(session);

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "alumni-jobs-secret-key-change-in-production";

  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) return done(null, false, { message: "Email o contrasena incorrectos" });

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return done(null, false, { message: "Email o contrasena incorrectos" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "No autenticado" });
}

export function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "No autenticado" });
    if (req.user.role !== role) return res.status(403).json({ message: "No autorizado" });
    next();
  };
}
