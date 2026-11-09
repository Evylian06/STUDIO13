import bcrypt from "bcrypt";
import prisma from "../config/databases.js";

class ConfigurationError extends Error {}

const main = async () => {
  try {
    const ownerKeys = ["ADMIN_NAME_OWNER", "ADMIN_EMAIL_OWNER", "ADMIN_PASSWORD_OWNER"];
    const defaultKeys = ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
    const keys = ownerKeys.some((key) => process.env[key]?.trim()) ? ownerKeys : defaultKeys;
    const missing = keys.filter((key) => !process.env[key]?.trim());
    if (missing.length) {
      throw new ConfigurationError(`Faltan variables en src/backend/.env: ${missing.join(", ")}.`);
    }

    const [nameKey, emailKey, passwordKey] = keys;
    const name = process.env[nameKey].trim();
    const email = process.env[emailKey].trim().toLowerCase();
    const password = process.env[passwordKey];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConfigurationError(`El correo definido en ${emailKey} no tiene un formato válido.`);
    }
    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (passwordBytes < 12 || passwordBytes > 72) {
      throw new ConfigurationError("La contraseña configurada debe tener entre 12 y 72 bytes para bcrypt.");
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      const passwordMatches = await bcrypt.compare(password, existing.passwordHash);
      console.log(`La cuenta administrativa configurada ya existe. Rol: ${existing.role}. Contraseña de .env: ${passwordMatches ? "coincide" : "no coincide"}. No se modificó ningún dato.`);
      if (!passwordMatches) process.exitCode = 2;
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({
      data: { name, email, passwordHash, role: "OWNER" },
    });
    console.log("Cuenta administrativa creada con rol OWNER. No se imprimieron credenciales ni hash.");
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  if (error instanceof ConfigurationError) {
    console.error(error.message);
  } else {
    const details = [error?.name, error?.code ? `código ${error.code}` : null].filter(Boolean).join("; ");
    console.error("No se pudo comprobar o crear la cuenta administrativa.", details || "Revisa la conectividad y el esquema de la base configurada.");
  }
  process.exitCode = 1;
});
