import { Router } from "express";
import galeriaController from "../controllers/galeriaController.js";
import imagenController from "../controllers/imagenController.js";
import paqueteController from "../controllers/paqueteController.js";
import planMembresiaController from "../controllers/planMembresiaController.js";
import servicioController from "../controllers/servicioController.js";

const router = Router();

/**
 * @swagger
 * /api/admin/imagenes:
 *   post:
 *     tags: [Administración]
 *     summary: Crear una imagen
 *     description: Crea un registro de imagen. No carga archivos; recibe sus metadatos y URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, url, seccion]
 *             properties:
 *               nombre:
 *                 type: string
 *               url:
 *                 type: string
 *               seccion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               publicId:
 *                 type: string
 *               orden:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Imagen creada.
 *       400:
 *         description: Datos inválidos.
 */
router.post("/imagenes", imagenController.create);
/**
 * @swagger
 * /api/admin/imagenes/{id}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar una imagen
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
 *         description: Imagen actualizada.
 *       404:
 *         description: Imagen no encontrada.
 */
router.patch("/imagenes/:id", imagenController.update);
/**
 * @swagger
 * /api/admin/imagenes/{id}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar una imagen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Imagen eliminada.
 *       404:
 *         description: Imagen no encontrada.
 */
router.delete("/imagenes/:id", imagenController.remove);

/**
 * @swagger
 * /api/admin/galerias:
 *   post:
 *     tags: [Administración]
 *     summary: Crear una galería
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, slug]
 *             properties:
 *               nombre:
 *                 type: string
 *               slug:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               orden:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Galería creada.
 *       400:
 *         description: Datos inválidos.
 */
router.post("/galerias", galeriaController.create);
/**
 * @swagger
 * /api/admin/galerias/{id}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar una galería
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
 *         description: Galería actualizada.
 *       404:
 *         description: Galería no encontrada.
 */
router.patch("/galerias/:id", galeriaController.update);
/**
 * @swagger
 * /api/admin/galerias/{id}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar una galería
 *     description: También elimina sus imágenes relacionadas por la cascada definida en Prisma.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Galería eliminada.
 *       404:
 *         description: Galería no encontrada.
 */
router.delete("/galerias/:id", galeriaController.remove);
/**
 * @swagger
 * /api/admin/galerias/{id}/imagenes:
 *   post:
 *     tags: [Administración]
 *     summary: Añadir una imagen a una galería
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
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               publicId:
 *                 type: string
 *               orden:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Imagen agregada.
 *       404:
 *         description: Galería no encontrada.
 */
router.post("/galerias/:id/imagenes", galeriaController.addImage);
/**
 * @swagger
 * /api/admin/galerias/{id}/imagenes/{imagenId}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar una imagen de galería
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imagenId
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
 *         description: Imagen actualizada.
 *       404:
 *         description: Imagen de galería no encontrada.
 */
router.patch("/galerias/:id/imagenes/:imagenId", galeriaController.updateImage);
/**
 * @swagger
 * /api/admin/galerias/{id}/imagenes/{imagenId}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar una imagen de galería
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imagenId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Imagen de galería eliminada.
 *       404:
 *         description: Imagen de galería no encontrada.
 */
router.delete("/galerias/:id/imagenes/:imagenId", galeriaController.removeImage);

/**
 * @swagger
 * /api/admin/servicios:
 *   post:
 *     tags: [Administración]
 *     summary: Crear un servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagenUrl:
 *                 type: string
 *               publicId:
 *                 type: string
 *               orden:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Servicio creado.
 */
router.post("/servicios", servicioController.create);
/**
 * @swagger
 * /api/admin/servicios/{id}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar un servicio
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
 *         description: Servicio actualizado.
 *       404:
 *         description: Servicio no encontrado.
 */
router.patch("/servicios/:id", servicioController.update);
/**
 * @swagger
 * /api/admin/servicios/{id}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar un servicio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Servicio eliminado.
 *       404:
 *         description: Servicio no encontrado.
 */
router.delete("/servicios/:id", servicioController.remove);

/**
 * @swagger
 * /api/admin/paquetes:
 *   post:
 *     tags: [Administración]
 *     summary: Crear un paquete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagenUrl:
 *                 type: string
 *               publicId:
 *                 type: string
 *               orden:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Paquete creado.
 */
router.post("/paquetes", paqueteController.create);
/**
 * @swagger
 * /api/admin/paquetes/{id}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar un paquete
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
 *         description: Paquete actualizado.
 *       404:
 *         description: Paquete no encontrado.
 */
router.patch("/paquetes/:id", paqueteController.update);
/**
 * @swagger
 * /api/admin/paquetes/{id}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar un paquete
 *     description: También elimina sus características relacionadas por la cascada definida en Prisma.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Paquete eliminado.
 *       404:
 *         description: Paquete no encontrado.
 */
router.delete("/paquetes/:id", paqueteController.remove);
/**
 * @swagger
 * /api/admin/paquetes/{id}/caracteristicas:
 *   post:
 *     tags: [Administración]
 *     summary: Añadir una característica a un paquete
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
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Característica agregada.
 *       404:
 *         description: Paquete no encontrado.
 */
router.post("/paquetes/:id/caracteristicas", paqueteController.addCharacteristic);
/**
 * @swagger
 * /api/admin/paquetes/{id}/caracteristicas/{caracteristicaId}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar una característica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: caracteristicaId
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
 *         description: Característica actualizada.
 *       404:
 *         description: Característica no encontrada.
 */
router.patch(
  "/paquetes/:id/caracteristicas/:caracteristicaId",
  paqueteController.updateCharacteristic,
);
/**
 * @swagger
 * /api/admin/paquetes/{id}/caracteristicas/{caracteristicaId}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar una característica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: caracteristicaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Característica eliminada.
 *       404:
 *         description: Característica no encontrada.
 */
router.delete(
  "/paquetes/:id/caracteristicas/:caracteristicaId",
  paqueteController.removeCharacteristic,
);

/**
 * @swagger
 * /api/admin/planes-membresia:
 *   post:
 *     tags: [Administración]
 *     summary: Crear un plan de membresía
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, precio, duracionDias]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               duracionDias:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *               orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Plan creado.
 */
router.post("/planes-membresia", planMembresiaController.create);
/**
 * @swagger
 * /api/admin/planes-membresia/{id}:
 *   patch:
 *     tags: [Administración]
 *     summary: Actualizar un plan de membresía
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
 *         description: Plan actualizado.
 *       404:
 *         description: Plan no encontrado.
 */
router.patch("/planes-membresia/:id", planMembresiaController.update);
/**
 * @swagger
 * /api/admin/planes-membresia/{id}:
 *   delete:
 *     tags: [Administración]
 *     summary: Eliminar un plan de membresía
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Plan eliminado.
 *       404:
 *         description: Plan no encontrado.
 */
router.delete("/planes-membresia/:id", planMembresiaController.remove);

export default router;
