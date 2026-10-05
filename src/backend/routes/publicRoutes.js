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
 *     tags: [Contenido público]
 *     summary: Listar imágenes
 *     description: Devuelve las imágenes registradas ordenadas por orden e id.
 *     responses:
 *       200:
 *         description: Lista de imágenes.
 */
router.get("/imagenes", imagenController.list);
/**
 * @swagger
 * /api/imagenes/{id}:
 *   get:
 *     tags: [Contenido público]
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
 *       404:
 *         description: Imagen no encontrada.
 */
router.get("/imagenes/:id", imagenController.getById);

/**
 * @swagger
 * /api/galerias:
 *   get:
 *     tags: [Contenido público]
 *     summary: Listar galerías
 *     description: Incluye las imágenes asociadas a cada galería.
 *     responses:
 *       200:
 *         description: Lista de galerías.
 */
router.get("/galerias", galeriaController.list);
/**
 * @swagger
 * /api/galerias/{id}:
 *   get:
 *     tags: [Contenido público]
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
 *       404:
 *         description: Galería no encontrada.
 */
router.get("/galerias/:id", galeriaController.getById);

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     tags: [Contenido público]
 *     summary: Listar servicios
 *     responses:
 *       200:
 *         description: Lista de servicios.
 */
router.get("/servicios", servicioController.list);
/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     tags: [Contenido público]
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
 *       404:
 *         description: Servicio no encontrado.
 */
router.get("/servicios/:id", servicioController.getById);

/**
 * @swagger
 * /api/paquetes:
 *   get:
 *     tags: [Contenido público]
 *     summary: Listar paquetes
 *     description: Incluye las características asociadas a cada paquete.
 *     responses:
 *       200:
 *         description: Lista de paquetes.
 */
router.get("/paquetes", paqueteController.list);
/**
 * @swagger
 * /api/paquetes/{id}:
 *   get:
 *     tags: [Contenido público]
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
 *       404:
 *         description: Paquete no encontrado.
 */
router.get("/paquetes/:id", paqueteController.getById);

/**
 * @swagger
 * /api/planes-membresia:
 *   get:
 *     tags: [Membresías]
 *     summary: Listar planes de membresía
 *     responses:
 *       200:
 *         description: Lista de planes.
 */
router.get("/planes-membresia", planMembresiaController.list);
/**
 * @swagger
 * /api/planes-membresia/{id}:
 *   get:
 *     tags: [Membresías]
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
 *       404:
 *         description: Plan no encontrado.
 */
router.get("/planes-membresia/:id", planMembresiaController.getById);

export default router;
