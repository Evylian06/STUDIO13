import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["nombre", "descripcion", "precio", "imagenUrl", "publicId", "orden", "activo"];
const includeGallery = { galeria: { select: { id: true, nombre: true, slug: true, activo: true } } };

const asegurarGaleriaServicio = async (tx, servicio) => {
  const galeria = await tx.galeria.findUnique({
    where: { servicioId: servicio.id },
    select: { id: true },
  });
  const data = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    orden: servicio.orden,
    activo: servicio.activo,
  };
  if (galeria) return tx.galeria.update({ where: { id: galeria.id }, data });

  let slug = `servicio-${servicio.id}`;
  let suffix = 1;
  while (await tx.galeria.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `servicio-${servicio.id}-${suffix++}`;
  }
  return tx.galeria.create({ data: { ...data, slug, servicioId: servicio.id } });
};

const list = async (_req, res) => {
  try {
    return res.json(await prisma.servicio.findMany({
      include: includeGallery,
      orderBy: [{ orden: "asc" }, { id: "asc" }],
    }));
  } catch (error) {
    return reportControllerError(res, "obtener los servicios", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const servicio = await prisma.servicio.findUnique({ where: { id }, include: includeGallery });
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
  data.nombre = data.nombre.trim();
  try {
    const servicio = await prisma.$transaction(async (tx) => {
      const created = await tx.servicio.create({ data });
      await asegurarGaleriaServicio(tx, created);
      return tx.servicio.findUnique({ where: { id: created.id }, include: includeGallery });
    });
    return res.status(201).json(servicio);
  } catch (error) {
    return reportControllerError(res, "crear el servicio", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (typeof data.nombre === "string") data.nombre = data.nombre.trim();
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (Object.hasOwn(data, "nombre") && !data.nombre) return res.status(400).json({ error: "nombre es obligatorio." });

  try {
    const servicio = await prisma.$transaction(async (tx) => {
      const existing = await tx.servicio.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const updated = await tx.servicio.update({ where: { id }, data });
      await asegurarGaleriaServicio(tx, updated);
      return tx.servicio.findUnique({ where: { id }, include: includeGallery });
    });
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado." });
    return res.json(servicio);
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
