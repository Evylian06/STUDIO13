import imageCompression from "browser-image-compression";

const LIMITE_IMAGEN_BYTES = 5 * 1024 * 1024;
const EXTENSION_A_MIME = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);
const MIME_A_EXTENSION = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const normalizarMime = (mime) => mime?.toLowerCase() === "image/jpg" ? "image/jpeg" : mime?.toLowerCase();

function prepararFormato(imagen) {
  const punto = imagen.name.lastIndexOf(".");
  const extension = punto >= 0 ? imagen.name.slice(punto).toLowerCase() : "";
  const mimeArchivo = normalizarMime(imagen.type);
  const mimePorExtension = EXTENSION_A_MIME.get(extension);
  const mime = MIME_A_EXTENSION.has(mimeArchivo) ? mimeArchivo : mimePorExtension;

  if (!mime || (mimeArchivo && !MIME_A_EXTENSION.has(mimeArchivo))) {
    throw new Error("Formato no permitido. Selecciona una imagen JPG, JPEG, PNG o WEBP.");
  }

  const extensionFinal = mimePorExtension === mime ? extension : MIME_A_EXTENSION.get(mime);
  const nombre = `${punto >= 0 ? imagen.name.slice(0, punto) : imagen.name}${extensionFinal}`;
  const archivo = imagen.type === mime && imagen.name === nombre
    ? imagen
    : new File([imagen], nombre, { type: mime, lastModified: imagen.lastModified });

  return { archivo, mime, extension: extensionFinal };
}

function alinearNombreYMime(imagen, mimeEsperado, extensionOriginal, nombreOriginal) {
  const mimeReal = normalizarMime(imagen.type);
  if (!MIME_A_EXTENSION.has(mimeReal)) {
    throw new Error("No se pudo determinar el formato de la imagen comprimida. Vuelve a intentarlo con JPG, PNG o WEBP.");
  }

  const extension = mimeReal === mimeEsperado && EXTENSION_A_MIME.get(extensionOriginal) === mimeReal
    ? extensionOriginal
    : MIME_A_EXTENSION.get(mimeReal);
  const nombreBase = imagen.name || nombreOriginal;
  const punto = nombreBase.lastIndexOf(".");
  const nombre = `${punto >= 0 ? nombreBase.slice(0, punto) : nombreBase}${extension}`;
  return new File([imagen], nombre, { type: mimeReal, lastModified: imagen.lastModified });
}

export async function comprimirImagenParaSubida(imagen) {
  if (!imagen) return imagen;
  const nombreOriginal = imagen.name;
  const { archivo, mime, extension } = prepararFormato(imagen);
  if (archivo.size <= LIMITE_IMAGEN_BYTES) return archivo;

  const opciones = {
    maxSizeMB: 4.7,
    useWebWorker: true,
    maxIteration: 12,
    initialQuality: 0.92,
    preserveExif: true,
    fileType: mime,
  };

  let comprimida = await imageCompression(archivo, opciones);

  if (comprimida.size > LIMITE_IMAGEN_BYTES) {
    comprimida = await imageCompression(archivo, { ...opciones, maxSizeMB: 3.8, initialQuality: 0.86 });
  }

  if (comprimida.size > LIMITE_IMAGEN_BYTES) {
    throw new Error(`No se pudo reducir "${nombreOriginal}" por debajo de 5 MB. Prueba con una imagen más pequeña o de menor resolución.`);
  }

  return alinearNombreYMime(comprimida, mime, extension, nombreOriginal);
}
