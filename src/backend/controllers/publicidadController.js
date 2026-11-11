import prisma from "../config/databases.js";
import { deleteImage, uploadImage } from "../config/imageStorage.js";
import { isObjectBody, parseId, reportControllerError } from "./_shared.js";

const tipoPublicidad = "PUBLICIDAD";
const parseVisibleHasta = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? false : date;
};

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
      include: { _count: { select: { consultas: true } } },
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
      where: { tipo: tipoPublicidad, activo: true, OR: [{ visibleHasta: null }, { visibleHasta: { gt: new Date() } }] },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      select: { id: true, nombre: true, url: true, seccion: true, descripcion: true, textoBoton: true, enlace: true, formularioEspecial: true, visibleHasta: true },
    });
    res.set("Cache-Control", "no-store");
    return res.json(anuncios);
  } catch (error) {
    return reportControllerError(res, "obtener los anuncios publicados", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
  const { titulo, servicio, descripcion, textoBoton, enlace, formularioEspecial, visibleHasta } = req.body;
  if (typeof titulo !== "string" || !titulo.trim() || typeof servicio !== "string" || !servicio.trim()) {
    return res.status(400).json({ error: "El título y el servicio son obligatorios." });
  }
  if (enlace && !validarEnlace(enlace)) return res.status(400).json({ error: "El enlace debe ser una URL HTTP o HTTPS válida." });
  const fechaVencimiento = parseVisibleHasta(visibleHasta);
  if (fechaVencimiento === false) return res.status(400).json({ error: "La fecha de vencimiento no es válida." });
  if (formularioEspecial !== undefined && ![true, false, "true", "false"].includes(formularioEspecial)) return res.status(400).json({ error: "formularioEspecial debe ser verdadero o falso." });
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
        formularioEspecial: formularioEspecial === true || formularioEspecial === "true",
        visibleHasta: fechaVencimiento,
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
    if (!anuncio.publicId) return res.status(409).json({ error: "El anuncio no tiene un identificador de almacenamiento verificable; se conservó para evitar una eliminación incompleta." });
    const porPublicId = [{ publicId: anuncio.publicId }];
    const porUrl = anuncio.url ? [{ url: anuncio.url }] : [];
    const referenciasUrl = [{ publicId: anuncio.publicId }, ...(anuncio.url ? [{ imagenUrl: anuncio.url }] : [])];
    const [imagenesCompartidas, fotografiasGaleria, servicios, paquetes, planes] = await Promise.all([
      prisma.imagen.count({ where: { id: { not: id }, OR: [...porPublicId, ...porUrl] } }),
      prisma.galeriaImagen.count({ where: { OR: [...porPublicId, ...porUrl] } }),
      prisma.servicio.count({ where: { OR: referenciasUrl } }),
      prisma.paquete.count({ where: { OR: referenciasUrl } }),
      prisma.planMembresia.count({ where: { OR: referenciasUrl } }),
    ]);
    const archivoCompartido = imagenesCompartidas + fotografiasGaleria + servicios + paquetes + planes > 0;
    await prisma.imagen.updateMany({ where: { id, tipo: tipoPublicidad }, data: { activo: false } });
    if (!archivoCompartido) {
      try { await deleteImage(anuncio.publicId); }
      catch (error) {
        console.error("[eliminar archivo de anuncio]", error);
        const anuncioConservado = await prisma.imagen.findFirst({ where: { id, tipo: tipoPublicidad } }).catch(() => null);
        return res.status(502).json({ error: "Cloudinary no confirmó la eliminación. El anuncio se conservó oculto para poder reintentar.", ...(anuncioConservado ? { image: anuncioConservado } : {}) });
      }
    }
    try { await prisma.imagen.deleteMany({ where: { id, tipo: tipoPublicidad } }); }
    catch (error) {
      console.error("[eliminar registro de anuncio]", error);
      const anuncioConservado = await prisma.imagen.findFirst({ where: { id, tipo: tipoPublicidad } }).catch(() => null);
      return res.status(503).json({ error: "El archivo se procesó, pero no se pudo retirar el registro. Se conservó oculto para reintentar.", ...(anuncioConservado ? { image: anuncioConservado } : {}) });
    }
    return res.json({ assetPreserved: archivoCompartido });
  } catch (error) {
    return reportControllerError(res, "eliminar el anuncio", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id || !isObjectBody(req.body) || typeof req.body.formularioEspecial !== "boolean") return res.status(400).json({ error: "Configuración no válida." });
  const fechaVencimiento = parseVisibleHasta(req.body.visibleHasta);
  if (fechaVencimiento === false) return res.status(400).json({ error: "La fecha de vencimiento no es válida." });
  try {
    const result = await prisma.imagen.updateMany({ where: { id, tipo: tipoPublicidad }, data: { formularioEspecial: req.body.formularioEspecial, visibleHasta: fechaVencimiento } });
    if (!result.count) return res.status(404).json({ error: "Anuncio no encontrado." });
    return res.json(await prisma.imagen.findUnique({ where: { id }, include: { _count: { select: { consultas: true } } } }));
  } catch (error) { return reportControllerError(res, "actualizar la configuración del anuncio", error); }
};

const createInquiry = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id || !isObjectBody(req.body)) return res.status(400).json({ error: "Solicitud no válida." });
  const { nombre, whatsapp, mensaje } = req.body;
  if (typeof nombre !== "string" || !nombre.trim() || nombre.trim().length > 140 || typeof whatsapp !== "string" || !whatsapp.trim() || whatsapp.trim().length > 40 || typeof mensaje !== "string" || !mensaje.trim() || mensaje.trim().length > 5000) return res.status(400).json({ error: "Completa Nombre, WhatsApp y Mensaje dentro de los límites permitidos." });
  try {
    const vigente = await prisma.imagen.findFirst({ where: { id, tipo: tipoPublicidad, activo: true, formularioEspecial: true, OR: [{ visibleHasta: null }, { visibleHasta: { gt: new Date() } }] }, select: { id: true } });
    if (!vigente) return res.status(410).json({ error: "Este anuncio ya no está disponible para consultas." });
    const consulta = await prisma.consultaAnuncio.create({ data: { anuncioId: id, nombre: nombre.trim(), whatsapp: whatsapp.trim(), mensaje: mensaje.trim() }, select: { id: true, createdAt: true } });
    return res.status(201).json({ ok: true, consulta });
  } catch (error) { return reportControllerError(res, "guardar la consulta del anuncio", error); }
};

const listInquiries = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const anuncio = await prisma.imagen.findFirst({ where: { id, tipo: tipoPublicidad }, select: { id: true, nombre: true } });
    if (!anuncio) return res.status(404).json({ error: "Anuncio no encontrado." });
    const consultas = await prisma.consultaAnuncio.findMany({ where: { anuncioId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
    return res.json({ anuncio, consultas });
  } catch (error) { return reportControllerError(res, "obtener las consultas del anuncio", error); }
};

export default { listAdmin, listPublic, create, setPublished, remove, update, createInquiry, listInquiries };
