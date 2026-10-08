import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Studio13 API",
      description: "API backend para el sistema de gestión y sitio web de Studio13.",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3001", description: "Servidor local" }],
    tags: [
      { name: "Autenticación", description: "Inicio de sesión para administradores." },
      { name: "Imágenes", description: "Imágenes generales organizadas por sección." },
      { name: "Galerías", description: "Galerías y sus imágenes asociadas." },
      { name: "Servicios", description: "Servicios publicados por Studio13." },
      { name: "Paquetes", description: "Paquetes y sus características asociadas." },
      { name: "Clientes", description: "Operaciones de clientes." },
      { name: "Planes de membresía", description: "Planes disponibles para membresías." },
      { name: "Membresías", description: "Membresías asociadas a clientes y planes." },
      { name: "Reservaciones", description: "Gestión de reservaciones." },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Token de sesión administrativa devuelto por /api/auth/login.",
        },
      },
      schemas: {
        ApiError: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string" },
          },
        },
        AdminUser: {
          type: "object",
          required: ["id", "name", "email", "passwordHash", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            passwordHash: { type: "string", writeOnly: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AdminLoginResponse: {
          type: "object",
          required: ["token", "admin"],
          properties: {
            token: { type: "string" },
            admin: {
              type: "object",
              required: ["name", "email", "role"],
              properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["ADMIN", "OWNER"] },
              },
            },
          },
        },
        Imagen: {
          type: "object",
          required: ["id", "nombre", "url", "seccion", "orden", "activo", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            url: { type: "string" },
            publicId: { type: "string", nullable: true },
            seccion: { type: "string" },
            descripcion: { type: "string", nullable: true },
            orden: { type: "integer", default: 0 },
            activo: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ImagenActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            url: { type: "string" },
            publicId: { type: "string", nullable: true },
            seccion: { type: "string" },
            descripcion: { type: "string", nullable: true },
            orden: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        GaleriaImagen: {
          type: "object",
          required: ["id", "url", "orden", "activo", "galeriaId", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            titulo: { type: "string", nullable: true },
            descripcion: { type: "string", nullable: true },
            url: { type: "string" },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer", default: 0 },
            activo: { type: "boolean", default: true },
            galeriaId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            galeria: { $ref: "#/components/schemas/Galeria" },
          },
        },
        Galeria: {
          type: "object",
          required: ["id", "nombre", "slug", "orden", "activo", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            slug: { type: "string" },
            descripcion: { type: "string", nullable: true },
            orden: { type: "integer", default: 0 },
            activo: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            imagenes: { type: "array", items: { $ref: "#/components/schemas/GaleriaImagen" } },
          },
        },
        GaleriaActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            slug: { type: "string" },
            descripcion: { type: "string", nullable: true },
            orden: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        GaleriaImagenActualizacion: {
          type: "object",
          properties: {
            titulo: { type: "string", nullable: true },
            descripcion: { type: "string", nullable: true },
            url: { type: "string" },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        Servicio: {
          type: "object",
          required: ["id", "nombre", "orden", "activo", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "string", nullable: true, description: "Decimal serializado como texto." },
            imagenUrl: { type: "string", nullable: true },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer", default: 0 },
            activo: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ServicioActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "number", nullable: true },
            imagenUrl: { type: "string", nullable: true },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        PaqueteCaracteristica: {
          type: "object",
          required: ["id", "nombre", "orden", "paqueteId"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            orden: { type: "integer", default: 0 },
            paqueteId: { type: "integer" },
            paquete: { $ref: "#/components/schemas/Paquete" },
          },
        },
        Paquete: {
          type: "object",
          required: ["id", "nombre", "orden", "activo", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "string", nullable: true, description: "Decimal serializado como texto." },
            imagenUrl: { type: "string", nullable: true },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer", default: 0 },
            activo: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            caracteristicas: {
              type: "array",
              items: { $ref: "#/components/schemas/PaqueteCaracteristica" },
            },
          },
        },
        PaqueteActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "number", nullable: true },
            imagenUrl: { type: "string", nullable: true },
            publicId: { type: "string", nullable: true },
            orden: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        PaqueteCaracteristicaActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            orden: { type: "integer" },
          },
        },
        Cliente: {
          type: "object",
          required: ["id", "nombre", "email", "passwordHash", "createdAt", "updatedAt"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            passwordHash: { type: "string", writeOnly: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            membresias: { type: "array", items: { $ref: "#/components/schemas/Membresia" } },
            reservaciones: { type: "array", items: { $ref: "#/components/schemas/Reservacion" } },
          },
        },
        ClienteResumen: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        ClienteRegistro: {
          type: "object",
          required: ["nombre", "email", "password"],
          properties: {
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string" },
            password: { type: "string", format: "password", writeOnly: true },
          },
        },
        ClienteActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string" },
            password: { type: "string", format: "password", writeOnly: true },
          },
        },
        PlanMembresia: {
          type: "object",
          required: [
            "id",
            "nombre",
            "precio",
            "duracionDias",
            "activo",
            "orden",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "string", description: "Decimal serializado como texto." },
            duracionDias: { type: "integer" },
            activo: { type: "boolean", default: true },
            orden: { type: "integer", default: 0 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            membresias: { type: "array", items: { $ref: "#/components/schemas/Membresia" } },
          },
        },
        PlanMembresiaActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            precio: { type: "number" },
            duracionDias: { type: "integer", minimum: 1 },
            activo: { type: "boolean" },
            orden: { type: "integer" },
          },
        },
        EstadoMembresia: {
          type: "string",
          enum: ["ACTIVA", "VENCIDA", "CANCELADA"],
        },
        Membresia: {
          type: "object",
          required: [
            "id",
            "fechaInicio",
            "fechaFin",
            "estado",
            "clienteId",
            "planId",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "integer" },
            fechaInicio: { type: "string", format: "date-time" },
            fechaFin: { type: "string", format: "date-time" },
            estado: { $ref: "#/components/schemas/EstadoMembresia" },
            clienteId: { type: "integer" },
            planId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            cliente: { $ref: "#/components/schemas/ClienteResumen" },
            plan: { $ref: "#/components/schemas/PlanMembresia" },
          },
        },
        MembresiaActualizacion: {
          type: "object",
          properties: {
            fechaInicio: { type: "string", format: "date-time" },
            fechaFin: { type: "string", format: "date-time" },
            estado: { $ref: "#/components/schemas/EstadoMembresia" },
            clienteId: { type: "integer" },
            planId: { type: "integer" },
          },
        },
        EstadoReservacion: {
          type: "string",
          enum: ["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"],
        },
        Reservacion: {
          type: "object",
          required: [
            "id",
            "nombre",
            "email",
            "tipoSesion",
            "fecha",
            "estado",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            tipoSesion: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            hora: { type: "string", nullable: true },
            mensaje: { type: "string", nullable: true },
            estado: { $ref: "#/components/schemas/EstadoReservacion" },
            clienteId: { type: "integer", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            cliente: { allOf: [{ $ref: "#/components/schemas/ClienteResumen" }], nullable: true },
          },
        },
        ReservacionActualizacion: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            tipoSesion: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            hora: { type: "string", nullable: true },
            mensaje: { type: "string", nullable: true },
            estado: { $ref: "#/components/schemas/EstadoReservacion" },
            clienteId: { type: "integer", nullable: true },
          },
        },
      },
    },
  },
  apis: [join(currentDirectory, "routes", "*.js").replaceAll("\\", "/")],
});

for (const [path, pathItem] of Object.entries(swaggerSpec.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;

    if (path.startsWith("/api/admin/")) {
      operation.security = [{ BearerAuth: [] }];
      operation.responses["401"] ??= {
        description: "Se requiere una sesión administrativa válida.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      };
    }

    const errorResponse = {
      description: "La solicitud no pudo completarse.",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    };

    if (operation.requestBody || path.includes("{")) {
      operation.responses["400"] ??= {
        ...errorResponse,
        description: "La solicitud contiene datos o parámetros inválidos.",
      };
    }
    if (path.includes("{")) {
      operation.responses["404"] ??= {
        ...errorResponse,
        description: "No se encontró el recurso solicitado.",
      };
    }
    operation.responses["500"] ??= {
      ...errorResponse,
      description: "Error interno al procesar la solicitud.",
    };
  }
}

export default swaggerSpec;
