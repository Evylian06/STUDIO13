import dotenv from "dotenv";

dotenv.config();

const required = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }

  return value;
};

const parseOptionalPort = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    return undefined;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`La variable de entorno ${name} debe ser un puerto válido.`);
  }

  return port;
};

const env = {
  PORT: parseOptionalPort("PORT") ?? 3000,
  DATABASE_URL: required("DATABASE_URL"),
  DIRECT_URL: process.env.DIRECT_URL?.trim() || undefined,
  JWT_SECRET: process.env.JWT_SECRET?.trim() || undefined,
  SMTP_HOST: process.env.SMTP_HOST?.trim() || undefined,
  SMTP_PORT: parseOptionalPort("SMTP_PORT"),
  SMTP_USER: process.env.SMTP_USER?.trim() || undefined,
  SMTP_PASS: process.env.SMTP_PASS || undefined,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim() || undefined,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim() || undefined,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
};

export default env;