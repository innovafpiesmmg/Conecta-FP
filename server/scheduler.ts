import { storage } from "./storage";
import { sendCvUpdateReminderEmail, sendJobExpiryReminderEmail } from "./email";
import { getBaseUrl } from "./utils";

const BASE_URL = getBaseUrl();

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

async function checkCvUpdateReminders() {
  try {
    const alumni = await storage.getAlumniNeedingCvReminder();
    for (const user of alumni) {
      const sent = await sendCvUpdateReminderEmail(user.email, user.name, BASE_URL);
      if (sent) {
        await storage.markCvReminderSent(user.id);
        console.log(`[SCHEDULER] CV update reminder sent to ${user.email}`);
      }
    }
    if (alumni.length > 0) {
      console.log(`[SCHEDULER] Processed ${alumni.length} CV update reminders`);
    }
  } catch (err) {
    console.error("[SCHEDULER] Error checking CV update reminders:", err);
  }
}

async function checkJobExpiryReminders() {
  try {
    const expiringJobs = await storage.getExpiringJobs(7);
    for (const job of expiringJobs) {
      if (job.company && job.expiresAt) {
        const companyName = job.company.companyName || job.company.name;
        const sent = await sendJobExpiryReminderEmail(
          job.company.email,
          companyName,
          job.title,
          job.expiresAt,
          BASE_URL
        );
        if (sent) {
          await storage.markExpiryReminderSent(job.id);
          console.log(`[SCHEDULER] Job expiry reminder sent for "${job.title}" to ${job.company.email}`);
        }
      }
    }
    if (expiringJobs.length > 0) {
      console.log(`[SCHEDULER] Processed ${expiringJobs.length} job expiry reminders`);
    }
  } catch (err) {
    console.error("[SCHEDULER] Error checking job expiry reminders:", err);
  }
}

async function deactivateExpiredJobs() {
  try {
    const expiredJobs = await storage.getExpiredJobs();
    for (const job of expiredJobs) {
      await storage.toggleJobActive(job.id, false);
      console.log(`[SCHEDULER] Deactivated expired job: "${job.title}" (${job.id})`);
    }
    if (expiredJobs.length > 0) {
      console.log(`[SCHEDULER] Deactivated ${expiredJobs.length} expired jobs`);
    }
  } catch (err) {
    console.error("[SCHEDULER] Error deactivating expired jobs:", err);
  }
}

async function runDailyChecks() {
  console.log("[SCHEDULER] Running daily checks...");
  await checkCvUpdateReminders();
  await checkJobExpiryReminders();
  await deactivateExpiredJobs();
  console.log("[SCHEDULER] Daily checks completed");
}

export function startScheduler() {
  setTimeout(() => {
    runDailyChecks();
  }, 10000);

  setInterval(runDailyChecks, TWENTY_FOUR_HOURS);
  console.log("[SCHEDULER] Scheduler started - daily checks enabled");
}
