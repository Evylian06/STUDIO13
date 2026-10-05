export const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const isObjectBody = (body) =>
  body !== null && typeof body === "object" && !Array.isArray(body);

export const pickDefined = (body, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(body, field) && body[field] !== undefined)
      .map((field) => [field, body[field]]),
  );

export const reportControllerError = (res, operation, error) => {
  console.error(`[${operation}]`, error);
  return res.status(500).json({ error: `No se pudo ${operation}.` });
};
