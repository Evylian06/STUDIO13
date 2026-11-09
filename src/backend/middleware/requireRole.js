const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ error: "Se requiere una sesión administrativa válida." });
  }
  if (!allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ error: "Tu rol no tiene permiso para esta operación." });
  }
  return next();
};

export default requireRole;
