import prisma from "../config/databases.js";
import { deleteImage, uploadImage } from "../config/imageStorage.js";
import { isObjectBody, parseId, reportControllerError } from "./_shared.js";

const includePackage = { paquete: { select: { id: true, nombre: true, seccion: true, activo: true } } };
const errorOperacion = (message, status = 400) => Object.assign(new Error(message), { status });
const parseBoolean = (value) => value === true || value === "true" ? true : value === false || value === "false" ? false : null;

const parsePayload = async (body, existing = null) => {
  const titulo = typeof body.titulo === "string" ? body.titulo.trim() : existing?.titulo;
  const descripcion = typeof body.descripcion === "string" ? body.descripcion.trim() : existing?.descripcion;
  const inicioRaw = body.inicio ?? existing?.inicio;
  const finRaw = body.fin ?? existing?.fin;
  const paqueteIdRaw = body.paqueteId ?? existing?.paqueteId;
  const habilitadaRaw = body.habilitada ?? existing?.habilitada ?? false;
  const inicio = inicioRaw instanceof Date ? inicioRaw : new Date(inicioRaw);
  const fin = finRaw instanceof Date ? finRaw : new Date(finRaw);
  const paqueteId = Number(paqueteIdRaw);
  const habilitada = parseBoolean(habilitadaRaw);

  if (typeof titulo !== "string" || !titulo || titulo.length > 140) throw errorOperacion("El título es obligatorio y admite hasta 140 caracteres.");
  if (typeof descripcion !== "string" || !descripcion) throw errorOperacion("La descripción es obligatoria.");
  if (!inicioRaw || Number.isNaN(inicio.getTime()) || !finRaw || Number.isNaN(fin.getTime())) throw errorOperacion("Indica fechas y horas de inicio y fin válidas.");
  if (inicio >= fin) throw errorOperacion("La fecha y hora de fin deben ser posteriores al inicio.");
  if (!Number.isInteger(paqueteId) || paqueteId < 1) throw errorOperacion("Selecciona un paquete de Sesiones válido.");
  if (habilitada === null) throw errorOperacion("El estado de la campaña no es válido.");

  return { titulo, descripcion, inicio, fin, paqueteId, habilitada };
};

const validatePackage = async (client, paqueteId, allowLegacySession = false) => {
  const paquete = await client.paquete.findUnique({ where: { id: paqueteId }, select: { id: true, nombre: true, activo: true, seccion: true } });
  if (!paquete || (paquete.seccion !== "CAMPANIA" && !(allowLegacySession && paquete.seccion === "SESION")) || !paquete.activo) throw errorOperacion("El paquete asociado debe estar publicado en Paquetes → Campañas.", 422);
  return paquete;
};

