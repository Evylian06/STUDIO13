import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const states = new Set(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"]);
const fields = [
  "nombre",
  "email",
  "telefono",
  "tipoSesion",
  "fecha",
  "hora",
  "mensaje",
  "estado",
  "clienteId",
];
const requiredFields = ["nombre", "email", "tipoSesion", "fecha"];
const includeCliente = { cliente: { select: { id: true, nombre: true, email: true } } };

const validPayload = (data, requireAll = false) =>
  Object.keys(data).length > 0 &&
  (!requireAll || requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== ""));

const normalizeClientId = (data) => {
  if (!Object.hasOwn(data, "clienteId") || data.clienteId === null) return true;
  const id = parseId(data.clienteId);
  if (!id) return false;
  data.clienteId = id;
  return true;
};

const list = async (_req, res) => {
  try {
    return res.json(
      await prisma.reservacion.findMany({
        include: includeCliente,
        orderBy: [{ fecha: "asc" }, { id: "asc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener las reservaciones", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const reservacion = await prisma.reservacion.findUnique({ where: { id }, include: includeCliente });
    if (!reservacion) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.json(reservacion);
  } catch (error) {
    return reportControllerError(res, "obtener la reservación", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!validPayload(data, true)) {
    return res.status(400).json({ error: "nombre, email, tipoSesion y fecha son obligatorios." });
  }
  if (!normalizeClientId(data)) return res.status(400).json({ error: "clienteId debe ser nulo o un entero positivo." });
  if (data.estado !== undefined && !states.has(data.estado)) {
    return res.status(400).json({ error: "estado no es válido." });
  }
  try {
    return res.status(201).json(await prisma.reservacion.create({ data, include: includeCliente }));
  } catch (error) {
    return reportControllerError(res, "crear la reservación", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (!normalizeClientId(data)) return res.status(400).json({ error: "clienteId debe ser nulo o un entero positivo." });
  if (data.estado !== undefined && !states.has(data.estado)) {
    return res.status(400).json({ error: "estado no es válido." });
  }
  try {
    const result = await prisma.reservacion.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.json(await prisma.reservacion.findUnique({ where: { id }, include: includeCliente }));
  } catch (error) {
    return reportControllerError(res, "actualizar la reservación", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.reservacion.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la reservación", error);
  }
};

export default { list, getById, create, update, remove };
