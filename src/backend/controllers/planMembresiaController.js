import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = [
  "nombre",
  "descripcion",
  "precio",
  "duracionDias",
  "periodo",
  "limiteSesiones",
  "imagenUrl",
  "publicId",
  "activo",
  "archivado",
  "orden",
  "ubicacionPublica",
  "agregarInicio",
  "beneficios",
];
const periodosDias = { MENSUAL: 30, TRIMESTRAL: 90, ANUAL: 365 };
const ubicacionesPublicas = new Set(["MEMBRESIAS", "INICIO"]);
const includeRelations = {
  beneficiosItems: { orderBy: [{ orden: "asc" }, { id: "asc" }] },
  _count: { select: { membresias: true } },
};

const beneficiosDesdeBody = (body, legacy) => {
  if (Object.hasOwn(body, "beneficiosItems")) return body.beneficiosItems;
  if (typeof legacy === "string")
    return legacy
      .split(/\r?\n/)
      .map((beneficio) => beneficio.trim())
      .filter(Boolean);
  return undefined;
};

const validarBeneficios = (items, obligatorio = false) => {
  if (items === undefined)
    return obligatorio ? "Agrega al menos un beneficio." : null;
  if (
    !Array.isArray(items) ||
    items.some((item) => typeof item !== "string" || !item.trim())
  ) {
    return "Los beneficios deben ser una lista de textos no vacíos.";
  }
  if (obligatorio && items.length === 0) return "Agrega al menos un beneficio.";
  return null;
};

const validarPublicacion = (data) => {
  if (
    Object.hasOwn(data, "ubicacionPublica") &&
    !ubicacionesPublicas.has(data.ubicacionPublica)
  )
    return "La ubicación pública no es válida.";
  if (
    Object.hasOwn(data, "agregarInicio") &&
    typeof data.agregarInicio !== "boolean"
  )
    return "agregarInicio debe ser booleano.";
  if (Object.hasOwn(data, "activo") && typeof data.activo !== "boolean")
    return "activo debe ser booleano.";
  if (Object.hasOwn(data, "archivado") && typeof data.archivado !== "boolean")
    return "archivado debe ser booleano.";
  if (
    Object.hasOwn(data, "orden") &&
    (!Number.isInteger(data.orden) || data.orden < 0)
  )
    return "orden debe ser un entero no negativo.";
  if (
    Object.hasOwn(data, "agregarInicio") &&
    !Object.hasOwn(data, "ubicacionPublica")
  )
    data.ubicacionPublica = data.agregarInicio ? "INICIO" : "MEMBRESIAS";
  else if (
    Object.hasOwn(data, "ubicacionPublica") &&
    !Object.hasOwn(data, "agregarInicio")
  )
    data.agregarInicio = data.ubicacionPublica === "INICIO";
  if (data.ubicacionPublica === "INICIO" && data.agregarInicio === false)
    return "Activa Agregar a Inicio para ubicar el plan en Inicio.";
  return null;
};

