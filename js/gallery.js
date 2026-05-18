/**
 * Carga obras desde data/gallery.json (preparado para el panel admin).
 */
(function () {
  "use strict";

  const grid = document.getElementById("colorimetria-gallery-grid");
  if (!grid) return;

  fetch("data/gallery.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar la galería");
      return res.json();
    })
    .then((data) => {
      const items = data.colorimetria && data.colorimetria.galeria;
      if (!items || !items.length) return;

      grid.innerHTML = items
        .map(
          (item) => `
        <article class="item-card">
          <img src="${item.src}" alt="${item.alt}" loading="lazy" width="500" height="320">
          <div class="item-info">
            <strong>Título: ${item.title}</strong><br>
            Técnica: ${item.technique}<br>
            Artista: ${item.artist}
          </div>
        </article>`
        )
        .join("");
    })
    .catch(() => {
      /* El HTML estático sirve como respaldo si fetch falla (p. ej. file://) */
    });
})();
