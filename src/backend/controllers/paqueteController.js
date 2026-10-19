import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const sections = ["SESION", "ALQUILER", "TARIFA"];
const packageFields = ["nombre", "descripcion", "precio", "imagenUrl", "publicId", "orden", "activo", "seccion"];
const characteristicFields = ["nombre", "orden"];
const includeCharacteristics = { caracteristicas: { orderBy: [{ orden: "asc" }, { id: "asc" }] } };

const list = async (req, res) => {
  const seccion = req.query.seccion || "SESION";
  if (!sections.includes(seccion)) return res.status(400).json({ error: "La sección solicitada no es válida." });
  try {
    return res.json(
      await prisma.paquete.findMany({
        where: { activo: true, seccion },
        include: includeCharacteristics,
        orderBy: [{ orden: "asc" }, { id: "asc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener los paquetes", error);
  }
};

const listAdmin = async (_req, res) => {
  try {
    return res.json(await prisma.paquete.findMany({
      include: includeCharacteristics,
      orderBy: [{ orden: "asc" }, { id: "asc" }],
    }));
  } catch (error) {
    return reportControllerError(res, "obtener los paquetes", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const paquete = await prisma.paquete.findUnique({
      where: { id },
      include: includeCharacteristics,
    });
    if (!paquete || !paquete.activo) return res.status(404).json({ error: "Paquete no encontrado." });
    return res.json(paquete);
  } catch (error) {
    return reportControllerError(res, "obtener el paquete", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, packageFields);
  if (data.seccion !== undefined && !sections.includes(data.seccion)) {
    return res.status(400).json({ error: "La sección del paquete no es válida." });
  }
  const caracteristicas = req.body.caracteristicas;
  if (typeof data.nombre !== "string" || !data.nombre.trim()) {
    return res.status(400).json({ error: "nombre es obligatorio." });
  }
  if (caracteristicas !== undefined && (!Array.isArray(caracteristicas) || caracteristicas.some((item) => typeof item !== "string" || !item.trim()))) {
    return res.status(400).json({ error: "Los beneficios deben ser una lista de textos no vacíos." });
  }
  try {
    const features = (caracteristicas || []).map((nombre, orden) => ({ nombre: nombre.trim(), orden }));
    return res.status(201).json(await prisma.paquete.create({
      data: { ...data, ...(features.length ? { caracteristicas: { create: features } } : {}) },
      include: includeCharacteristics,
    }));
  } catch (error) {
    return reportControllerError(res, "crear el paquete", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, packageFields);
  if (data.seccion !== undefined && !sections.includes(data.seccion)) {
    return res.status(400).json({ error: "La sección del paquete no es válida." });
  }
  const caracteristicas = req.body.caracteristicas;
  if (caracteristicas !== undefined && (!Array.isArray(caracteristicas) || caracteristicas.some((item) => typeof item !== "string" || !item.trim()))) {
    return res.status(400).json({ error: "Los beneficios deben ser una lista de textos no vacios." });
  }
  if (!Object.keys(data).length && caracteristicas === undefined) return res.status(400).json({ error: "No hay campos validos para actualizar." });
  try {
    const paquete = await prisma.$transaction(async (tx) => {
      const result = await tx.paquete.updateMany({ where: { id }, data });
      if (!result.count) return null;
      if (caracteristicas !== undefined) {
        await tx.paqueteCaracteristica.deleteMany({ where: { paqueteId: id } });
        const features = caracteristicas.map((nombre, orden) => ({ paqueteId: id, nombre: nombre.trim(), orden }));
        if (features.length) await tx.paqueteCaracteristica.createMany({ data: features });
      }
      return tx.paquete.findUnique({ where: { id }, include: includeCharacteristics });
    });
    if (!paquete) return res.status(404).json({ error: "Paquete no encontrado." });
    return res.json(paquete);
  } catch (error) {
    return reportControllerError(res, "actualizar el paquete", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.paquete.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Paquete no encontrado." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el paquete", error);
  }
};

const addCharacteristic = async (req, res) => {
  const paqueteId = parseId(req.params.id);
  if (!paqueteId) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, characteristicFields);
  if (typeof data.nombre !== "string" || !data.nombre.trim()) {
    return res.status(400).json({ error: "nombre es obligatorio." });
  }
  try {
    const paquete = await prisma.paquete.findUnique({ where: { id: paqueteId }, select: { id: true } });
    if (!paquete) return res.status(404).json({ error: "Paquete no encontrado." });
    return res.status(201).json(await prisma.paqueteCaracteristica.create({ data: { ...data, paqueteId } }));
  } catch (error) {
    return reportControllerError(res, "agregar la característica al paquete", error);
  }
};

const updateCharacteristic = async (req, res) => {
  const paqueteId = parseId(req.params.id);
  const id = parseId(req.params.caracteristicaId);
  if (!paqueteId || !id) return res.status(400).json({ error: "Los ids deben ser enteros positivos." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, characteristicFields);
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  try {
    const result = await prisma.paqueteCaracteristica.updateMany({ where: { id, paqueteId }, data });
    if (!result.count) return res.status(404).json({ error: "Característica de paquete no encontrada." });
    return res.json(await prisma.paqueteCaracteristica.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar la característica del paquete", error);
  }
};

const removeCharacteristic = async (req, res) => {
  const paqueteId = parseId(req.params.id);
  const id = parseId(req.params.caracteristicaId);
  if (!paqueteId || !id) return res.status(400).json({ error: "Los ids deben ser enteros positivos." });
  try {
    const result = await prisma.paqueteCaracteristica.deleteMany({ where: { id, paqueteId } });
    if (!result.count) return res.status(404).json({ error: "Característica de paquete no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la característica del paquete", error);
  }
};

export default {
  list,
  listAdmin,
  getById,
  create,
  update,
  remove,
  addCharacteristic,
  updateCharacteristic,
  removeCharacteristic,
};
