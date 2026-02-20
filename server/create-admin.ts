import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrador";

  if (!email || !password) {
    console.error("Error: ADMIN_EMAIL y ADMIN_PASSWORD son requeridos");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Error: La contraseña debe tener al menos 6 caracteres");
    process.exit(1);
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    if (existing[0].role === "ADMIN") {
      console.log(`El administrador ${email} ya existe, actualizando contraseña...`);
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, existing[0].id));
      console.log("Contraseña de administrador actualizada.");
    } else {
      console.log(`El usuario ${email} ya existe con rol ${existing[0].role}, cambiando a ADMIN...`);
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.update(users).set({ password: hashedPassword, role: "ADMIN" }).where(eq(users.id, existing[0].id));
      console.log("Usuario actualizado a administrador.");
    }
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      email,
      password: hashedPassword,
      role: "ADMIN",
      name,
      consentGiven: true,
      consentTimestamp: new Date(),
      profilePublic: false,
      emailVerified: true,
    });
    console.log(`Administrador creado: ${email}`);
  }

  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error al crear administrador:", err);
  process.exit(1);
});
