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
    "FP Empleo - Prueba de configuracion SMTP",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Prueba de correo electrónico</h2>
      <p>Este es un correo de prueba enviado desde <strong>FP Empleo</strong>.</p>
      <p>Si recibes este mensaje, la configuración SMTP está funcionando correctamente.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">FP Empleo - Portal de Empleo para Titulados de FP</p>
    </div>`
  );
}

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  return sendEmail(
    to,
    "FP Empleo - Verifica tu correo electrónico",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verifica tu correo electrónico</h2>
      <p>Gracias por registrarte en <strong>FP Empleo</strong>.</p>
      <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
      <p style="margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verificar correo electrónico
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Si no puedes hacer clic en el boton, copia y pega esta URL en tu navegador:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Si no has creado una cuenta en FP Empleo, puedes ignorar este correo.</p>
    </div>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return sendEmail(
    to,
    "FP Empleo - Restablecer contraseña",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Restablecer contraseña</h2>
      <p>Has solicitado restablecer tu contraseña en <strong>FP Empleo</strong>.</p>
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
