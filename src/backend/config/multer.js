import { extname } from "node:path";
import multer from "multer";

const allowedMimeTypesByExtension = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

const fileFilter = (_req, file, callback) => {
  const extension = extname(file.originalname).toLowerCase();

  if (allowedMimeTypesByExtension.get(extension) === file.mimetype) {
    callback(null, true);
    return;
  }

  const error = new Error("Formato no permitido. Solo se aceptan JPG, JPEG, PNG y WEBP.");
  error.status = 400;
  callback(error);
};

const createUpload = (fileSize) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize },
  fileFilter,
});

const upload = createUpload(5 * 1024 * 1024);
export const uploadGallery = createUpload(30 * 1024 * 1024);

export default upload;