const validarCampos = (data, requireComplete = false) => {
  if (
    Object.hasOwn(data, "nombre") &&
    (typeof data.nombre !== "string" || !data.nombre.trim())
  )
    return "El nombre es obligatorio.";
  if (
    Object.hasOwn(data, "descripcion") &&
    data.descripcion !== null &&
    typeof data.descripcion !== "string"
  )
    return "La descripción debe ser texto.";
  if (
    Object.hasOwn(data, "precio") &&
    (!Number.isFinite(Number(data.precio)) || Number(data.precio) < 0)
  )
    return "El precio debe ser un número mayor o igual a cero.";
  if (
    Object.hasOwn(data, "periodo") &&
    !Object.hasOwn(periodosDias, data.periodo)
  )
    return "La duración debe ser mensual, trimestral o anual.";
  if (
    Object.hasOwn(data, "duracionDias") &&
    (!Number.isInteger(data.duracionDias) || data.duracionDias <= 0)
  )
    return "La duración debe ser un entero positivo.";
  if (
    Object.hasOwn(data, "limiteSesiones") &&
    data.limiteSesiones !== null &&
    (!Number.isInteger(data.limiteSesiones) || data.limiteSesiones < 1)
  )
    return "El límite de sesiones debe ser un entero positivo.";
  for (const field of ["imagenUrl", "publicId"]) {
    if (
      Object.hasOwn(data, field) &&
      data[field] !== null &&
      typeof data[field] !== "string"
    )
      return `${field} debe ser texto.`;
  }
  if (requireComplete) {
    if (typeof data.nombre !== "string" || !data.nombre.trim())
      return "El nombre es obligatorio.";
    if (typeof data.descripcion !== "string" || !data.descripcion.trim())
      return "La descripción es obligatoria.";
    if (!Number.isFinite(Number(data.precio)) || Number(data.precio) < 0)
      return "Indica un precio válido igual o mayor que cero.";
    if (!Object.hasOwn(periodosDias, data.periodo))
      return "Selecciona una duración válida.";
  }
  return null;
};

const reemplazarBeneficios = async (tx, planId, items) => {
  if (items === undefined) return;
  await tx.planMembresiaBeneficio.deleteMany({ where: { planId } });
  if (items.length) {
    await tx.planMembresiaBeneficio.createMany({
      data: items.map((nombre, orden) => ({
        planId,
        nombre: nombre.trim(),
        orden,
      })),
    });
  }
};

