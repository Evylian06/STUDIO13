import prisma from "../config/databases.js";
import { deleteImage, uploadImage } from "../config/imageStorage.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["nombre", "url", "publicId", "servicioId", "seccion", "descripcion", "orden", "activo"];
const editableFields = ["nombre", "servicioId", "descripcion", "orden", "activo"];
const requiredFields = ["nombre", "url", "servicioId"];
const MAX_IMAGENES_POR_SERVICIO = 10;

const errorServicio = (message, status) => Object.assign(new Error(message), { status });

const bloquearServicio = async (tx, servicioId) => {
  const rows = await tx.$queryRaw`SELECT "id" FROM "Servicio" WHERE "id" = ${servicioId} FOR UPDATE`;
  if (!rows.length) throw errorServicio("El servicio seleccionado no existe.", 404);
  return tx.servicio.findUnique({ where: { id: servicioId }, select: { id: true, nombre: true } });
};

const bloquearServiciosOrdenados = async (tx, servicioIds) => {
  const ids = [...new Set(servicioIds.filter((id) => Number.isInteger(id)))].sort((a, b) => a - b);
  const servicios = new Map();
  for (const id of ids) servicios.set(id, await bloquearServicio(tx, id));
  return servicios;
};

const verificarEspacioServicio = async (tx, servicioId, excludeImageId = null) => {
  const total = await tx.imagen.count({ where: { tipo: "GENERAL", servicioId, ...(excludeImageId ? { id: { not: excludeImageId } } : {}) } });
  if (total >= MAX_IMAGENES_POR_SERVICIO) {
    throw errorServicio("Este servicio ya alcanzó el límite de 10 imágenes.", 409);
  }
};

const buscarReferencias = async (imagen) => {
  const porPublicId = imagen.publicId ? [{ publicId: imagen.publicId }] : [];
  const porUrl = imagen.url ? [{ url: imagen.url }] : [];
  const referenciasAsset = { OR: [...porPublicId, ...porUrl] };
  const referenciasUrl = { OR: [...(imagen.publicId ? [{ publicId: imagen.publicId }] : []), ...(imagen.url ? [{ imagenUrl: imagen.url }] : [])] };
  const [imagenes, fotografiasGaleria, servicios, paquetes, planes] = await Promise.all([
    prisma.imagen.count({ where: { id: { not: imagen.id }, OR: [...porPublicId, ...porUrl] } }),
    prisma.galeriaImagen.count({ where: referenciasAsset }),
    prisma.servicio.count({ where: referenciasUrl }),
    prisma.paquete.count({ where: referenciasUrl }),
    prisma.planMembresia.count({ where: referenciasUrl }),
  ]);
  return [
    imagenes && `${imagenes} registro(s) de imagen`,
    fotografiasGaleria && `${fotografiasGaleria} fotografía(s) de galería`,
    servicios && `${servicios} servicio(s)`,
    paquetes && `${paquetes} paquete(s)`,
    planes && `${planes} plan(es) de membresía`,
  ].filter(Boolean);
};

const normalizarActualizacion = (payload) => {
  const data = pickDefined(payload, editableFields);
  if (Object.hasOwn(data, "nombre")) {
    if (typeof data.nombre !== "string" || !data.nombre.trim() || data.nombre.trim().length > 120) throw new Error("El nombre es obligatorio y debe tener hasta 120 caracteres.");
    data.nombre = data.nombre.trim();
  }
  if (Object.hasOwn(data, "servicioId")) {
    if (typeof data.servicioId === "string" && data.servicioId.trim()) data.servicioId = Number(data.servicioId);
    if (!Number.isInteger(data.servicioId) || data.servicioId < 1) throw new Error("Selecciona un servicio válido.");
  }
  if (Object.hasOwn(data, "descripcion")) {
    if (data.descripcion !== null && typeof data.descripcion !== "string") throw new Error("La descripción no es válida.");
    data.descripcion = typeof data.descripcion === "string" ? data.descripcion.trim() || null : null;
  }
  if (Object.hasOwn(data, "activo")) {
    if (data.activo === "true") data.activo = true;
    if (data.activo === "false") data.activo = false;
    if (typeof data.activo !== "boolean") throw new Error("El estado de publicación no es válido.");
  }
  if (Object.hasOwn(data, "orden")) {
    if (typeof data.orden === "string" && data.orden.trim()) data.orden = Number(data.orden);
    if (!Number.isInteger(data.orden)) throw new Error("El orden debe ser un número entero.");
  }
  return data;
};

const validPayload = (payload, requireAll = false) =>
  Object.keys(payload).length > 0 &&
  (!requireAll || requiredFields.every((field) => typeof payload[field] === "string" && payload[field].trim()));

