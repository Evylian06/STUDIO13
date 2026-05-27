/**
 * Studio 13 — Páginas secundarias (fotografía, etc.)
 * Contacto, navegación y filtros de galería SOLO en fotografia.html.
 */
(function () {
  "use strict";

  const config = window.STUDIO_CONFIG;
  if (!config) return;

  const nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener(
      "scroll",
      function () {
        nav.classList.toggle("scrolled", window.scrollY > 12);
      },
      { passive: true }
    );
  }

  const whatsappUrl = "https://wa.me/" + config.whatsapp;

  document.querySelectorAll("[data-contact]").forEach(function (el) {
    const type = el.getAttribute("data-contact");
    switch (type) {
      case "phone":
        el.textContent = config.phone;
        break;
      case "email":
        el.textContent = config.email;
        if (el.tagName === "A") el.href = "mailto:" + config.email;
        break;
      case "address":
        el.textContent = config.address;
        break;
      case "whatsapp-link":
        el.href = whatsappUrl;
        el.textContent = config.phone;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        break;
      case "whatsapp":
        el.href = whatsappUrl;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        break;
      case "schedule-weekdays":
        el.textContent = config.schedule.weekdays;
        break;
      case "schedule-saturday":
        el.textContent = config.schedule.saturday;
        break;
      default:
        break;
    }
  });

  document.querySelectorAll("[data-social]").forEach(function (el) {
    const network = el.getAttribute("data-social");
    const url = config.social[network];
    if (url) {
      el.href = url;
    } else {
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
      el.removeAttribute("href");
    }
  });

  /* —— Filtros solo en página de fotografías —— */
  if (!document.body.classList.contains("photo-page")) return;

  const filterButtons = document.querySelectorAll("[data-photo-filter]");
  const sections = document.querySelectorAll(".photo-section[data-photo-category]");

  if (!filterButtons.length || !sections.length) return;

  function applyPhotoFilter(filter) {
    sections.forEach(function (section) {
      const cat = section.getAttribute("data-photo-category");
      const show = filter === "all" || cat === filter;
      section.hidden = !show;
      section.classList.toggle("is-filter-hidden", !show);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      const filter = button.getAttribute("data-photo-filter");
      applyPhotoFilter(filter);

      const target = document.getElementById("galeria-fotos");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
