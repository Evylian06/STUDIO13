import prisma from "../config/databases.js";
import { deleteImage, uploadImage } from "../config/imageStorage.js";
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
    const imagenes = await prisma.imagen.findMany({ where: { tipo: "GENERAL" }, orderBy: [{ orden: "asc" }, { id: "asc" }] });
    return res.json(imagenes);
  } catch (error) {
    return reportControllerError(res, "obtener las imágenes", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const imagen = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL" } });
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada." });
    return res.json(imagen);
  } catch (error) {
    return reportControllerError(res, "obtener la imagen", error);
  }
};

const create = async (req, res) => {
  if (req.file) {
    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
    const seccion = typeof req.body.seccion === "string" ? req.body.seccion.trim() : "";
    if (!nombre || !seccion) return res.status(400).json({ error: "nombre y seccion son obligatorios para subir una imagen." });

    let imagenSubida;
    try {
      imagenSubida = await uploadImage(req.file.buffer, req.file.originalname, "galeria", { requireCloudinary: true });
      const imagen = await prisma.imagen.create({
        data: {
          nombre,
          url: imagenSubida.secure_url,
          publicId: imagenSubida.public_id,
          seccion,
          tipo: "GENERAL",
          activo: true,
        },
      });
      return res.status(201).json(imagen);
    } catch (error) {
      if (imagenSubida?.public_id) await deleteImage(imagenSubida.public_id).catch((deleteError) => console.error("[limpiar imagen de galería]", deleteError));
      if (error.status === 503) return res.status(503).json({ error: error.message });
      return reportControllerError(res, "subir la imagen de galería", error);
    }
  }

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
