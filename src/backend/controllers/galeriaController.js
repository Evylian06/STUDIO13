import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const galleryFields = ["nombre", "slug", "descripcion", "orden", "activo"];
const imageFields = ["titulo", "descripcion", "url", "publicId", "orden", "activo"];
const requiredGalleryFields = ["nombre", "slug"];
const requiredImageFields = ["url"];

const validPayload = (payload, requiredFields = []) =>
  Object.keys(payload).length > 0 &&
  requiredFields.every((field) => typeof payload[field] === "string" && payload[field].trim());

const list = async (_req, res) => {
  try {
    const galerias = await prisma.galeria.findMany({
      include: { imagenes: { orderBy: [{ orden: "asc" }, { id: "asc" }] } },
      orderBy: [{ orden: "asc" }, { id: "asc" }],
    });
    return res.json(galerias);
  } catch (error) {
    return reportControllerError(res, "obtener las galerías", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const galeria = await prisma.galeria.findUnique({
      where: { id },
      include: { imagenes: { orderBy: [{ orden: "asc" }, { id: "asc" }] } },
    });
    if (!galeria) return res.status(404).json({ error: "Galería no encontrada." });
    return res.json(galeria);
  } catch (error) {
    return reportControllerError(res, "obtener la galería", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, galleryFields);
  if (!validPayload(data, requiredGalleryFields)) {
    return res.status(400).json({ error: "nombre y slug son obligatorios." });
  }

  try {
    return res.status(201).json(await prisma.galeria.create({ data }));
  } catch (error) {
    return reportControllerError(res, "crear la galería", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, galleryFields);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });

  try {
    const result = await prisma.galeria.updateMany({ where: { id }, data });
    if (result.count === 0) return res.status(404).json({ error: "Galería no encontrada." });
    return res.json(await prisma.galeria.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar la galería", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const result = await prisma.galeria.deleteMany({ where: { id } });
    if (result.count === 0) return res.status(404).json({ error: "Galería no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la galería", error);
  }
};

const addImage = async (req, res) => {
  const galeriaId = parseId(req.params.id);
  if (!galeriaId) return res.status(400).json({ error: "El id de galería debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, imageFields);
  if (!validPayload(data, requiredImageFields)) {
    return res.status(400).json({ error: "url es obligatoria." });
  }

  try {
    const galeria = await prisma.galeria.findUnique({ where: { id: galeriaId }, select: { id: true } });
    if (!galeria) return res.status(404).json({ error: "Galería no encontrada." });
    const imagen = await prisma.galeriaImagen.create({ data: { ...data, galeriaId } });
    return res.status(201).json(imagen);
  } catch (error) {
    return reportControllerError(res, "agregar la imagen a la galería", error);
  }
};

const updateImage = async (req, res) => {
  const galeriaId = parseId(req.params.id);
  const id = parseId(req.params.imagenId);
  if (!galeriaId || !id) return res.status(400).json({ error: "Los ids deben ser enteros positivos." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, imageFields);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });

  try {
    const result = await prisma.galeriaImagen.updateMany({ where: { id, galeriaId }, data });
    if (result.count === 0) return res.status(404).json({ error: "Imagen de galería no encontrada." });
    return res.json(await prisma.galeriaImagen.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar la imagen de galería", error);
  }
};

const removeImage = async (req, res) => {
  const galeriaId = parseId(req.params.id);
  const id = parseId(req.params.imagenId);
  if (!galeriaId || !id) return res.status(400).json({ error: "Los ids deben ser enteros positivos." });

  try {
    const result = await prisma.galeriaImagen.deleteMany({ where: { id, galeriaId } });
    if (result.count === 0) return res.status(404).json({ error: "Imagen de galería no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la imagen de galería", error);
  }
};

export default { list, getById, create, update, remove, addImage, updateImage, removeImage };
