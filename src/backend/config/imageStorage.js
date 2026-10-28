import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

const backendDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
export const uploadsDirectory = join(backendDirectory, "uploads");
const destinations = {
  anuncios: { cloudinaryFolder: "studio13/anuncios", localFolder: "anuncios" },
  galeria: { cloudinaryFolder: "studio13/Galeria", localFolder: "Galeria" },
};
const localDirectories = {
  anuncios: join(uploadsDirectory, "anuncios"),
  Galeria: join(uploadsDirectory, "Galeria"),
  publicidad: join(uploadsDirectory, "publicidad"),
};
const cloudinaryConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
const missingCloudinaryVariables = [
  ["CLOUDINARY_CLOUD_NAME", env.CLOUDINARY_CLOUD_NAME],
  ["CLOUDINARY_API_KEY", env.CLOUDINARY_API_KEY],
  ["CLOUDINARY_API_SECRET", env.CLOUDINARY_API_SECRET],
].filter(([, value]) => !value).map(([name]) => name);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
} else {
  console.error(`Cloudinary no está configurado. Faltan variables: ${missingCloudinaryVariables.join(", ")}.`);
}

const subirACloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
    if (error) reject(error);
    else resolve({ secure_url: result.secure_url, public_id: result.public_id });
  });
  stream.end(buffer);
});

export const uploadImage = async (buffer, originalname, destination = "anuncios", { requireCloudinary = false } = {}) => {
  const config = destinations[destination];
  if (!config) throw new Error("El destino de almacenamiento de imágenes no es válido.");
  if (cloudinaryConfigured) return subirACloudinary(buffer, config.cloudinaryFolder);
  if (requireCloudinary) {
    const error = new Error(`Cloudinary no está configurado. Revisa estas variables en src/backend/.env: ${missingCloudinaryVariables.join(", ")}.`);
    error.status = 503;
    throw error;
  }

  const extension = extname(originalname).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  const directory = localDirectories[config.localFolder];
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, filename), buffer, { flag: "wx" });
  return { secure_url: `/uploads/${config.localFolder}/${filename}`, public_id: `local:${config.localFolder}/${filename}` };
};

export const deleteImage = async (publicId) => {
  if (!publicId) throw new Error("No se puede eliminar una imagen sin su identificador de almacenamiento.");
  if (publicId.startsWith("local:")) {
    const localPath = publicId.slice("local:".length);
    const [folder, filename] = localPath.includes("/") ? localPath.split("/") : ["publicidad", localPath];
    const directory = localDirectories[folder];
    if (!directory || !filename || filename === "." || filename === ".." || filename !== filename.split(/[\\/]/).pop()) {
      throw new Error("El identificador del archivo local no es válido.");
    }
    await rm(join(directory, filename), { force: true });
    return;
  }
  if (!cloudinaryConfigured) throw new Error("Cloudinary no está configurado; no se pudo verificar la eliminación.");
  let result;
  try {
    result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (error) {
    // A retry after Cloudinary deleted the asset but the database failed returns 404.
    if (error.http_code !== 404) throw error;
    return;
  }
  if (result?.result !== "ok") {
    throw new Error(`Cloudinary no confirmó la eliminación del recurso (${result?.result || "sin resultado"}).`);
  }
};