const list = async (_req, res) => {
  try {
    const imagenes = await prisma.imagen.findMany({ where: { tipo: "GENERAL", activo: true }, orderBy: [{ orden: "asc" }, { id: "asc" }] });
    res.set("Cache-Control", "no-store");
    return res.json(imagenes);
  } catch (error) {
    return reportControllerError(res, "obtener las imágenes", error);
  }
};

const listAdmin = async (_req, res) => {
  try {
    const imagenes = await prisma.imagen.findMany({ where: { tipo: "GENERAL" }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
    res.set("Cache-Control", "no-store");
    return res.json(imagenes);
  } catch (error) {
    return reportControllerError(res, "obtener las imágenes", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const imagen = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL", activo: true } });
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada." });
    res.set("Cache-Control", "no-store");
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
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
  let data;
  try { data = normalizarActualizacion(req.body); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  if (!Object.keys(data).length && !req.file) return res.status(400).json({ error: "No hay cambios para actualizar." });
  let imagenSubida;
  let registroActualizado = false;
  try {
    const imagenActual = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL" } });
    if (!imagenActual) return res.status(404).json({ error: "Imagen no encontrada." });
    let referenciasAntiguoAsset = [];
    if (req.file) {
      imagenSubida = await uploadImage(req.file.buffer, req.file.originalname, "galeria", { requireCloudinary: true });
      data.url = imagenSubida.secure_url;
      data.publicId = imagenSubida.public_id;
      referenciasAntiguoAsset = await buscarReferencias(imagenActual);
    }
    const result = await prisma.imagen.updateMany({ where: { id, tipo: "GENERAL" }, data });
    if (!result.count) {
      if (imagenSubida?.public_id) await deleteImage(imagenSubida.public_id).catch((cleanupError) => console.error("[limpiar reemplazo no guardado]", cleanupError));
      return res.status(404).json({ error: "Imagen no encontrada." });
    }
    registroActualizado = true;
    const imagenActualizada = await prisma.imagen.findUnique({ where: { id } });
    let cleanupWarning;
    if (imagenSubida && imagenActual.publicId && !referenciasAntiguoAsset.length) {
      try { await deleteImage(imagenActual.publicId); }
      catch (error) {
        cleanupWarning = "Los datos se actualizaron, pero no se pudo eliminar el archivo anterior de Cloudinary.";
        console.error("[limpiar imagen anterior reemplazada]", error);
      }
    }
    return res.json({ ...imagenActualizada, ...(cleanupWarning ? { cleanupWarning } : {}) });
  } catch (error) {
    if (imagenSubida?.public_id && !registroActualizado) await deleteImage(imagenSubida.public_id).catch((cleanupError) => console.error("[limpiar reemplazo tras error]", cleanupError));
    if (error.status === 503) return res.status(503).json({ error: error.message });
    return reportControllerError(res, "actualizar la imagen", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const imagen = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL" } });
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada." });
    if (!imagen.publicId) return res.status(409).json({ error: "Esta imagen no tiene un identificador de almacenamiento verificable; se conservó el registro para evitar una eliminación incompleta." });
    const referencias = await buscarReferencias(imagen);
    if (referencias.length) return res.status(409).json({ error: "No se eliminó la imagen porque el recurso está compartido con " + referencias.join(", ") + "." });
    const desactivar = await prisma.imagen.updateMany({ where: { id, tipo: "GENERAL" }, data: { activo: false } });
    if (!desactivar.count) return res.status(404).json({ error: "Imagen no encontrada." });
    try { await deleteImage(imagen.publicId); }
    catch (error) {
      console.error("[eliminar archivo de imagen]", error);
      const imagenConservada = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL" } }).catch(() => null);
      return res.status(502).json({ error: "El almacenamiento no confirmó la eliminación. El registro se conservó oculto para evitar mostrar una imagen cuyo estado es incierto; puedes reintentar o volver a publicarla.", retryable: true, ...(imagenConservada ? { image: imagenConservada } : {}) });
    }
    try {
      await prisma.imagen.deleteMany({ where: { id, tipo: "GENERAL" } });
      return res.status(204).end();
    } catch (error) {
      console.error("[eliminar registro tras borrar archivo]", error);
      const imagenConservada = await prisma.imagen.findFirst({ where: { id, tipo: "GENERAL" } }).catch(() => null);
      return res.status(503).json({ error: "El archivo se eliminó, pero no se pudo retirar el registro. Se conservó oculto para permitir reintentar.", retryable: true, ...(imagenConservada ? { image: imagenConservada } : {}) });
    }
  } catch (error) {
    return reportControllerError(res, "eliminar la imagen", error);
  }
};

export default { list, listAdmin, getById, create, update, remove };
