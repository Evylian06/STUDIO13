import cors from "cors";
import express from "express";
import { uploadsDirectory } from "./config/imageStorage.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import env from "./config/env.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const allowedOrigins = env.CORS_ORIGINS.length ? env.CORS_ORIGINS : ["http://localhost:3000", "http://localhost:3002"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use("/uploads", express.static(uploadsDirectory));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.json({ message: "Studio13 backend is running." });
});

const startServer = async () => {
  try {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("PORT debe ser un número entero entre 1 y 65535.");
    }

    const [
      { default: publicRoutes },
      { default: adminRoutes },
      { default: clientesRoutes },
      { default: membresiasRoutes },
      { default: reservacionesRoutes },
      { default: authRoutes },
      { default: requireAdmin },
      { default: requireRole },
      { ADMIN_ROLES },
      { default: technicalRoutes },
    ] = await Promise.all([
      import("./routes/publicRoutes.js"),
      import("./routes/adminRoutes.js"),
      import("./routes/clientesRoutes.js"),
      import("./routes/membresiasRoutes.js"),
      import("./routes/reservacionesRoutes.js"),
      import("./routes/authRoutes.js"),
      import("./middleware/requireAdmin.js"),
      import("./middleware/requireRole.js"),
      import("./auth/adminRoles.js"),
      import("./routes/technicalRoutes.js"),
    ]);

    app.use("/api/auth", authRoutes);
    app.use("/api", publicRoutes);
    app.use("/api/admin", requireAdmin, requireRole(ADMIN_ROLES.OWNER), adminRoutes);
    app.use("/api/tecnico", requireAdmin, technicalRoutes);
    app.use("/api/clientes", clientesRoutes);
    app.use("/api/membresias", membresiasRoutes);
    app.use("/api/reservaciones", reservacionesRoutes);

    app.use((error, req, res, next) => {
      if (res.headersSent) return next(error);
      console.error("[error de solicitud]", error);

      if (error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE") {
        const limite = req.originalUrl.includes("/imagenes") ? "30 MB para imágenes de galería" : "5 MB";
        return res.status(413).json({ error: `El archivo supera el límite de ${limite}.` });
      }
      if (error.name === "MulterError") {
        return res.status(400).json({ error: error.message || "La carga del archivo no es válida." });
      }

      const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
      return res.status(status).json({ error: error.message || "Ocurrió un error interno al procesar la solicitud." });
    });

    const server = app.listen(port, () => {
      console.log(`Studio13 backend escuchando en http://localhost:${port}`);
      console.log(`Documentación Swagger disponible en http://localhost:${port}/api-docs`);
    });

    server.on("error", (error) => {
      console.error("No se pudo iniciar el servidor de Studio13:", error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("No se pudo iniciar el backend de Studio13:", error);
    process.exitCode = 1;
  }
};

startServer();
