const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_TRACKED_ADDRESSES = 10_000;
const attemptsByAddress = new Map();

const getAddress = (req) => req.ip || req.socket.remoteAddress || "desconocida";

export const clearLoginAttempts = (req) => {
  attemptsByAddress.delete(getAddress(req));
};

const limitLoginAttempts = (req, res, next) => {
  const now = Date.now();
  const address = getAddress(req);
  let attempts = attemptsByAddress.get(address);

  if (!attempts || attempts.resetAt <= now) {
    if (attemptsByAddress.size >= MAX_TRACKED_ADDRESSES) {
      const oldestAddress = attemptsByAddress.keys().next().value;
      if (oldestAddress !== undefined) attemptsByAddress.delete(oldestAddress);
    }
    attempts = { count: 0, resetAt: now + WINDOW_MS };
    attemptsByAddress.set(address, attempts);
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((attempts.resetAt - now) / 1000));
    return res.status(429).json({ error: "Demasiados intentos de inicio de sesión. Inténtalo más tarde." });
  }

  attempts.count += 1;
  return next();
};

export default limitLoginAttempts;
