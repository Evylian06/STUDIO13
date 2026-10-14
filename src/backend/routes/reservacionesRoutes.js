import { Router } from "express";
import reservacionController from "../controllers/reservacionController.js";
import { getSigningSecret, verifyAdminToken } from "../auth/adminToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

const allowPublicOrAdminCreate = (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization) return next();
  const match = authorization.match(/^Bearer ([^\s]+)$/i);
  const secret = getSigningSecret();
  const admin = match && secret ? verifyAdminToken(match[1], secret) : null;
  if (!admin) return res.status(401).json({ error: "La sesión administrativa no es válida." });
  req.admin = admin;
  return next();
};

/**
 * @swagger
 * /api/reservaciones:
 *   post:
 *     tags: [Reservaciones]
 *     summary: Crear una reservación
 *     description: Las solicitudes públicas crean o reutilizan el cliente por correo y quedan PENDIENTE. Una solicitud con token administrativo válido usa un cliente existente y queda CONFIRMADA.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservacionActualizacion'
 *             required: [nombre, email, tipoSesion]
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
 *                 nullable: true
 *               hora:
 *                 type: string
 *               mensaje:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservación creada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservacion'
 *       400:
 *         description: Datos o estado inválidos.
 */
router.post("/", allowPublicOrAdminCreate, reservacionController.create);
/**
 * @swagger
 * /api/reservaciones:
 *   get:
 *     tags: [Reservaciones]
 *     summary: Listar reservaciones
 *     description: Incluye el cliente asociado. Requiere autenticación administrativa.
 *     responses:
 *       200:
 *         description: Lista de reservaciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservacion'
 */
router.get("/", requireAdmin, reservacionController.list);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   get:
 *     tags: [Reservaciones]
 *     summary: Obtener una reservación
 *     description: Requiere autenticación administrativa.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservación encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservacion'
 *       404:
 *         description: Reservación no encontrada.
 */
router.get("/:id", requireAdmin, reservacionController.getById);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   patch:
 *     tags: [Reservaciones]
 *     summary: Actualizar una reservación
 *     description: Permite actualizar por separado los datos de agenda, el estado de la reservación o el estado del pago. Requiere autenticación administrativa.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservacion'
 *       404:
 *         description: Reservación no encontrada.
 */
router.patch("/:id", requireAdmin, reservacionController.update);
/**
 * @swagger
 * /api/reservaciones/{id}:
 *   delete:
 *     tags: [Reservaciones]
 *     summary: Eliminar una reservación
 *     description: Requiere autenticación administrativa.
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
router.delete("/:id", requireAdmin, reservacionController.remove);

export default router;
