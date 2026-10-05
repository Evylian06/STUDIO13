import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = [
  "nombre",
  "url",
  "publicId",
  "seccion",
  "descripcion",
  "orden",
  "activo",
];
const requiredFields = ["nombre", "url", "seccion"];

const validPayload = (payload, requireAll = false) =>
  Object.keys(payload).length > 0 &&
  (!requireAll || requiredFields.every((field) => typeof payload[field] === "string" && payload[field].trim()));

const list = async (_req, res) => {
  try {
    const imagenes = await prisma.imagen.findMany({ orderBy: [{ orden: "asc" }, { id: "asc" }] });
    return res.json(imagenes);
  } catch (error) {
    return reportControllerError(res, "obtener las imágenes", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const imagen = await prisma.imagen.findUnique({ where: { id } });
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada." });
    return res.json(imagen);
  } catch (error) {
    return reportControllerError(res, "obtener la imagen", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!validPayload(data, true)) {
    return res.status(400).json({ error: "nombre, url y seccion son obligatorios." });
  }

  try {
    const imagen = await prisma.imagen.create({ data });
    return res.status(201).json(imagen);
  } catch (error) {
    return reportControllerError(res, "crear la imagen", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });

  try {
    const result = await prisma.imagen.updateMany({ where: { id }, data });
    if (result.count === 0) return res.status(404).json({ error: "Imagen no encontrada." });
    return res.json(await prisma.imagen.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar la imagen", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const result = await prisma.imagen.deleteMany({ where: { id } });
    if (result.count === 0) return res.status(404).json({ error: "Imagen no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la imagen", error);
  }
};

export default { list, getById, create, update, remove };
