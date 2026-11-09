import prisma from "../config/databases.js";
import env from "../config/env.js";

const getStatus = async (_req, res) => {
  let database = "available";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = "unavailable";
    console.error(`[diagnóstico técnico] PostgreSQL no disponible${error?.code ? ` (${error.code})` : ""}.`);
  }

  return res.json({
    backend: "available",
    database,
    integrations: {
      cloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
      email: Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
    },
    checkedAt: new Date().toISOString(),
  });
};

export default { getStatus };
