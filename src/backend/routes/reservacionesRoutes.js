import { Router } from "express";
import reservacionController from "../controllers/reservacionController.js";

const router = Router();

/**
 * @swagger
 * /api/reservaciones:
 *   post:
 *     tags: [Reservaciones]
 *     summary: Crear una reservación
 *     description: clienteId es opcional; estado puede ser PENDIENTE, CONFIRMADA, RECHAZADA o CANCELADA.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, tipoSesion, fecha]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               tipoSesion:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               hora:
 *                 type: string
 *               mensaje:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, CONFIRMADA, RECHAZADA, CANCELADA]
 *               clienteId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Reservación creada.
 *       400:
 *         description: Datos o estado inválidos.
 */
router.post("/", reservacionController.create);
/**
 * @swagger
 * /api/reservaciones:
 *   get:
 *     tags: [Reservaciones]
 *     summary: Listar reservaciones
 *     description: Incluye el cliente asociado si existe. El acceso no está protegido actualmente.
 *     responses:
 *       200:
 *         description: Lista de reservaciones.
 */
router.get("/", reservacionController.list);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   get:
 *     tags: [Reservaciones]
 *     summary: Obtener una reservación
 *     description: El acceso no está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservación encontrada.
 *       404:
 *         description: Reservación no encontrada.
 */
router.get("/:id", reservacionController.getById);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   patch:
 *     tags: [Reservaciones]
 *     summary: Actualizar una reservación
 *     description: El estado permitido es PENDIENTE, CONFIRMADA, RECHAZADA o CANCELADA. El acceso no está protegido actualmente.
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
 *         description: Reservación actualizada.
 *       404:
 *         description: Reservación no encontrada.
 */
router.patch("/:id", reservacionController.update);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   delete:
 *     tags: [Reservaciones]
 *     summary: Eliminar una reservación
 *     description: El acceso no está protegido actualmente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Reservación eliminada.
 *       404:
 *         description: Reservación no encontrada.
 */
router.delete("/:id", reservacionController.remove);

export default router;
