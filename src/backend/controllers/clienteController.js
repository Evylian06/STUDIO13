import bcrypt from "bcrypt";
import prisma from "../config/databases.js";
import {
  isObjectBody,
  parseId,
  pickDefined,
  reportControllerError,
} from "./_shared.js";

const fields = ["nombre", "email", "telefono"];
const safeSelect = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  createdAt: true,
  updatedAt: true,
};

const list = async (_req, res) => {
  try {
    return res.json(await prisma.cliente.findMany({ select: safeSelect, orderBy: { id: "asc" } }));
  } catch (error) {
    return reportControllerError(res, "obtener los clientes", error);
  }
};

const getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id }, select: safeSelect });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });
    return res.json(cliente);
  } catch (error) {
    return reportControllerError(res, "obtener el cliente", error);
  }
};

const create = async (req, res) => {
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (
    typeof data.nombre !== "string" ||
    !data.nombre.trim() ||
    typeof data.email !== "string" ||
    !data.email.trim() ||
    typeof req.body.password !== "string" ||
    !req.body.password
  ) {
    return res.status(400).json({ error: "nombre, email y password son obligatorios." });
  }

  try {
    const cliente = await prisma.cliente.create({
      data: { ...data, passwordHash: await bcrypt.hash(req.body.password, 12) },
      select: safeSelect,
    });
    return res.status(201).json(cliente);
  } catch (error) {
    return reportControllerError(res, "crear el cliente", error);
  }
};

const update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  if (!isObjectBody(req.body)) return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
  const data = pickDefined(req.body, fields);
  if (Object.hasOwn(req.body, "password")) {
    if (typeof req.body.password !== "string" || !req.body.password) {
      return res.status(400).json({ error: "password debe ser una cadena no vacía." });
    }
  }
  if (!Object.keys(data).length) return res.status(400).json({ error: "No hay campos válidos para actualizar." });

  try {
    if (Object.hasOwn(req.body, "password")) {
      data.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    const result = await prisma.cliente.updateMany({ where: { id }, data });
    if (!result.count) return res.status(404).json({ error: "Cliente no encontrado." });
    return res.json(await prisma.cliente.findUnique({ where: { id }, select: safeSelect }));
  } catch (error) {
    return reportControllerError(res, "actualizar el cliente", error);
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "El id debe ser un entero positivo." });
  try {
    const result = await prisma.cliente.deleteMany({ where: { id } });
    if (!result.count) return res.status(404).json({ error: "Cliente no encontrado." });
    return res.status(204).end();
  } catch (error) {
    return reportControllerError(res, "eliminar el cliente", error);
  }
};

export default { list, getById, create, update, remove };
