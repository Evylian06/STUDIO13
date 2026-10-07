import { getSigningSecret, verifyAdminToken } from "../auth/adminToken.js";

const requireAdmin = (req, res, next) => {
  const signingSecret = getSigningSecret();
  if (!signingSecret) {
    return res.status(500).json({
      error: "La autenticación administrativa no está configurada correctamente.",
    });
  }

  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  const admin = match ? verifyAdminToken(match[1], signingSecret) : null;

  if (!admin) {
    return res.status(401).json({ error: "Se requiere una sesión administrativa válida." });
  }

  req.admin = admin;
  return next();
};

export default requireAdmin;
