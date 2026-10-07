import { createHmac, timingSafeEqual } from "node:crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const TOKEN_VERSION = "v1";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;
const MINIMUM_SECRET_LENGTH = 32;
let signingSecretWarningShown = false;

const encode = (value) => Buffer.from(value).toString("base64url");

const signatureFor = (payload, secret) =>
  createHmac("sha256", secret).update(`${TOKEN_VERSION}.${payload}`).digest("base64url");

export const hasValidSigningSecret = (secret) =>
  typeof secret === "string" && Buffer.byteLength(secret, "utf8") >= MINIMUM_SECRET_LENGTH;

export const getSigningSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (hasValidSigningSecret(secret)) return secret;

  if (!signingSecretWarningShown) {
    console.error(
      "Autenticación administrativa deshabilitada: configura JWT_SECRET en src/backend/.env con al menos 32 bytes. No uses contraseñas de administrador como secreto.",
    );
    signingSecretWarningShown = true;
  }

  return undefined;
};

export const createAdminToken = (admin, secret) => {
  if (!hasValidSigningSecret(secret)) {
    throw new Error("Configura JWT_SECRET en src/backend/.env con al menos 32 bytes.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = encode(
    JSON.stringify({
      sub: admin.email,
      email: admin.email,
      role: admin.role,
      iat: now,
      exp: now + TOKEN_LIFETIME_SECONDS,
    }),
  );

  return `${TOKEN_VERSION}.${payload}.${signatureFor(payload, secret)}`;
};

export const verifyAdminToken = (token, secret) => {
  if (!hasValidSigningSecret(secret) || typeof token !== "string") return null;

  const [version, payload, signature, ...extraParts] = token.split(".");
  if (version !== TOKEN_VERSION || !payload || !signature || extraParts.length) return null;

  const expected = Buffer.from(signatureFor(payload, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof claims.sub !== "string" ||
      !claims.sub ||
      typeof claims.email !== "string" ||
      !["ADMIN", "OWNER"].includes(claims.role) ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { id: claims.sub, email: claims.email, role: claims.role };
  } catch {
    return null;
  }
};
