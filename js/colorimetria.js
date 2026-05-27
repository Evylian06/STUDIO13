/**
 * Colorimetría Amazónica — interacción, galería, lightbox y navegación.
 */
(function () {
  "use strict";

  const GRID_ID = "colorimetria-gallery-grid";
  const SEARCH_ID = "colorimetria-gallery-search";
  const COUNT_ID = "gallery-result-count";
  const TABS_SELECTOR = "[data-colorimetria-filter]";
  const NAV_ID = "color-nav";

  let activeFilter = "all";
  let searchQuery = "";

  function normalize(text) {
    if (window.StudioUtils && window.StudioUtils.normalizeText) {
      return window.StudioUtils.normalizeText(text);
    }
    return String(text || "").toLowerCase();
  }

  function whatsappUrl(title) {
    const cfg = window.STUDIO_CONFIG;
    if (!cfg || !cfg.whatsapp) return "#";
    const msg = encodeURIComponent(
      "Hola Studio 13 — Colorimetría Amazónica. Me interesa la obra: " +
        (title || "—")
    );
    return "https://wa.me/" + cfg.whatsapp + "?text=" + msg;
  }

  function cardMatchesFilter(card) {
    const category = card.getAttribute("data-category") || "general";
    if (activeFilter === "all") return true;
    return category === activeFilter;
  }

  function cardMatchesSearch(card) {
    if (!searchQuery) return true;
    const text = normalize(card.textContent || "");
    return text.indexOf(searchQuery) !== -1;
  }

  function updateResultCount(visible, total) {
    const el = document.getElementById(COUNT_ID);
    if (!el) return;
    if (total === 0) {
      el.textContent = "Cargando catálogo…";
      return;
    }
    el.textContent =
      visible === total
        ? visible + (visible === 1 ? " obra en exhibición" : " obras en exhibición")
        : visible + " de " + total + " obras";
  }

  function applyGalleryFilters() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const cards = grid.querySelectorAll(".item-card");
    let visible = 0;

    cards.forEach(function (card, index) {
      const show = cardMatchesFilter(card) && cardMatchesSearch(card);
      card.hidden = !show;
      card.classList.toggle("is-filtered-out", !show);
      if (show) {
        visible += 1;
        card.style.animationDelay = Math.min(index * 0.05, 0.4) + "s";
        card.classList.add("is-visible");
      }
    });

    updateResultCount(visible, cards.length);

    const empty =
      grid.parentElement &&
      grid.parentElement.querySelector("[data-gallery-empty]");
    if (empty) empty.hidden = visible > 0;

    const section = document.getElementById("galeria");
    if (section) section.classList.toggle("has-no-results", visible === 0);
  }

  function setActiveTab(button) {
    document.querySelectorAll(TABS_SELECTOR).forEach(function (btn) {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    activeFilter = button.getAttribute("data-colorimetria-filter") || "all";
    syncCategoryCards();
    applyGalleryFilters();
  }

  function syncCategoryCards() {
    document.querySelectorAll("[data-filter-jump]").forEach(function (card) {
      const cat = card.getAttribute("data-filter-jump");
      const active = cat === activeFilter && cat !== "all";
      card.classList.toggle("is-active", active);
    });
  }

  function bindTabs() {
    document.querySelectorAll(TABS_SELECTOR).forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveTab(button);
      });
    });
  }

  function bindFilterJumps() {
    document.querySelectorAll("[data-filter-jump]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        const filter = el.getAttribute("data-filter-jump");
        if (!filter || filter === "all") return;

        e.preventDefault();
        const tab = document.querySelector(
          TABS_SELECTOR + '[data-colorimetria-filter="' + filter + '"]'
        );
        if (tab) setActiveTab(tab);

        const galeria = document.getElementById("galeria");
        if (galeria) {
          galeria.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function bindSearch() {
    const input = document.getElementById(SEARCH_ID);
    if (!input) return;

    input.addEventListener("input", function () {
      searchQuery = normalize(input.value.trim());
      applyGalleryFilters();
    });
  }

  function bindConsultLinks() {
    document.body.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-artwork-consult]");
      if (!btn) return;
      const title = btn.getAttribute("data-artwork-title") || "";
      btn.href = whatsappUrl(title);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindLightbox() {
    const modal = document.getElementById("color-lightbox");
    if (!modal) return;

    const img = modal.querySelector(".lightbox-img");
    const caption = modal.querySelector(".lightbox-caption");
    const closeBtn = modal.querySelector("[data-lightbox-close]");

    function open(card) {
      const media = card.querySelector(".item-card-media img");
      const title =
        card.querySelector(".item-title") &&
        card.querySelector(".item-title").textContent;
      if (!media) return;
      img.src = media.src;
      img.alt = media.alt || "";
      caption.textContent = title || media.alt || "";
      modal.hidden = false;
      document.body.classList.add("lightbox-open");
    }

    function close() {
      modal.hidden = true;
      document.body.classList.remove("lightbox-open");
      img.removeAttribute("src");
    }

    document.body.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-lightbox-open]");
      if (trigger) {
        e.preventDefault();
        const card = trigger.closest(".item-card");
        if (card) open(card);
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  function bindNavScroll() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    window.addEventListener(
      "scroll",
      function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 8);
      },
      { passive: true }
    );
  }

  function bindMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector(".color-nav .menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindReveal() {
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document
      .querySelectorAll(
        ".reveal, .trust-badge, .activity-card, .item-card, .artist-card"
      )
      .forEach(function (el) {
        observer.observe(el);
      });
  }

  function ensureEmptyState() {
    const grid = document.getElementById(GRID_ID);
    if (!grid || grid.parentElement.querySelector("[data-gallery-empty]")) {
      return;
    }

    const p = document.createElement("p");
    p.className = "gallery-empty";
    p.setAttribute("data-gallery-empty", "");
    p.hidden = true;
    p.innerHTML =
      "<strong>Sin resultados</strong><br>No hay obras que coincidan. Prueba otra categoría o término de búsqueda.";
    grid.insertAdjacentElement("afterend", p);
  }

  function enhanceStaticCards() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    grid.querySelectorAll(".item-card").forEach(function (card) {
      if (card.querySelector("[data-lightbox-open]")) return;

      const info = card.querySelector(".item-info");
      if (!info) return;

      const strong = info.querySelector("strong");
      const titleText = strong
        ? strong.textContent.replace(/^Título:\s*/i, "").trim()
        : "Obra";
      const lines = info.innerHTML.split("<br>");
      const technique = lines[1]
        ? lines[1].replace(/técnica:\s*/i, "").trim()
        : "";
      const artist = lines[2]
        ? lines[2].replace(/artista:\s*/i, "").trim()
        : "";

      const img = card.querySelector("img");
      const cat = card.getAttribute("data-category") || "general";
      let catLabel = cat;
      const list =
        window.STUDIO_CATEGORIES && window.STUDIO_CATEGORIES.colorimetria;
      if (list) {
        const found = list.find(function (c) {
          return c.value === cat;
        });
        if (found) catLabel = found.label;
      }

      card.innerHTML =
        '<a class="item-card-media" href="#" data-lightbox-open aria-label="Ver ' +
        titleText +
        '">' +
        (img ? img.outerHTML : "") +
        '<span class="item-card-badge">' +
        catLabel +
        '</span><span class="item-card-zoom">Ver obra</span></a>' +
        '<div class="item-info">' +
        '<h3 class="item-title">' +
        titleText +
        "</h3>" +
        '<p class="item-meta">' +
        technique +
        (artist ? " · " + artist : "") +
        "</p>" +
        '<a class="item-cta" data-artwork-consult data-artwork-title="' +
        titleText +
        '" href="#">Consultar obra</a></div>';
    });
  }

  function init() {
    ensureEmptyState();
    enhanceStaticCards();
    bindTabs();
    bindFilterJumps();
    bindSearch();
    bindConsultLinks();
    bindLightbox();
    bindNavScroll();
    bindMobileNav();
    bindReveal();
    applyGalleryFilters();

    document.addEventListener("studio13:gallery-mounted", function (event) {
      const mount = event.target;
      if (!mount || mount.id !== GRID_ID) return;
      bindReveal();
      applyGalleryFilters();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
