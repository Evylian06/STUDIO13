import { Router } from "express";
import membresiaController from "../controllers/membresiaController.js";

const router = Router();

/**
 * @swagger
 * /api/membresias:
 *   get:
 *     tags: [Membresías]
 *     summary: Listar membresías
 *     description: Incluye el cliente (sin contraseña) y el plan de cada membresía. El acceso no está protegido actualmente.
 *     responses:
 *       200:
 *         description: Lista de membresías.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Membresia'
 */
router.get("/", membresiaController.list);
/**
 * @swagger
 * /api/membresias:
 *   post:
 *     tags: [Membresías]
 *     summary: Crear una membresía
 *     description: El plan y el cliente deben existir. El estado puede ser ACTIVA, VENCIDA o CANCELADA.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembresiaActualizacion'
 *             required: [fechaFin, clienteId, planId]
 *             properties:
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *                 enum: [ACTIVA, VENCIDA, CANCELADA]
 *               clienteId:
 *                 type: integer
 *               planId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Membresía creada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membresia'
 *       400:
 *         description: Datos o estado inválidos.
 */
router.post("/", membresiaController.create);
/**
 * @swagger
 * /api/membresias/{id}:
 *   get:
 *     tags: [Membresías]
 *     summary: Obtener una membresía
 *     description: El acceso no está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membresía encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membresia'
 *       404:
 *         description: Membresía no encontrada.
 */
router.get("/:id", membresiaController.getById);
/**
 * @swagger
 * /api/membresias/{id}:
 *   patch:
 *     tags: [Membresías]
 *     summary: Actualizar una membresía
 *     description: El estado permitido es ACTIVA, VENCIDA o CANCELADA. El acceso no está protegido actualmente.
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
 *             type: object
 *     responses:
 *       200:
 *         description: Membresía actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membresia'
 *       404:
 *         description: Membresía no encontrada.
 */
router.patch("/:id", membresiaController.update);
/**
 * @swagger
 * /api/membresias/{id}:
 *   delete:
 *     tags: [Membresías]
 *     summary: Eliminar una membresía
 *     description: El acceso no está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membresía eliminada.
 *       404:
 *         description: Membresía no encontrada.
 */
router.delete("/:id", membresiaController.remove);

export default router;
