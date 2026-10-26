import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

const backendDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
export const uploadsDirectory = join(backendDirectory, "uploads");
const publicidadDirectory = join(uploadsDirectory, "publicidad");
const cloudinaryConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const subirACloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder: "studio13/publicidad", resource_type: "image" }, (error, result) => {
    if (error) reject(error);
    else resolve({ secure_url: result.secure_url, public_id: result.public_id });
  });
  stream.end(buffer);
});

export const uploadImage = async (buffer, originalname) => {
  if (cloudinaryConfigured) return subirACloudinary(buffer);

  const extension = extname(originalname).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  await mkdir(publicidadDirectory, { recursive: true });
  await writeFile(join(publicidadDirectory, filename), buffer, { flag: "wx" });
  return { secure_url: `/uploads/publicidad/${filename}`, public_id: `local:${filename}` };
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith("local:")) {
    const filename = publicId.slice("local:".length);
    if (filename !== filename.split(/[\\/]/).pop()) return;
    await rm(join(publicidadDirectory, filename), { force: true });
    return;
  }
  if (cloudinaryConfigured) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
