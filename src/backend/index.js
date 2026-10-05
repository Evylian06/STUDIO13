import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    ] = await Promise.all([
      import("./routes/publicRoutes.js"),
      import("./routes/adminRoutes.js"),
      import("./routes/clientesRoutes.js"),
      import("./routes/membresiasRoutes.js"),
      import("./routes/reservacionesRoutes.js"),
    ]);

    app.use("/api", publicRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/clientes", clientesRoutes);
    app.use("/api/membresias", membresiasRoutes);
    app.use("/api/reservaciones", reservacionesRoutes);

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