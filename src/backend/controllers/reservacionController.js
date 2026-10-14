import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["tipoSesion", "fecha", "hora"];
const requiredFields = ["nombre", "email", "tipoSesion"];
const includeCliente = { cliente: { select: { id: true, nombre: true, email: true, telefono: true } } };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validPayload = (data, requireAll = false) =>
  Object.keys(data).length > 0 &&
  (!requireAll || requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== ""));

const list = async (_req, res) => {
  try {
    return res.json(
      await prisma.reservacion.findMany({
        include: includeCliente,
        orderBy: [{ fecha: "asc" }, { id: "asc" }],
      }),
    );
  } catch (error) {
    return reportControllerError(res, "obtener las reservaciones", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const reservacion = await prisma.reservacion.findUnique({ where: { id }, include: includeCliente });
    if (!reservacion) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.json(reservacion);
  } catch (error) {
    return reportControllerError(res, "obtener la reservación", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const esAdmin = Boolean(req.admin);
  const usarClienteExistente = esAdmin && req.body.clienteId !== undefined && req.body.clienteId !== null;
  const crearOReutilizarCliente = esAdmin && !usarClienteExistente;
  const data = pickDefined(req.body, esAdmin
    ? ["clienteId", "nombre", "email", "telefono", "tipoSesion", "fecha", "hora", "mensaje"]
    : ["nombre", "email", "telefono", "tipoSesion", "fecha", "hora", "mensaje"]);
  if (!data.tipoSesion || (esAdmin && ((!data.clienteId && (!data.nombre || !data.email || !data.telefono)) || !data.fecha || !data.hora)) || (!esAdmin && (!data.nombre || !data.email))) {
    return res.status(400).json({ error: esAdmin ? "Selecciona un cliente o indica nombre, email y teléfono; tipoSesion, fecha y hora son obligatorios." : "nombre, email y tipoSesion son obligatorios." });
  }
  if ((!esAdmin || crearOReutilizarCliente) && (typeof data.nombre !== "string" || !data.nombre.trim())) {
    return res.status(400).json({ error: "nombre debe ser una cadena no vacía." });
  }
  if ((!esAdmin || crearOReutilizarCliente) && (typeof data.email !== "string" || !emailPattern.test(data.email.trim()))) {
    return res.status(400).json({ error: "email debe ser una dirección de correo válida." });
  }
  if (typeof data.tipoSesion !== "string" || !data.tipoSesion.trim()) {
    return res.status(400).json({ error: "tipoSesion debe ser una cadena no vacía." });
  }
  if (esAdmin && (typeof data.hora !== "string" || !data.hora.trim())) {
    return res.status(400).json({ error: "hora debe ser una hora válida." });
  }
  if ((!esAdmin || crearOReutilizarCliente) && (typeof data.telefono !== "string" || !data.telefono.trim())) {
    return res.status(400).json({ error: "telefono es obligatorio para registrar un cliente nuevo." });
  }
  if (!esAdmin && data.telefono !== undefined && data.telefono !== null && typeof data.telefono !== "string") {
    return res.status(400).json({ error: "telefono debe ser una cadena." });
  }
  if (data.mensaje !== undefined && data.mensaje !== null && typeof data.mensaje !== "string") {
    return res.status(400).json({ error: "mensaje debe ser una cadena." });
  }
  if (data.tipoSesion.trim() === "Cotización personalizada" && !data.mensaje?.trim()) {
    return res.status(400).json({ error: "Describe qué necesita el cliente para la cotización personalizada." });
  }

  const email = usarClienteExistente ? null : data.email.trim().toLowerCase();
  const nombre = usarClienteExistente ? null : data.nombre.trim();
  const telefono = typeof data.telefono === "string" ? data.telefono.trim() : "";
  const tipoSesion = data.tipoSesion.trim();
  const mensaje = typeof data.mensaje === "string" ? data.mensaje.trim() : null;
  let fecha = null;
  if (data.fecha !== undefined && data.fecha !== null && data.fecha !== "") {
    fecha = new Date(data.fecha);
    if (Number.isNaN(fecha.getTime())) return res.status(400).json({ error: "fecha debe ser una fecha válida." });
  }

  try {
    if (esAdmin) {
      let cliente;
      if (usarClienteExistente) {
        const clienteId = parseId(data.clienteId);
        if (!clienteId) return res.status(400).json({ error: "clienteId debe ser un entero positivo." });
        cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
        if (!cliente) return res.status(404).json({ error: "El cliente seleccionado no existe." });
        return res.status(201).json(await prisma.reservacion.create({
          data: {
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            tipoSesion,
            fecha,
            hora: data.hora,
            mensaje,
            estado: "CONFIRMADA",
            clienteId: cliente.id,
          },
          include: includeCliente,
        }));
      }

      const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
      let reservacionAdmin;
      for (let intento = 0; intento < 2; intento += 1) {
        try {
          reservacionAdmin = await prisma.$transaction(async (tx) => {
            let clienteNuevo = await tx.cliente.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
              orderBy: { id: "asc" },
            });
            if (!clienteNuevo) {
              clienteNuevo = await tx.cliente.create({ data: { nombre, email, telefono, passwordHash } });
            }
            return tx.reservacion.create({
              data: {
                nombre: clienteNuevo.nombre,
                email: clienteNuevo.email,
                telefono: clienteNuevo.telefono,
                tipoSesion,
                fecha,
                hora: data.hora,
                mensaje,
                estado: "CONFIRMADA",
                clienteId: clienteNuevo.id,
              },
              include: includeCliente,
            });
          }, { isolationLevel: "Serializable" });
          break;
        } catch (error) {
          const conflicto = error?.code === "P2002" || error?.code === "P2034";
          if (!conflicto || intento === 1) throw error;
        }
      }
      return res.status(201).json(reservacionAdmin);
    }

    const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
    let reservacion;
    for (let intento = 0; intento < 2; intento += 1) {
      try {
        reservacion = await prisma.$transaction(async (tx) => {
          let cliente = await tx.cliente.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            orderBy: { id: "asc" },
          });
          if (!cliente) {
            cliente = await tx.cliente.create({
              data: { nombre, email, telefono: telefono || null, passwordHash },
            });
          } else {
            const actualizacionCliente = {};
            if (!cliente.nombre?.trim()) actualizacionCliente.nombre = nombre;
            if (!cliente.telefono?.trim() && telefono) actualizacionCliente.telefono = telefono;
            if (Object.keys(actualizacionCliente).length) {
              cliente = await tx.cliente.update({ where: { id: cliente.id }, data: actualizacionCliente });
            }
          }

          const datosReservacion = {
            nombre,
            email,
            telefono: telefono || null,
            tipoSesion,
            mensaje,
            estado: "PENDIENTE",
            clienteId: cliente.id,
          };
          if (fecha) datosReservacion.fecha = fecha;

          return tx.reservacion.create({
            data: datosReservacion,
            include: includeCliente,
          });
        }, { isolationLevel: "Serializable" });
        break;
      } catch (error) {
        const esConflictoConcurrente = error?.code === "P2002" || error?.code === "P2034";
        if (!esConflictoConcurrente || intento === 1) throw error;
      }
    }
    return res.status(201).json(reservacion);
  } catch (error) {
    return reportControllerError(res, "crear la reservación", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const claves = Object.keys(req.body);
  const camposEstado = ["estado"];
  const camposPago = ["estadoPago"];
  const camposEdicion = fields;
  const grupo = claves.some((campo) => camposEstado.includes(campo))
    ? camposEstado
    : claves.some((campo) => camposPago.includes(campo))
      ? camposPago
      : camposEdicion;
  if (claves.some((campo) => !grupo.includes(campo))) {
    return res.status(400).json({ error: "Actualiza un solo grupo de campos por solicitud." });
  }
  const data = pickDefined(req.body, grupo);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (grupo === camposEstado) {
    if (!new Set(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA", "COMPLETADA"]).has(data.estado)) {
      return res.status(400).json({ error: "estado no es válido." });
    }
    if (data.estado === "CANCELADA") {
      try {
        const result = await prisma.reservacion.updateMany({ where: { id, estado: { not: "CANCELADA" } }, data });
        if (!result.count) {
          const existente = await prisma.reservacion.findUnique({ where: { id }, select: { id: true } });
          return existente
            ? res.status(409).json({ error: "La reservación ya está cancelada." })
            : res.status(404).json({ error: "Reservación no encontrada." });
        }
        return res.json(await prisma.reservacion.findUnique({ where: { id }, include: includeCliente }));
      } catch (error) {
        return reportControllerError(res, "cancelar la reservación", error);
      }
    }
  }
  if (grupo === camposPago && !new Set(["PENDIENTE", "PAGADO"]).has(data.estadoPago)) {
    return res.status(400).json({ error: "estadoPago debe ser PENDIENTE o PAGADO." });
  }
  if (data.tipoSesion !== undefined && (typeof data.tipoSesion !== "string" || !data.tipoSesion.trim())) {
    return res.status(400).json({ error: "tipoSesion debe ser una cadena no vacía." });
  }
  if (data.fecha !== undefined && data.fecha !== null && data.fecha !== "") {
    data.fecha = new Date(data.fecha);
    if (Number.isNaN(data.fecha.getTime())) return res.status(400).json({ error: "fecha debe ser una fecha válida." });
  } else if (data.fecha === "") {
    data.fecha = null;
  }
  if (data.hora !== undefined && data.hora !== null && typeof data.hora !== "string") {
    return res.status(400).json({ error: "hora debe ser una cadena o nula." });
  }
  try {
    const result = await prisma.reservacion.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.json(await prisma.reservacion.findUnique({ where: { id }, include: includeCliente }));
  } catch (error) {
    return reportControllerError(res, "actualizar la reservación", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.reservacion.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Reservación no encontrada." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar la reservación", error);
  }
};

export default { list, getById, create, update, remove };
