import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const states = new Set(["ACTIVA", "VENCIDA", "CANCELADA"]);
const fields = ["fechaInicio", "fechaFin", "estado", "clienteId", "planId"];
const includeRelations = {
  cliente: { select: { id: true, nombre: true, email: true } },
  plan: true,
};

const parseRelationIds = (data) => {
  for (const field of ["clienteId", "planId"]) {
    if (Object.hasOwn(data, field)) {
      const id = parseId(data[field]);
      if (!id) return false;
      data[field] = id;
    }
  }
  return true;
};

const list = async (_req, res) => {
  try {
    return res.json(
      await prisma.membresia.findMany({
        include: includeRelations,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener las membresías", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const membresia = await prisma.membresia.findUnique({ where: { id }, include: includeRelations });
    if (!membresia) return res.status(404).json({ error: "Membresía no encontrada." });
    return res.json(membresia);
  } catch (error) {
    return reportControllerError(res, "obtener la membresía", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!data.fechaFin || !Object.hasOwn(data, "clienteId") || !Object.hasOwn(data, "planId")) {
    return res.status(400).json({ error: "fechaFin, clienteId y planId son obligatorios." });
  }
  if (!parseRelationIds(data)) return res.status(400).json({ error: "clienteId y planId deben ser enteros positivos." });
  if (data.estado !== undefined && !states.has(data.estado)) {
    return res.status(400).json({ error: "estado no es válido." });
  }

  try {
    return res.status(201).json(await prisma.membresia.create({ data, include: includeRelations }));
  } catch (error) {
    return reportControllerError(res, "crear la membresía", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (!parseRelationIds(data)) return res.status(400).json({ error: "clienteId y planId deben ser enteros positivos." });
  if (data.estado !== undefined && !states.has(data.estado)) {
    return res.status(400).json({ error: "estado no es válido." });
  }
  try {
    const result = await prisma.membresia.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Membresía no encontrada." });
    return res.json(await prisma.membresia.findUnique({ where: { id }, include: includeRelations }));
  } catch (error) {
    return reportControllerError(res, "actualizar la membresía", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.membresia.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Membresía no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la membresía", error);
  }
};

export default { list, getById, create, update, remove };
