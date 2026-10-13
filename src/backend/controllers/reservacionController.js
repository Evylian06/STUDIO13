import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const states = new Set(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"]);
const fields = [
  "nombre",
  "email",
  "telefono",
  "tipoSesion",
  "fecha",
  "hora",
  "mensaje",
  "estado",
  "clienteId",
];
const requiredFields = ["nombre", "email", "tipoSesion"];
const includeCliente = { cliente: { select: { id: true, nombre: true, email: true } } };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validPayload = (data, requireAll = false) =>
  Object.keys(data).length > 0 &&
  (!requireAll || requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== ""));

const normalizeClientId = (data) => {
  if (!Object.hasOwn(data, "clienteId") || data.clienteId === null) return true;
  const id = parseId(data.clienteId);
  if (!id) return false;
  data.clienteId = id;
  return true;
};

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
  const data = pickDefined(req.body, ["nombre", "email", "telefono", "tipoSesion", "fecha", "hora", "mensaje"]);
  if (!validPayload(data, true)) {
    return res.status(400).json({ error: "nombre, email y tipoSesion son obligatorios." });
  }
  if (typeof data.nombre !== "string" || !data.nombre.trim()) {
    return res.status(400).json({ error: "nombre debe ser una cadena no vacía." });
  }
  if (typeof data.email !== "string" || !emailPattern.test(data.email.trim())) {
    return res.status(400).json({ error: "email debe ser una dirección de correo válida." });
  }
  if (typeof data.tipoSesion !== "string" || !data.tipoSesion.trim()) {
    return res.status(400).json({ error: "tipoSesion debe ser una cadena no vacía." });
  }
  if (data.telefono !== undefined && data.telefono !== null && typeof data.telefono !== "string") {
    return res.status(400).json({ error: "telefono debe ser una cadena." });
  }
  if (data.mensaje !== undefined && data.mensaje !== null && typeof data.mensaje !== "string") {
    return res.status(400).json({ error: "mensaje debe ser una cadena." });
  }

  const email = data.email.trim().toLowerCase();
  const nombre = data.nombre.trim();
  const telefono = typeof data.telefono === "string" ? data.telefono.trim() : "";
  const tipoSesion = data.tipoSesion.trim();
  const mensaje = typeof data.mensaje === "string" ? data.mensaje.trim() : null;
  let fecha = null;
  if (data.fecha !== undefined && data.fecha !== null && data.fecha !== "") {
    fecha = new Date(data.fecha);
    if (Number.isNaN(fecha.getTime())) return res.status(400).json({ error: "fecha debe ser una fecha válida." });
  }

  try {
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
  const data = pickDefined(req.body, fields);
  if (!validPayload(data)) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  if (!normalizeClientId(data)) return res.status(400).json({ error: "clienteId debe ser nulo o un entero positivo." });
  if (data.estado !== undefined && !states.has(data.estado)) {
    return res.status(400).json({ error: "estado no es válido." });
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
