(function () {
  "use strict";

  const config = window.STUDIO_CONFIG;
  if (!config) return;

  /* —— Barra de navegación al hacer scroll —— */
  const nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("scrolled", window.scrollY > 0);
      },
      { passive: true }
    );
  }

  /* —— Enlaces de contacto desde config —— */
  const whatsappUrl = "https://wa.me/" + config.whatsapp;

  document.querySelectorAll("[data-contact]").forEach((el) => {
    const type = el.getAttribute("data-contact");
    switch (type) {
      case "phone":
        el.textContent = config.phone;
        break;
      case "email":
        el.textContent = config.email;
        if (el.tagName === "A") {
          el.href = "mailto:" + config.email;
        }
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

  document.querySelectorAll("[data-social]").forEach((el) => {
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

  /* —— Filtros del portafolio (solo en index) —— */
  const filterButtons = document.querySelectorAll("[data-filter]");

  if (filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        const filter = button.dataset.filter;
        const galleryCards = document.querySelectorAll(".grid .card");

        galleryCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.hidden = !show;
        });

        const portafolio = document.querySelector("#portafolio");
        if (portafolio) {
          portafolio.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

})();