const list = async (_req, res) => {
  try {
    return res.json(
      await prisma.planMembresia.findMany({
        where: { activo: true, archivado: false },
        include: {
          beneficiosItems: { orderBy: [{ orden: "asc" }, { id: "asc" }] },
        },
        orderBy: [{ orden: "asc" }, { id: "asc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener los planes de membresía", error);
  }
};

const listAdmin = async (_req, res) => {
  try {
    return res.json(
      await prisma.planMembresia.findMany({
        include: includeRelations,
        orderBy: [{ orden: "asc" }, { id: "asc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener los planes de membresía", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ error: "El id debe ser un entero positivo." });
  try {
    const plan = await prisma.planMembresia.findFirst({
      where: { id, activo: true, archivado: false },
      include: {
        beneficiosItems: { orderBy: [{ orden: "asc" }, { id: "asc" }] },
      },
    });
    if (!plan)
      return res
        .status(404)
        .json({ error: "Plan de membresía no encontrado." });
    return res.json(plan);
  } catch (error) {
    return reportControllerError(res, "obtener el plan de membresía", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body))
    return res
      .status(400)
      .json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  const beneficiosItems = beneficiosDesdeBody(req.body, data.beneficios);
  const errorCampos = validarCampos(data, true);
  if (errorCampos) return res.status(400).json({ error: errorCampos });
  const errorBeneficios = validarBeneficios(beneficiosItems, true);
  if (errorBeneficios) return res.status(400).json({ error: errorBeneficios });
  const errorPublicacion = validarPublicacion(data);
  if (errorPublicacion)
    return res.status(400).json({ error: errorPublicacion });

  data.nombre = data.nombre.trim();
  data.descripcion = data.descripcion.trim();
  data.precio = Number(data.precio);
  data.periodo = data.periodo || "MENSUAL";
  data.duracionDias = periodosDias[data.periodo];
  data.limiteSesiones ??= null;
  data.imagenUrl ??= null;
  data.publicId ??= null;
  data.ubicacionPublica ??= "MEMBRESIAS";
  data.agregarInicio ??= false;
  data.activo ??= false;
  data.archivado = false;
  data.beneficios = beneficiosItems.join("\n");

  try {
    const plan = await prisma.$transaction(
      async (tx) => {
        const created = await tx.planMembresia.create({ data });

        await reemplazarBeneficios(tx, created.id, beneficiosItems);

        return tx.planMembresia.findUnique({
          where: { id: created.id },
          include: includeRelations,
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    return res.status(201).json(plan);
  } catch (error) {
    return reportControllerError(res, "crear el plan de membresía", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body))
    return res
      .status(400)
      .json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  const beneficiosItems = beneficiosDesdeBody(
    req.body,
    Object.hasOwn(data, "beneficios") ? data.beneficios : undefined,
  );
  if (Object.hasOwn(data, "beneficios")) delete data.beneficios;
  if (!Object.keys(data).length && beneficiosItems === undefined)
    return res
      .status(400)
      .json({ error: "No hay campos válidos para actualizar." });
  const errorCampos = validarCampos(data);
  if (errorCampos) return res.status(400).json({ error: errorCampos });
  const errorBeneficios = validarBeneficios(beneficiosItems);
  if (errorBeneficios) return res.status(400).json({ error: errorBeneficios });
  const errorPublicacion = validarPublicacion(data);
  if (errorPublicacion)
    return res.status(400).json({ error: errorPublicacion });

  try {
    const plan = await prisma.$transaction(async (tx) => {
      const existente = await tx.planMembresia.findUnique({
        where: { id },
        select: { id: true, archivado: true },
      });
      if (!existente) return null;
      const tieneCompras = await tx.membresia.count({ where: { planId: id } });
      const camposProtegidos = [
        "nombre",
        "descripcion",
        "precio",
        "duracionDias",
        "periodo",
        "limiteSesiones",
        "imagenUrl",
        "publicId",
      ];
      if (
        tieneCompras &&
        (camposProtegidos.some((campo) => Object.hasOwn(data, campo)) ||
          beneficiosItems !== undefined)
      ) {
        const error = new Error(
          "Este plan tiene membresías adquiridas; sus condiciones y beneficios están protegidos para conservar el historial.",
        );
        error.status = 409;
        throw error;
      }
      if (Object.hasOwn(data, "periodo"))
        data.duracionDias = periodosDias[data.periodo];
      else if (Object.hasOwn(data, "duracionDias")) {
        const periodo = Object.entries(periodosDias).find(
          ([, dias]) => dias === data.duracionDias,
        )?.[0];
        if (periodo) data.periodo = periodo;
      }
      if (Object.hasOwn(data, "nombre")) data.nombre = data.nombre.trim();
      if (
        Object.hasOwn(data, "descripcion") &&
        typeof data.descripcion === "string"
      )
        data.descripcion = data.descripcion.trim();
      if (Object.hasOwn(data, "precio")) data.precio = Number(data.precio);
      if (beneficiosItems !== undefined)
        data.beneficios = beneficiosItems.join("\n");
      if (data.archivado === true) data.activo = false;
      if (
        data.activo === true &&
        (data.archivado === true ||
          (data.archivado === undefined && existente.archivado))
      ) {
        const error = new Error("Restaura el plan antes de publicarlo.");
        error.status = 409;
        throw error;
      }
      const result = await tx.planMembresia.updateMany({ where: { id }, data });
      if (!result.count) return null;
      await reemplazarBeneficios(tx, id, beneficiosItems);
      return tx.planMembresia.findUnique({
        where: { id },
        include: includeRelations,
      });
    });
    if (!plan)
      return res
        .status(404)
        .json({ error: "Plan de membresía no encontrado." });
    return res.json(plan);
  } catch (error) {
    if (error.status === 409)
      return res.status(409).json({ error: error.message });
    return reportControllerError(res, "actualizar el plan de membresía", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ error: "El id debe ser un entero positivo." });
  try {
    const tieneCompras = await prisma.membresia.count({
      where: { planId: id },
    });
    if (tieneCompras)
      return res
        .status(409)
        .json({
          error:
            "No se puede eliminar un plan con membresías adquiridas. Archívalo para conservar su historial.",
        });
    const result = await prisma.planMembresia.deleteMany({ where: { id } });
    if (!result.count)
      return res
        .status(404)
        .json({ error: "Plan de membresía no encontrado." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el plan de membresía", error);
  }
};

export default { list, listAdmin, getById, create, update, remove };
