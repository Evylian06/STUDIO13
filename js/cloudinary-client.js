(function () {
  "use strict";

  function isConfigured() {
    return Boolean(
      window.CLOUDINARY_CLOUD_NAME && window.CLOUDINARY_UPLOAD_PRESET
    );
  }

  /**
   * Inserta transformaciones f_auto, q_auto y ancho opcional en URLs de Cloudinary.
   */
  function optimizeUrl(url, options) {
    if (!url || url.indexOf("res.cloudinary.com") === -1) {
      return url || "";
    }

    const width = options && options.width;
    const parts = ["f_auto", "q_auto"];
    if (width) {
      parts.push("w_" + width);
    }

    const token = parts.join(",");

    if (url.indexOf("/upload/") === -1) {
      return url;
    }

    if (url.indexOf("/upload/" + token + "/") !== -1) {
      return url;
    }

    return url.replace("/upload/", "/upload/" + token + "/");
  }

  function uploadImage(file, section) {
    if (!isConfigured()) {
      return Promise.reject(
        new Error("Configura Cloudinary en js/cloudinary-config.js")
      );
    }

    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      return Promise.reject(new Error("Selecciona un archivo de imagen válido."));
    }

    if (file.size > 12 * 1024 * 1024) {
      return Promise.reject(
        new Error("La imagen es muy pesada. Máximo 12 MB (usa JPG/WebP optimizado).")
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", window.CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "studio13/" + section);

    const endpoint =
      "https://api.cloudinary.com/v1_1/" +
      window.CLOUDINARY_CLOUD_NAME +
      "/image/upload";

    return fetch(endpoint, { method: "POST", body: formData })
      .then(function (res) {
        return res.json().then(function (body) {
          if (!res.ok) {
            throw new Error(
              (body && body.error && body.error.message) ||
                "No se pudo subir la imagen a Cloudinary."
            );
          }
          return {
            url: optimizeUrl(body.secure_url, { width: 1200 }),
            publicId: body.public_id,
          };
        });
      });
  }

  function deleteImage(publicId) {
    if (!publicId) {
      return Promise.resolve();
    }

    const supabase = window.getSupabaseClient && window.getSupabaseClient();
    if (!supabase) {
      return Promise.resolve();
    }

    return supabase.functions
      .invoke("delete-cloudinary-image", {
        body: { public_id: publicId },
      })
      .then(function (result) {
        if (result.error) {
          console.warn("[Studio13] Cloudinary delete:", result.error.message);
        }
      })
      .catch(function (err) {
        console.warn("[Studio13] Cloudinary delete:", err);
      });
  }

  window.CloudinaryStudio = {
    isConfigured: isConfigured,
    optimizeUrl: optimizeUrl,
    uploadImage: uploadImage,
    deleteImage: deleteImage,
  };
})();
