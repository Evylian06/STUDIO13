import bcrypt from "bcrypt";
import prisma from "../config/databases.js";
import { createAdminToken, getSigningSecret } from "../auth/adminToken.js";
import { isObjectBody } from "./_shared.js";

const isDatabaseConnectionError = (error) =>
  error?.name === "PrismaClientInitializationError" ||
  ["P1000", "P1001", "P1002", "P1008", "P1017"].includes(error?.code);

const login = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "email y password son obligatorios." });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });
    if (!adminUser || !(await bcrypt.compare(password, adminUser.passwordHash))) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const signingSecret = getSigningSecret();
    if (!signingSecret) {
      return res.status(500).json({
        error: "La autenticación administrativa no está configurada correctamente.",
      });
    }

    const admin = { id: adminUser.id, name: adminUser.name, email: adminUser.email };
    return res.status(200).json({ token: createAdminToken(admin, signingSecret), admin });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error(`[iniciar sesión] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
      return res.status(503).json({
        error: "No se pudo conectar con el servicio de autenticación. Inténtalo más tarde.",
      });
    }

    // Evitar registrar errores completos de Prisma, que podrían incluir datos de conexión.
    console.error(`[iniciar sesión] Error interno${error?.code ? ` (${error.code})` : ""}.`);
    return res.status(500).json({ error: "No se pudo iniciar sesión por un error interno." });
  }
};

export default { login };
