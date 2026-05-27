/**
 * Categorías unificadas — Studio 13 y Colorimetría Amazónica.
 * Usado por el panel admin, filtros públicos y galerías dinámicas.
 */
(function () {
  "use strict";

  window.STUDIO_CATEGORIES = {
    studio13: [
      { value: "retrato", label: "Retrato" },
      { value: "social", label: "Social" },
      { value: "evento", label: "Eventos" },
      { value: "arte", label: "Arte" },
      { value: "creativa", label: "Creativa" },
    ],
    colorimetria: [
      { value: "pintura", label: "Pintura" },
      { value: "dibujo", label: "Dibujo" },
      { value: "mixta", label: "Técnica mixta" },
      { value: "general", label: "General" },
    ],
    portfolioFilters: [
      { value: "all", label: "Todo" },
      { value: "retrato", label: "Retrato" },
      { value: "social", label: "Social" },
      { value: "evento", label: "Eventos" },
      { value: "arte", label: "Arte" },
    ],
    colorimetriaFilters: [
      { value: "all", label: "Todos" },
      { value: "pintura", label: "Pintura" },
      { value: "dibujo", label: "Dibujo" },
      { value: "mixta", label: "Técnica mixta" },
      { value: "general", label: "General" },
    ],
  };

  /** Arte agrupa también piezas con categoría creativa en el portafolio del inicio. */
  window.STUDIO_CATEGORY_MATCH = function (filterValue, itemCategory) {
    if (!filterValue || filterValue === "all") return true;
    if (filterValue === itemCategory) return true;
    if (filterValue === "arte" && itemCategory === "creativa") return true;
    return false;
  };
})();
