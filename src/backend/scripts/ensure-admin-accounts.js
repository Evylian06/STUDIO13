import bcrypt from "bcrypt";
import prisma from "../config/databases.js";

class ConfigurationError extends Error {}

const accountDefinitions = [
  { label: "Dueña", role: "OWNER", keys: ["ADMIN_NAME_OWNER", "ADMIN_EMAIL_OWNER", "ADMIN_PASSWORD_OWNER"] },
  { label: "Desarrollador", role: "DEVELOPER", keys: ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"] },
];

const main = async () => {
  try {
    const accounts = accountDefinitions.map(({ label, role, keys }) => {
      const missing = keys.filter((key) => !process.env[key]?.trim());
      if (missing.length) throw new ConfigurationError(`Faltan variables en src/backend/.env: ${missing.join(", ")}.`);
      const [nameKey, emailKey, passwordKey] = keys;
      const account = {
        label,
        role,
        name: process.env[nameKey].trim(),
        email: process.env[emailKey].trim().toLowerCase(),
        password: process.env[passwordKey],
        emailKey,
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
        throw new ConfigurationError(`El valor de ${emailKey} no tiene un formato válido.`);
      }
      const passwordBytes = Buffer.byteLength(account.password, "utf8");
      if (passwordBytes < 12 || passwordBytes > 72) {
        throw new ConfigurationError(`La contraseña configurada para ${label} debe tener entre 12 y 72 bytes para bcrypt.`);
      }
      return account;
    });

    if (accounts[0].email === accounts[1].email) {
      throw new ConfigurationError("Las variables de dueña y desarrollador deben usar correos distintos.");
    }

    for (const account of accounts) {
      const existing = await prisma.adminUser.findUnique({ where: { email: account.email } });
      if (existing) {
        const passwordMatches = await bcrypt.compare(account.password, existing.passwordHash);
        console.log(`${account.label}: ya existe; rol ${existing.role}; contraseña de .env ${passwordMatches ? "coincide" : "no coincide"}. Sin cambios.`);
        if (existing.role !== account.role || !passwordMatches) process.exitCode = 2;
        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 12);
      await prisma.adminUser.create({
        data: { name: account.name, email: account.email, passwordHash, role: account.role },
      });
      console.log(`${account.label}: cuenta creada con rol ${account.role}.`);
    }

    const totalAccounts = await prisma.adminUser.count();
    console.log(`Comprobación completada. Cuentas administrativas totales en la base: ${totalAccounts}.`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  if (error instanceof ConfigurationError) {
    console.error(error.message);
  } else {
    const details = [error?.name, error?.code ? `código ${error.code}` : null].filter(Boolean).join("; ");
    console.error("No se pudieron comprobar o crear las cuentas administrativas.", details || "Revisa la conectividad y el esquema de la base configurada.");
  }
  process.exitCode = 1;
});