const lockCampaignSchedule = async (tx) => {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(131013, 1)`;
};

const assertNoOverlap = async (tx, data, excludeId = null) => {
  if (!data.habilitada) return;
  const conflicto = await tx.campania.findFirst({
    where: {
      habilitada: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      inicio: { lt: data.fin },
      fin: { gt: data.inicio },
    },
    select: { id: true },
  });
  if (conflicto) throw errorOperacion("Las fechas se cruzan con otra campaña habilitada. Desactívala o cambia el horario.", 409);
};

const listAdmin = async (_req, res) => {
  try {
    return res.json(await prisma.campania.findMany({ include: includePackage, orderBy: [{ inicio: "desc" }, { id: "desc" }] }));
  } catch (error) {
    return reportControllerError(res, "obtener las campañas", error);
  }
};

const getActive = async (_req, res) => {
  try {
    const now = new Date();
    const campaign = await prisma.campania.findFirst({
      where: {
        habilitada: true,
        inicio: { lte: now },
        fin: { gt: now },
        paquete: { activo: true, seccion: { in: ["CAMPANIA", "SESION"] } },
      },
      select: { id: true, titulo: true, descripcion: true, imagenUrl: true, inicio: true, fin: true, paqueteId: true, paquete: { select: { id: true, nombre: true } } },
      orderBy: [{ inicio: "desc" }, { id: "desc" }],
    });
    if (!campaign) {
      const nextCampaign = await prisma.campania.findFirst({
        where: {
          habilitada: true,
          inicio: { gt: now },
          fin: { gt: now },
          paquete: { activo: true, seccion: { in: ["CAMPANIA", "SESION"] } },
        },
        select: { inicio: true },
        orderBy: [{ inicio: "asc" }, { id: "asc" }],
      });
      if (nextCampaign) res.set("X-Next-Campaign-Start", nextCampaign.inicio.toISOString());
    }
    res.set("Access-Control-Expose-Headers", "X-Next-Campaign-Start");
    res.set("Cache-Control", "no-store");
    return res.json(campaign);
  } catch (error) {
    return reportControllerError(res, "obtener la campaña activa", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
  if (!req.file) return res.status(400).json({ error: "Selecciona una imagen para la campaña." });
  let uploaded;
  try {
    const data = await parsePayload(req.body);
    await validatePackage(prisma, data.paqueteId);
    uploaded = await uploadImage(req.file.buffer, req.file.originalname, "campanias");
    const campaign = await prisma.$transaction(async (tx) => {
      await lockCampaignSchedule(tx);
      await validatePackage(tx, data.paqueteId);
      await assertNoOverlap(tx, data);
      return tx.campania.create({ data: { ...data, imagenUrl: uploaded.secure_url, publicId: uploaded.public_id }, include: includePackage });
    });
    return res.status(201).json(campaign);
  } catch (error) {
    if (uploaded?.public_id) await deleteImage(uploaded.public_id).catch((cleanupError) => console.error("[limpiar imagen de campaña]", cleanupError));
    if (error.status) return res.status(error.status).json({ error: error.message });
    return reportControllerError(res, "crear la campaña", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
  let uploaded;
  try {
    const existing = await prisma.campania.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Campaña no encontrada." });
    const data = await parsePayload(req.body, existing);
    await validatePackage(prisma, data.paqueteId, data.paqueteId === existing.paqueteId);
    if (req.file) uploaded = await uploadImage(req.file.buffer, req.file.originalname, "campanias");
    const campaign = await prisma.$transaction(async (tx) => {
      await lockCampaignSchedule(tx);
      await validatePackage(tx, data.paqueteId, data.paqueteId === existing.paqueteId);
      await assertNoOverlap(tx, data, id);
      return tx.campania.update({
        where: { id },
        data: { ...data, ...(uploaded ? { imagenUrl: uploaded.secure_url, publicId: uploaded.public_id } : {}) },
        include: includePackage,
      });
    });
    if (uploaded && existing.publicId) await deleteImage(existing.publicId).catch((error) => console.error("[retirar imagen anterior de campaña]", error));
    return res.json(campaign);
  } catch (error) {
    if (uploaded?.public_id) await deleteImage(uploaded.public_id).catch((cleanupError) => console.error("[limpiar imagen de campaña]", cleanupError));
    if (error.status) return res.status(error.status).json({ error: error.message });
    return reportControllerError(res, "actualizar la campaña", error);
  }
};

const setEnabled = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body) || typeof parseBoolean(req.body.habilitada) !== "boolean") {
    return res.status(400).json({ error: "habilitada debe ser verdadero o falso." });
  }
  try {
    const habilitada = parseBoolean(req.body.habilitada);
    const campaign = await prisma.$transaction(async (tx) => {
      await lockCampaignSchedule(tx);
      const existing = await tx.campania.findUnique({ where: { id } });
      if (!existing) return null;
      const data = { ...existing, habilitada };
      if (habilitada) {
        await validatePackage(tx, existing.paqueteId, true);
        await assertNoOverlap(tx, data, id);
      }
      return tx.campania.update({ where: { id }, data: { habilitada }, include: includePackage });
    });
    if (!campaign) return res.status(404).json({ error: "Campaña no encontrada." });
    return res.json(campaign);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return reportControllerError(res, "cambiar el estado de la campaña", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const campaign = await prisma.$transaction(async (tx) => {
      const existing = await tx.campania.findUnique({ where: { id }, select: { id: true, titulo: true, publicId: true } });
      if (!existing) return null;
      await tx.reservacion.updateMany({ where: { campaniaId: id }, data: { campaniaNombre: existing.titulo } });
      await tx.campania.delete({ where: { id } });
      return existing;
    });
    if (!campaign) return res.status(404).json({ error: "Campaña no encontrada." });
    if (campaign.publicId) {
      await deleteImage(campaign.publicId).catch((error) => console.error("[limpiar imagen de campaña eliminada]", error));
    }
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la campaña", error);
  }
};

export default { listAdmin, getActive, create, update, setEnabled, remove };
