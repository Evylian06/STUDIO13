/**
 * Studio 13 premium experience:
 * - Navegacion fluida, menu movil tipo cortina y datos de contacto centralizados.
 * - Portafolio filtrable con transiciones suaves y lightbox full-screen.
 * - Formulario inteligente que abre WhatsApp con un mensaje comercial claro.
 */
(function () {
  "use strict";

  const config = window.STUDIO_CONFIG;
  if (!config) return;

  const nav = document.getElementById("nav");
  const whatsappUrl = "https://wa.me/" + config.whatsapp;
  const portfolioGrid = document.querySelector("#portafolio .grid");
  const portfolioFilters = document.querySelectorAll("[data-portfolio-filter]");
  const whatsappForm = document.getElementById("whatsapp-form");
  let activePortfolioFilter = "all";
  let filterTimer = null;

  function normalizeCategory(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setNavState() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }

  function closeMobileMenu() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector(".site-nav .menu");
    if (!toggle || !menu) return;

    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function wireNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector(".site-nav .menu");

    setNavState();
    window.addEventListener("scroll", setNavState, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        const open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;

        event.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", link.getAttribute("href"));
      });
    });
  }

  function hydrateContactData() {
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
  }

  function categoryMatches(card, filter) {
    const category = normalizeCategory(card.dataset.category);
    if (filter === "all") return true;
    if (filter === "colorimetria") {
      return category === "colorimetria" || category === "arte";
    }
    return category === filter;
  }

  function visiblePortfolioCards() {
    return Array.from(document.querySelectorAll("#portafolio .card")).filter(function (card) {
      return !card.hidden;
    });
  }

  function applyPortfolioFilter(filter) {
    activePortfolioFilter = filter || "all";
    const cards = Array.from(document.querySelectorAll("#portafolio .card"));
    if (!cards.length) return;

    window.clearTimeout(filterTimer);
    if (portfolioGrid) portfolioGrid.classList.add("is-filtering");

    cards.forEach(function (card) {
      const shouldShow = categoryMatches(card, activePortfolioFilter);

      if (shouldShow) {
        card.hidden = false;
        card.classList.remove("will-hide");
        card.classList.add("will-show");

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            card.classList.remove("will-show");
          });
        });
      } else {
        card.classList.remove("will-show");
        card.classList.add("will-hide");
        window.setTimeout(function () {
          if (card.classList.contains("will-hide")) {
            card.hidden = true;
          }
        }, 340);
      }
    });

    filterTimer = window.setTimeout(function () {
      if (portfolioGrid) portfolioGrid.classList.remove("is-filtering");
    }, 420);
  }

  function wirePortfolioFilters() {
    portfolioFilters.forEach(function (button) {
      button.addEventListener("click", function () {
        portfolioFilters.forEach(function (btn) {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        applyPortfolioFilter(button.dataset.portfolioFilter);
      });
    });
  }

  function wireRevealAnimations() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -46px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });

    document.addEventListener("studio13:gallery-mounted", function () {
      document.querySelectorAll("#portafolio .card").forEach(function (card, index) {
        card.classList.add("reveal");
        card.style.transitionDelay = Math.min(index * 0.05, 0.3) + "s";
        observer.observe(card);
      });
      applyPortfolioFilter(activePortfolioFilter);
    });
  }

  function wireLightbox() {
    const lightbox = document.getElementById("portfolio-lightbox");
    const portfolio = document.getElementById("portafolio");
    if (!lightbox || !portfolio) return;

    const image = lightbox.querySelector(".lightbox-img");
    const caption = lightbox.querySelector(".lightbox-caption");
    const close = lightbox.querySelector("[data-lightbox-close]");
    const prev = lightbox.querySelector("[data-lightbox-prev]");
    const next = lightbox.querySelector("[data-lightbox-next]");
    let currentIndex = 0;

    function open(index) {
      const cards = visiblePortfolioCards();
      if (!cards.length || index < 0 || index >= cards.length) return;

      const card = cards[index];
      const cardImage = card.querySelector("img");
      const title = card.querySelector(".overlay strong");
      const label = card.querySelector(".overlay span");
      if (!cardImage) return;

      currentIndex = index;
      image.src = cardImage.currentSrc || cardImage.src;
      image.alt = cardImage.alt || "Imagen del portafolio Studio 13";
      caption.textContent = [label && label.textContent, title && title.textContent]
        .filter(Boolean)
        .join(" - ");

      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      window.requestAnimationFrame(function () {
        lightbox.classList.add("is-visible");
      });
      if (close) close.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-visible");
      document.body.classList.remove("lightbox-open");
      window.setTimeout(function () {
        if (!lightbox.classList.contains("is-visible")) {
          lightbox.hidden = true;
          image.removeAttribute("src");
        }
      }, 240);
    }

    function move(step) {
      const cards = visiblePortfolioCards();
      if (!cards.length) return;
      currentIndex = (currentIndex + step + cards.length) % cards.length;
      open(currentIndex);
    }

    portfolio.addEventListener("click", function (event) {
      const card = event.target.closest(".card");
      if (!card || card.hidden) return;
      open(visiblePortfolioCards().indexOf(card));
    });

    if (close) close.addEventListener("click", closeLightbox);
    if (prev) prev.addEventListener("click", function () { move(-1); });
    if (next) next.addEventListener("click", function () { move(1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target.dataset.lightboxClose != null) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    });
  }

  function setServiceIntent(serviceName) {
    const service = document.getElementById("client-service");
    if (!service || !serviceName) return;

    const option = Array.from(service.options).find(function (item) {
      return item.value === serviceName;
    });

    if (option) service.value = option.value;
  }

  function wireServiceIntent() {
    document.querySelectorAll("[data-service-intent]").forEach(function (link) {
      link.addEventListener("click", function () {
        setServiceIntent(link.dataset.serviceIntent);
      });
    });
  }

  function wireWhatsappForm() {
    if (!whatsappForm) return;

    whatsappForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = whatsappForm.querySelector("#client-name").value.trim();
      const phone = whatsappForm.querySelector("#client-phone").value.trim();
      const service = whatsappForm.querySelector("#client-service").value.trim();
      const date = whatsappForm.querySelector("#client-date").value;

      if (!name || !phone || !service || !date) {
        whatsappForm.reportValidity();
        return;
      }

      const message = [
        "Hola Studio 13, me interesa cotizar un servicio de " + service + ".",
        "Mi nombre es " + name + ".",
        "Mi fecha tentativa es " + date + ".",
        "Mi numero de contacto es " + phone + ".",
        "Podrian enviarme disponibilidad, paquetes e informacion de inversion, por favor?"
      ].join(" ");

      window.open(whatsappUrl + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    });
  }

  wireNavigation();
  hydrateContactData();
  wireRevealAnimations();
  wirePortfolioFilters();
  wireLightbox();
  wireServiceIntent();
  wireWhatsappForm();
})();
