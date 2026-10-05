import { Router } from "express";
import galeriaController from "../controllers/galeriaController.js";
import imagenController from "../controllers/imagenController.js";
import paqueteController from "../controllers/paqueteController.js";
import planMembresiaController from "../controllers/planMembresiaController.js";
import servicioController from "../controllers/servicioController.js";

const router = Router();

/**
 * @swagger
 * /api/imagenes:
 *   get:
 *     tags: [Imágenes]
 *     summary: Listar imágenes
 *     description: Devuelve las imágenes registradas ordenadas por orden e id.
 *     responses:
 *       200:
 *         description: Lista de imágenes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Imagen'
 */
router.get("/imagenes", imagenController.list);
/**
 * @swagger
 * /api/imagenes/{id}:
 *   get:
 *     tags: [Imágenes]
 *     summary: Obtener una imagen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagen encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Imagen'
 *       404:
 *         description: Imagen no encontrada.
 */
router.get("/imagenes/:id", imagenController.getById);

/**
 * @swagger
 * /api/galerias:
 *   get:
 *     tags: [Galerías]
 *     summary: Listar galerías
 *     description: Incluye las imágenes asociadas a cada galería.
 *     responses:
 *       200:
 *         description: Lista de galerías.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Galeria'
 */
router.get("/galerias", galeriaController.list);
/**
 * @swagger
 * /api/galerias/{id}:
 *   get:
 *     tags: [Galerías]
 *     summary: Obtener una galería
 *     description: Incluye las imágenes asociadas a la galería.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Galería encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Galeria'
 *       404:
 *         description: Galería no encontrada.
 */
router.get("/galerias/:id", galeriaController.getById);

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     tags: [Servicios]
 *     summary: Listar servicios
 *     responses:
 *       200:
 *         description: Lista de servicios.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Servicio'
 */
router.get("/servicios", servicioController.list);
/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     tags: [Servicios]
 *     summary: Obtener un servicio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Servicio'
 *       404:
 *         description: Servicio no encontrado.
 */
router.get("/servicios/:id", servicioController.getById);

/**
 * @swagger
 * /api/paquetes:
 *   get:
 *     tags: [Paquetes]
 *     summary: Listar paquetes
 *     description: Incluye las características asociadas a cada paquete.
 *     responses:
 *       200:
 *         description: Lista de paquetes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Paquete'
 */
router.get("/paquetes", paqueteController.list);
/**
 * @swagger
 * /api/paquetes/{id}:
 *   get:
 *     tags: [Paquetes]
 *     summary: Obtener un paquete
 *     description: Incluye las características asociadas al paquete.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paquete encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paquete'
 *       404:
 *         description: Paquete no encontrado.
 */
router.get("/paquetes/:id", paqueteController.getById);

/**
 * @swagger
 * /api/planes-membresia:
 *   get:
 *     tags: [Planes de membresía]
 *     summary: Listar planes de membresía
 *     responses:
 *       200:
 *         description: Lista de planes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanMembresia'
 */
router.get("/planes-membresia", planMembresiaController.list);
/**
 * @swagger
 * /api/planes-membresia/{id}:
 *   get:
 *     tags: [Planes de membresía]
 *     summary: Obtener un plan de membresía
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanMembresia'
 *       404:
 *         description: Plan no encontrado.
 */
router.get("/planes-membresia/:id", planMembresiaController.getById);

export default router;
