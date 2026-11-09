import { Router } from "express";
import { ADMIN_ROLES } from "../auth/adminRoles.js";
import requireRole from "../middleware/requireRole.js";
import technicalController from "../controllers/technicalController.js";

const router = Router();

/**
 * @swagger
 * /api/tecnico/diagnostico:
 *   get:
 *     tags: [Diagnóstico técnico]
 *     summary: Consultar el estado técnico básico
 *     description: Requiere sesión administrativa con rol DESARROLLADOR. Devuelve disponibilidad de servicios y presencia de configuración, nunca secretos ni datos de clientes.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estado técnico consultado.
 *       401:
 *         description: Sesión inválida.
 *       403:
 *         description: Rol sin permiso.
 */
router.get("/diagnostico", requireRole(ADMIN_ROLES.DEVELOPER), technicalController.getStatus);

export default router;
