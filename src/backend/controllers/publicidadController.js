import prisma from "../config/databases.js";
import { deleteImage, uploadImage } from "../config/imageStorage.js";
import { isObjectBody, parseId, reportControllerError } from "./_shared.js";

const tipoPublicidad = "PUBLICIDAD";

const validarEnlace = (valor) => {
  if (!valor) return true;
  try {
    const enlace = new URL(valor);
    return enlace.protocol === "http:" || enlace.protocol === "https:";
  } catch {
    return false;
  }
};

const listAdmin = async (_req, res) => {
  try {
    const anuncios = await prisma.imagen.findMany({
      where: { tipo: tipoPublicidad },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return res.json(anuncios);
  } catch (error) {
    return reportControllerError(res, "obtener los anuncios", error);
  }
};

const listPublic = async (_req, res) => {
  try {
    const anuncios = await prisma.imagen.findMany({
      where: { tipo: tipoPublicidad, activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      select: { id: true, nombre: true, url: true, seccion: true, descripcion: true, textoBoton: true, enlace: true },
    });
    return res.json(anuncios);
  } catch (error) {
    return reportControllerError(res, "obtener los anuncios publicados", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
  const { titulo, servicio, descripcion, textoBoton, enlace } = req.body;
  if (typeof titulo !== "string" || !titulo.trim() || typeof servicio !== "string" || !servicio.trim()) {
    return res.status(400).json({ error: "El título y el servicio son obligatorios." });
  }
  if (enlace && !validarEnlace(enlace)) return res.status(400).json({ error: "El enlace debe ser una URL HTTP o HTTPS válida." });
  if (!req.file) return res.status(400).json({ error: "Selecciona una imagen para el anuncio." });
  let imagenSubida;
  try {
    imagenSubida = await uploadImage(req.file.buffer, req.file.originalname, "anuncios", { requireCloudinary: true });
    const anuncio = await prisma.imagen.create({
      data: {
        nombre: titulo.trim(),
        url: imagenSubida.secure_url,
        publicId: imagenSubida.public_id,
        seccion: servicio.trim(),
        descripcion: typeof descripcion === "string" ? descripcion.trim() || null : null,
        textoBoton: typeof textoBoton === "string" ? textoBoton.trim() || null : null,
        enlace: typeof enlace === "string" ? enlace.trim() || null : null,
        tipo: tipoPublicidad,
        activo: false,
      },
    });
    return res.status(201).json(anuncio);
  } catch (error) {
    if (imagenSubida?.public_id) await deleteImage(imagenSubida.public_id).catch((deleteError) => console.error("[limpiar imagen de anuncio]", deleteError));
    if (error.status === 503) return res.status(503).json({ error: error.message });
    return reportControllerError(res, "crear el anuncio", error);
  }
};

const setPublished = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body) || typeof req.body.activo !== "boolean") {
    return res.status(400).json({ error: "activo debe ser verdadero o falso." });
  }

  try {
    const result = await prisma.imagen.updateMany({
      where: { id, tipo: tipoPublicidad },
      data: { activo: req.body.activo },
    });
    if (!result.count) return res.status(404).json({ error: "Anuncio no encontrado." });
    return res.json(await prisma.imagen.findUnique({ where: { id } }));
  } catch (error) {
    return reportControllerError(res, "actualizar la publicaciÃ³n del anuncio", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });

  try {
    const anuncio = await prisma.imagen.findFirst({ where: { id, tipo: tipoPublicidad } });
    if (!anuncio) return res.status(404).json({ error: "Anuncio no encontrado." });
    await prisma.imagen.delete({ where: { id } });
    await deleteImage(anuncio.publicId).catch((error) => console.error("[eliminar archivo de anuncio]", error));
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el anuncio", error);
  }
};

export default { listAdmin, listPublic, create, setPublished, remove };
