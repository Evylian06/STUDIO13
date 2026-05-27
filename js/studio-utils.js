/**
 * Utilidades compartidas del sitio (evita duplicar lógica entre módulos).
 */
(function () {
  "use strict";

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function normalizeText(text) {
    return String(text == null ? "" : text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  window.StudioUtils = {
    escapeHtml: escapeHtml,
    normalizeText: normalizeText,
  };
})();
