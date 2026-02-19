import nodemailer from "nodemailer";
import { storage } from "./storage";

export async function getTransporter() {
  const settings = await storage.getSmtpSettings();
  if (!settings || !settings.enabled) {
    return null;
  }

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
}

async function getFromAddress(): Promise<{ name: string; address: string } | null> {
  const settings = await storage.getSmtpSettings();
  if (!settings) return null;
  return { name: settings.fromName, address: settings.fromEmail };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[EMAIL] SMTP not configured. Would send to ${to}: ${subject}`);
      return false;
    }

    const from = await getFromAddress();
    if (!from) return false;

    await transporter.sendMail({ from, to, subject, html });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error("[EMAIL] Error sending email:", err);
    return false;
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  return sendEmail(
    to,
    "Conecta FP - Prueba de configuracion SMTP",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Prueba de correo electrónico</h2>
      <p>Este es un correo de prueba enviado desde <strong>Conecta FP</strong>.</p>
      <p>Si recibes este mensaje, la configuración SMTP está funcionando correctamente.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Conecta FP - Portal de Empleo para Titulados de FP</p>
    </div>`
  );
}

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  return sendEmail(
    to,
    "Conecta FP - Verifica tu correo electrónico",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verifica tu correo electrónico</h2>
      <p>Gracias por registrarte en <strong>Conecta FP</strong>.</p>
      <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
      <p style="margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verificar correo electrónico
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Si no puedes hacer clic en el boton, copia y pega esta URL en tu navegador:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Si no has creado una cuenta en Conecta FP, puedes ignorar este correo.</p>
    </div>`
  );
}

export async function sendCvUpdateReminderEmail(to: string, name: string, baseUrl: string): Promise<boolean> {
  const dashboardUrl = `${baseUrl}/alumni`;
  return sendEmail(
    to,
    "Conecta FP - Recordatorio: Actualiza tu CV",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hola ${name}, es hora de actualizar tu CV</h2>
      <p>Ha pasado más de un año desde la última vez que actualizaste tu CV en <strong>Conecta FP</strong>.</p>
      <p>Mantener tu CV actualizado aumenta tus posibilidades de ser seleccionado por las empresas que buscan talento FP.</p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Actualizar mi CV
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Te recomendamos añadir nueva experiencia, formación o habilidades que hayas adquirido.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Conecta FP - Portal de Empleo para Titulados de FP</p>
    </div>`
  );
}

export async function sendJobExpiryReminderEmail(to: string, companyName: string, jobTitle: string, expiresAt: Date, baseUrl: string): Promise<boolean> {
  const dashboardUrl = `${baseUrl}/company`;
  const formattedDate = expiresAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return sendEmail(
    to,
    `Conecta FP - Tu oferta "${jobTitle}" expira pronto`,
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Tu oferta de empleo expira pronto</h2>
      <p>Hola ${companyName},</p>
      <p>Tu oferta de empleo <strong>"${jobTitle}"</strong> expirará el <strong>${formattedDate}</strong>.</p>
      <p>Si deseas mantenerla activa, puedes ampliar la fecha de expiración desde tu panel de empresa.</p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Gestionar mis ofertas
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Si no amplías la fecha, la oferta se desactivará automáticamente cuando expire.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Conecta FP - Portal de Empleo para Titulados de FP</p>
    </div>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return sendEmail(
    to,
    "Conecta FP - Restablecer contraseña",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Restablecer contraseña</h2>
      <p>Has solicitado restablecer tu contraseña en <strong>Conecta FP</strong>.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <p style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Restablecer contraseña
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Este enlace expira en 1 hora.</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">Si no puedes hacer clic, copia esta URL: ${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Si no has solicitado restablecer tu contraseña, puedes ignorar este correo.</p>
    </div>`
  );
}
