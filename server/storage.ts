import { eq, and, desc, count, sql, lt, isNull, isNotNull, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users, jobOffers, applications, smtpSettings,
  type User, type InsertUser, type JobOffer, type InsertJobOffer,
  type Application, type InsertApplication, type SmtpSettings,
  type CvData
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { consentTimestamp?: Date }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  getActiveJobs(): Promise<(JobOffer & { company?: { companyName: string | null; name: string } })[]>;
  getJobsByCompany(companyId: string): Promise<JobOffer[]>;
  getJob(id: string): Promise<JobOffer | undefined>;
  createJob(companyId: string, data: InsertJobOffer): Promise<JobOffer>;
  updateJob(id: string, data: Partial<InsertJobOffer>): Promise<JobOffer | undefined>;
  deleteJobsByCompany(companyId: string): Promise<void>;

  getApplicationsByAlumni(alumniId: string): Promise<(Application & { jobOffer?: JobOffer & { company?: { companyName: string | null; name: string } } })[]>;
  getApplicationsByJob(jobOfferId: string): Promise<(Application & { alumni?: User })[]>;
  getApplication(alumniId: string, jobOfferId: string): Promise<Application | undefined>;
  getApplicationById(id: string): Promise<Application | undefined>;
  createApplication(alumniId: string, data: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  deleteApplicationsByAlumni(alumniId: string): Promise<void>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAllJobs(): Promise<(JobOffer & { company?: { companyName: string | null; name: string } })[]>;
  getAllApplications(): Promise<(Application & { alumni?: { name: string; email: string }; jobOffer?: { title: string } })[]>;
  getStats(): Promise<{ totalUsers: number; totalAlumni: number; totalCompanies: number; totalJobs: number; activeJobs: number; totalApplications: number }>;
  toggleJobActive(id: string, active: boolean): Promise<JobOffer | undefined>;
  adminDeleteJob(id: string): Promise<void>;

  // SMTP settings
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  upsertSmtpSettings(data: Omit<SmtpSettings, "id" | "updatedAt">): Promise<SmtpSettings>;

  // Email verification
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;

  // CV builder
  updateUserCv(id: string, cvData: CvData): Promise<User>;
  hasApplicationFromAlumni(alumniId: string, companyId: string): Promise<boolean>;

  // Job expiry
  extendJobExpiry(id: string, expiresAt: Date): Promise<JobOffer>;
  getExpiringJobs(daysBeforeExpiry: number): Promise<(JobOffer & { company?: User })[]>;
  getExpiredJobs(): Promise<JobOffer[]>;

  // CV reminder
  getAlumniNeedingCvReminder(): Promise<User[]>;
  markCvReminderSent(userId: string): Promise<void>;
  markExpiryReminderSent(jobId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser & { consentTimestamp?: Date }): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.alumniId, id));
    const userJobs = await db.select({ id: jobOffers.id }).from(jobOffers).where(eq(jobOffers.companyId, id));
    for (const job of userJobs) {
      await db.delete(applications).where(eq(applications.jobOfferId, job.id));
    }
    await db.delete(jobOffers).where(eq(jobOffers.companyId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getActiveJobs(): Promise<(JobOffer & { company?: { companyName: string | null; name: string } })[]> {
    const jobs = await db.select().from(jobOffers).where(eq(jobOffers.active, true)).orderBy(desc(jobOffers.createdAt));
    const result = [];
    for (const job of jobs) {
      const [company] = await db.select({ companyName: users.companyName, name: users.name }).from(users).where(eq(users.id, job.companyId));
      result.push({ ...job, company: company || undefined });
    }
    return result;
  }

  async getJobsByCompany(companyId: string): Promise<JobOffer[]> {
    return db.select().from(jobOffers).where(eq(jobOffers.companyId, companyId)).orderBy(desc(jobOffers.createdAt));
  }

  async getJob(id: string): Promise<JobOffer | undefined> {
    const [job] = await db.select().from(jobOffers).where(eq(jobOffers.id, id));
    return job;
  }

  async createJob(companyId: string, data: InsertJobOffer): Promise<JobOffer> {
    const [job] = await db.insert(jobOffers).values({ ...data, companyId }).returning();
    return job;
  }

  async updateJob(id: string, data: Partial<InsertJobOffer>): Promise<JobOffer | undefined> {
    const [job] = await db.update(jobOffers).set(data).where(eq(jobOffers.id, id)).returning();
    return job;
  }

  async deleteJobsByCompany(companyId: string): Promise<void> {
    await db.delete(jobOffers).where(eq(jobOffers.companyId, companyId));
  }

  async getApplicationsByAlumni(alumniId: string): Promise<(Application & { jobOffer?: JobOffer & { company?: { companyName: string | null; name: string } } })[]> {
    const apps = await db.select().from(applications).where(eq(applications.alumniId, alumniId)).orderBy(desc(applications.appliedAt));
    const result = [];
    for (const app of apps) {
      const [job] = await db.select().from(jobOffers).where(eq(jobOffers.id, app.jobOfferId));
      let company;
      if (job) {
        const [c] = await db.select({ companyName: users.companyName, name: users.name }).from(users).where(eq(users.id, job.companyId));
        company = c || undefined;
      }
      result.push({ ...app, jobOffer: job ? { ...job, company } : undefined });
    }
    return result;
  }

  async getApplicationsByJob(jobOfferId: string): Promise<(Application & { alumni?: User })[]> {
    const apps = await db.select().from(applications).where(eq(applications.jobOfferId, jobOfferId)).orderBy(desc(applications.appliedAt));
    const result = [];
    for (const app of apps) {
      const [alumni] = await db.select().from(users).where(eq(users.id, app.alumniId));
      const safeAlumni = alumni ? {
        id: alumni.id,
        name: alumni.name,
        email: alumni.email,
        phone: alumni.phone,
        bio: alumni.bio,
        cvUrl: alumni.cvUrl,
        university: alumni.university,
        graduationYear: alumni.graduationYear,
        familiaProfesional: alumni.familiaProfesional,
        cicloFormativo: alumni.cicloFormativo,
        skills: alumni.skills,
        role: alumni.role,
        profilePublic: alumni.profilePublic,
        profilePhotoUrl: alumni.profilePhotoUrl,
        cvData: alumni.cvData,
        cvLastUpdatedAt: alumni.cvLastUpdatedAt,
        password: "",
        companyName: null,
        companyDescription: null,
        companyWebsite: null,
        companySector: null,
        companyLogoUrl: alumni.companyLogoUrl,
        companyEmail: null,
        companyCif: null,
        consentGiven: false,
        consentTimestamp: null,
        createdAt: alumni.createdAt,
      } as User : undefined;
      result.push({ ...app, alumni: safeAlumni });
    }
    return result;
  }

  async getApplication(alumniId: string, jobOfferId: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(
      and(eq(applications.alumniId, alumniId), eq(applications.jobOfferId, jobOfferId))
    );
    return app;
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(alumniId: string, data: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values({ ...data, alumniId }).returning();
    return app;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [app] = await db.update(applications).set({ status: status as any }).where(eq(applications.id, id)).returning();
    return app;
  }

  async deleteApplicationsByAlumni(alumniId: string): Promise<void> {
    await db.delete(applications).where(eq(applications.alumniId, alumniId));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllJobs(): Promise<(JobOffer & { company?: { companyName: string | null; name: string } })[]> {
    const jobs = await db.select().from(jobOffers).orderBy(desc(jobOffers.createdAt));
    const result = [];
    for (const job of jobs) {
      const [company] = await db.select({ companyName: users.companyName, name: users.name }).from(users).where(eq(users.id, job.companyId));
      result.push({ ...job, company: company || undefined });
    }
    return result;
  }

  async getAllApplications(): Promise<(Application & { alumni?: { name: string; email: string }; jobOffer?: { title: string } })[]> {
    const apps = await db.select().from(applications).orderBy(desc(applications.appliedAt));
    const result = [];
    for (const app of apps) {
      const [alumni] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, app.alumniId));
      const [jobOffer] = await db.select({ title: jobOffers.title }).from(jobOffers).where(eq(jobOffers.id, app.jobOfferId));
      result.push({ ...app, alumni: alumni || undefined, jobOffer: jobOffer || undefined });
    }
    return result;
  }

  async getStats(): Promise<{ totalUsers: number; totalAlumni: number; totalCompanies: number; totalJobs: number; activeJobs: number; totalApplications: number }> {
    const [{ value: totalUsers }] = await db.select({ value: count() }).from(users);
    const [{ value: totalAlumni }] = await db.select({ value: count() }).from(users).where(eq(users.role, "ALUMNI"));
    const [{ value: totalCompanies }] = await db.select({ value: count() }).from(users).where(eq(users.role, "COMPANY"));
    const [{ value: totalJobs }] = await db.select({ value: count() }).from(jobOffers);
    const [{ value: activeJobs }] = await db.select({ value: count() }).from(jobOffers).where(eq(jobOffers.active, true));
    const [{ value: totalApplications }] = await db.select({ value: count() }).from(applications);
    return { totalUsers, totalAlumni, totalCompanies, totalJobs, activeJobs, totalApplications };
  }

  async toggleJobActive(id: string, active: boolean): Promise<JobOffer | undefined> {
    const [job] = await db.update(jobOffers).set({ active }).where(eq(jobOffers.id, id)).returning();
    return job;
  }

  async adminDeleteJob(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.jobOfferId, id));
    await db.delete(jobOffers).where(eq(jobOffers.id, id));
  }

  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    const [settings] = await db.select().from(smtpSettings).limit(1);
    return settings;
  }

  async upsertSmtpSettings(data: Omit<SmtpSettings, "id" | "updatedAt">): Promise<SmtpSettings> {
    const existing = await this.getSmtpSettings();
    if (existing) {
      const [updated] = await db.update(smtpSettings).set({ ...data, updatedAt: new Date() }).where(eq(smtpSettings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(smtpSettings).values({ ...data, updatedAt: new Date() }).returning();
    return created;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async updateUserCv(id: string, cvData: CvData): Promise<User> {
    const [user] = await db.update(users).set({
      cvData: cvData as any,
      cvLastUpdatedAt: new Date(),
      cvReminderSentAt: null,
    }).where(eq(users.id, id)).returning();
    return user;
  }

  async hasApplicationFromAlumni(alumniId: string, companyId: string): Promise<boolean> {
    const result = await db.select({ id: applications.id })
      .from(applications)
      .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
      .where(and(eq(applications.alumniId, alumniId), eq(jobOffers.companyId, companyId)))
      .limit(1);
    return result.length > 0;
  }

  async extendJobExpiry(id: string, expiresAt: Date): Promise<JobOffer> {
    const [job] = await db.update(jobOffers).set({
      expiresAt,
      expiryReminderSentAt: null,
    }).where(eq(jobOffers.id, id)).returning();
    return job;
  }

  async getExpiringJobs(daysBeforeExpiry: number): Promise<(JobOffer & { company?: User })[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
    const jobs = await db.select().from(jobOffers)
      .where(and(
        eq(jobOffers.active, true),
        isNotNull(jobOffers.expiresAt),
        lte(jobOffers.expiresAt, targetDate),
        isNull(jobOffers.expiryReminderSentAt)
      ));
    const result: (JobOffer & { company?: User })[] = [];
    for (const job of jobs) {
      const [company] = await db.select().from(users).where(eq(users.id, job.companyId));
      result.push({ ...job, company: company || undefined });
    }
    return result;
  }

  async getExpiredJobs(): Promise<JobOffer[]> {
    const now = new Date();
    return db.select().from(jobOffers)
      .where(and(
        eq(jobOffers.active, true),
        isNotNull(jobOffers.expiresAt),
        lte(jobOffers.expiresAt, now)
      ));
  }

  async getAlumniNeedingCvReminder(): Promise<User[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return db.select().from(users).where(and(
      eq(users.role, "ALUMNI"),
      isNotNull(users.cvLastUpdatedAt),
      lte(users.cvLastUpdatedAt, oneYearAgo),
      isNull(users.cvReminderSentAt)
    ));
  }

  async markCvReminderSent(userId: string): Promise<void> {
    await db.update(users).set({ cvReminderSentAt: new Date() }).where(eq(users.id, userId));
  }

  async markExpiryReminderSent(jobId: string): Promise<void> {
    await db.update(jobOffers).set({ expiryReminderSentAt: new Date() }).where(eq(jobOffers.id, jobId));
  }
}

export const storage = new DatabaseStorage();
