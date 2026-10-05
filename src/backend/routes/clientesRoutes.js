import { Router } from "express";
import clienteController from "../controllers/clienteController.js";

const router = Router();

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Registrar un cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteRegistro'
 *     responses:
 *       201:
 *         description: Cliente registrado. No devuelve el hash de contraseña.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos.
 */
router.post("/", clienteController.create);
/**
 * @swagger
 * /api/clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar clientes
 *     description: Devuelve datos de clientes sin hashes de contraseña. El acceso no está protegido actualmente.
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get("/", clienteController.list);
/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtener un cliente
 *     description: Devuelve datos sin el hash de contraseña. El acceso no está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado.
 */
router.get("/:id", clienteController.getById);
/**
 * @swagger
 * /api/clientes/{id}:
 *   patch:
 *     tags: [Clientes]
 *     summary: Actualizar un cliente
 *     description: Acepta nombre, email, teléfono y opcionalmente password. No está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteActualizacion'
 *     responses:
 *       200:
 *         description: Cliente actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado.
 */
router.patch("/:id", clienteController.update);
/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar un cliente
 *     description: No está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cliente eliminado.
 *       404:
 *         description: Cliente no encontrado.
 */
router.delete("/:id", clienteController.remove);

export default router;
