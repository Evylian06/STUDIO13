import { createHmac, timingSafeEqual } from "node:crypto";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;
const MINIMUM_SECRET_LENGTH = 32;
let signingSecretWarningShown = false;

const encode = (value) => Buffer.from(value).toString("base64url");

const signatureFor = (input, secret) =>
  createHmac("sha256", secret).update(input).digest("base64url");

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
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(
    JSON.stringify({
      sub: String(admin.id),
      email: admin.email,
      iat: now,
      exp: now + TOKEN_LIFETIME_SECONDS,
    }),
  );

  const input = `${header}.${payload}`;
  return `${input}.${signatureFor(input, secret)}`;
};

export const verifyAdminToken = (token, secret) => {
  if (!hasValidSigningSecret(secret) || typeof token !== "string") return null;

  const [header, payload, signature, ...extraParts] = token.split(".");
  if (!header || !payload || !signature || extraParts.length) return null;

  let parsedHeader;
  try {
    parsedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (parsedHeader?.alg !== "HS256" || parsedHeader?.typ !== "JWT") return null;

  const input = `${header}.${payload}`;
  const expected = Buffer.from(signatureFor(input, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof claims.sub !== "string" ||
      !claims.sub ||
      typeof claims.email !== "string" ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const id = Number(claims.sub);
    if (!Number.isInteger(id) || id <= 0) return null;

    return { id, email: claims.email };
  } catch {
    return null;
  }
};
