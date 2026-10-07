import { Router } from "express";
import adminAuthController from "../controllers/adminAuthController.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión como administrador
 *     description: Verifica las credenciales administrativas configuradas en el entorno y devuelve un token Bearer válido por ocho horas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Credenciales correctas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       400:
 *         description: Faltan credenciales.
 *       401:
 *         description: Correo o contraseña incorrectos.
 *       500:
 *         description: La autenticación no está configurada o se produjo un error interno.
 */
router.post("/login", adminAuthController.login);

export default router;
