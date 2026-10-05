import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["nombre", "descripcion", "precio", "imagenUrl", "publicId", "orden", "activo"];

const list = async (_req, res) => {
  try {
    return res.json(await prisma.servicio.findMany({ orderBy: [{ orden: "asc" }, { id: "asc" }] }));
  } catch (error) {
    return reportControllerError(res, "obtener los servicios", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const servicio = await prisma.servicio.findUnique({ where: { id } });
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado." });
    return res.json(servicio);
  } catch (error) {
    return reportControllerError(res, "obtener el servicio", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (typeof data.nombre !== "string" || !data.nombre.trim()) {
    return res.status(400).json({ error: "nombre es obligatorio." });
  }
  try {
    return res.status(201).json(await prisma.servicio.create({ data }));
  } catch (error) {
    return reportControllerError(res, "crear el servicio", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  try {
    const result = await prisma.servicio.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Servicio no encontrado." });
    return res.json(await prisma.servicio.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar el servicio", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.servicio.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Servicio no encontrado." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el servicio", error);
  }
};

export default { list, getById, create, update, remove };
