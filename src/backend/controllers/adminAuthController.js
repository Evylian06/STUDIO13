import { timingSafeEqual } from "node:crypto";
import { createAdminToken, getSigningSecret } from "../auth/adminToken.js";
import { isObjectBody, reportControllerError } from "./_shared.js";

const adminAccounts = () => [
  {
    email: process.env.ADMIN_EMAIL?.trim(),
    password: process.env.ADMIN_PASSWORD,
    role: "ADMIN",
  },
  {
    email: process.env.ADMIN_EMAIL_OWNER?.trim(),
    password: process.env.ADMIN_PASSWORD_OWNER,
    role: "OWNER",
  },
];

const getConfiguredAccounts = () => {
  const accounts = adminAccounts();
  const isConfigured = accounts.every(
    (account) => typeof account.email === "string" && account.email &&
      typeof account.password === "string" && account.password,
  );
  if (!isConfigured) return null;

  const uniqueEmails = new Set(accounts.map((account) => account.email.toLowerCase()));
  if (uniqueEmails.size !== accounts.length) return null;
  return accounts;
};

const safeEqual = (provided, expected) => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
};

const login = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "email y password son obligatorios." });
  }

  const accounts = getConfiguredAccounts();
  const signingSecret = getSigningSecret();
  if (!accounts) {
    return res.status(500).json({ error: "La autenticación administrativa no está configurada correctamente." });
  }
  if (!signingSecret) {
    return res.status(500).json({
      error: "La autenticación administrativa no está configurada correctamente.",
    });
  }

  const normalizedEmail = email.toLowerCase();
  const matchedAccount = accounts.find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      safeEqual(password, account.password),
  );

  if (!matchedAccount) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  try {
    const admin = {
      email: matchedAccount.email,
      role: matchedAccount.role,
    };
    const token = createAdminToken(admin, signingSecret);
    return res.json({
      token,
      admin: {
        name: matchedAccount.email,
        email: matchedAccount.email,
        role: matchedAccount.role,
      },
    });
  } catch (error) {
    return reportControllerError(res, "iniciar sesión", error);
  }
};

export default { login };
