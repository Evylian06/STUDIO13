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

  callback(new Error("Formato no permitido. Solo se aceptan JPG, JPEG, PNG y WEBP."));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;