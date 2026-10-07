import bcrypt from "bcrypt";
import prisma from "../config/databases.js";
import {
  createAdminToken,
  getSigningSecret,
} from "../auth/adminToken.js";
import {
  isObjectBody,
  reportControllerError,
} from "./_shared.js";

const MAX_ADMINS = 2;

// Administradores de arranque definidos en el .env (hasta 2).
// Primer admin:  ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD / ADMIN_BOOTSTRAP_NAME
// Segundo admin: ADMIN_BOOTSTRAP_EMAIL_2 / ADMIN_BOOTSTRAP_PASSWORD_2 / ADMIN_BOOTSTRAP_NAME_2
const getBootstrapAdmins = () => {
  const definitions = [
    {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME,
    },
    {
      email: process.env.ADMIN_EMAIL_OWNER,
      password: process.env.ADMIN_PASSWORD_OWNER,
      name: process.env.ADMIN_NAME_OWNER,
    },
  ];

  return definitions
    .map((item) => ({
      email: (item.email || "").trim().toLowerCase(),
      password: item.password || "",
      name: item.name || "Administrador",
    }))
    .filter((item) => item.email && item.password);
};

// Si alguien inicia sesión con las credenciales de un admin de arranque que
// todavía no existe en la base de datos, lo crea (con la contraseña hasheada).
// Cuando ya hayas entrado con ambos, borra esas variables del .env.
const tryBootstrapAdmin = async (email, password) => {
  const match = getBootstrapAdmins().find(
    (item) => item.email === email && item.password === password
  );

  if (!match) {
    return null;
  }

  // Tope duro: nunca puede haber más de 2 administradores
  const existingAdmins = await prisma.adminUser.count();

  if (existingAdmins >= MAX_ADMINS) {
    return null;
  }

  const passwordHash = await bcrypt.hash(match.password, 10);

  return prisma.adminUser.create({
    data: {
      name: match.name,
      email: match.email,
      passwordHash,
    },
  });
};

const login = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({
      error: "El cuerpo debe ser un objeto JSON.",
    });
  }

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const password =
    typeof req.body.password === "string"
      ? req.body.password
      : "";

  if (!email || !password) {
    return res.status(400).json({
      error: "email y password son obligatorios.",
    });
  }

  try {
    // Obtener el usuario administrador desde la base de datos
    let adminUser = await prisma.adminUser.findUnique({
      where: {
        email,
      },
    });

    // Si no existe, intentar crearlo como admin de arranque
    if (!adminUser) {
      adminUser = await tryBootstrapAdmin(email, password);
    }

    // Verificar que el administrador exista
    if (!adminUser) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos.",
      });
    }

    // Comparar la contraseña ingresada con el passwordHash almacenado
    const passwordMatches = await bcrypt.compare(
      password,
      adminUser.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos.",
      });
    }

    // Obtener la clave utilizada para firmar la sesión
    const signingSecret = getSigningSecret();

    if (!signingSecret) {
      return res.status(500).json({
        error: "La autenticación administrativa no está configurada correctamente.",
      });
    }

    // Crear el token de sesión
    const token = createAdminToken(
      {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
      signingSecret
    );

    return res.status(200).json({
      token,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });
  } catch (error) {
    return reportControllerError(
      res,
      "iniciar sesión",
      error
    );
  }
};

export default {
  login,
};