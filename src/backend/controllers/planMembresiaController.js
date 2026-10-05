import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["nombre", "descripcion", "precio", "duracionDias", "activo", "orden"];

const list = async (_req, res) => {
  try {
    return res.json(await prisma.planMembresia.findMany({ orderBy: [{ orden: "asc" }, { id: "asc" }] }));
  } catch (error) {
    return reportControllerError(res, "obtener los planes de membresía", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const plan = await prisma.planMembresia.findUnique({ where: { id } });
    if (!plan) return res.status(404).json({ error: "Plan de membresía no encontrado." });
    return res.json(plan);
  } catch (error) {
    return reportControllerError(res, "obtener el plan de membresía", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (
    typeof data.nombre !== "string" ||
    !data.nombre.trim() ||
    data.precio === undefined ||
    !Number.isInteger(data.duracionDias) ||
    data.duracionDias <= 0
  ) {
    return res.status(400).json({ error: "nombre, precio y duracionDias positivo son obligatorios." });
  }
  try {
    return res.status(201).json(await prisma.planMembresia.create({ data }));
  } catch (error) {
    return reportControllerError(res, "crear el plan de membresía", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (Object.hasOwn(data, "duracionDias") && (!Number.isInteger(data.duracionDias) || data.duracionDias <= 0)) {
    return res.status(400).json({ error: "duracionDias debe ser un entero positivo." });
  }
  try {
    const result = await prisma.planMembresia.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Plan de membresía no encontrado." });
    return res.json(await prisma.planMembresia.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar el plan de membresía", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.planMembresia.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Plan de membresía no encontrado." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el plan de membresía", error);
  }
};

export default { list, getById, create, update, remove };
