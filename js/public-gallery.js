(function () {
  "use strict";

  function escapeHtml(text) {
    if (window.StudioUtils && window.StudioUtils.escapeHtml) {
      return window.StudioUtils.escapeHtml(text);
    }
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function imageSrc(url, width) {
    if (window.CloudinaryStudio && window.CloudinaryStudio.optimizeUrl) {
      return window.CloudinaryStudio.optimizeUrl(url, { width: width || 900 });
    }
    return url || "";
  }

  function layoutClass(layout) {
    if (!layout) return "";
    const allowed = ["wide", "tall", "color-card"];
    return layout
      .split(/\s+/)
      .filter(function (name) {
        return allowed.indexOf(name) !== -1;
      })
      .join(" ");
  }

  function renderPortfolioCard(item) {
    const extra = layoutClass(item.layout);
    const tag = escapeHtml(item.tag || item.category);
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    const category = escapeHtml(item.category || "general");
    return (
      '<article class="card ' +
      extra +
      '" data-category="' +
      category +
      '">' +
      '<img src="' +
      escapeHtml(imageSrc(item.image_url, 800)) +
      '" alt="' +
      alt +
      '" loading="lazy" width="600" height="600">' +
      '<div class="overlay"><span>' +
      tag +
      "</span><strong>" +
      title +
      "</strong></div></article>"
    );
  }

  function categoryLabel(section, value) {
    const list =
      window.STUDIO_CATEGORIES && window.STUDIO_CATEGORIES[section];
    if (!list) return value || "General";
    const found = list.find(function (c) {
      return c.value === value;
    });
    return found ? found.label : value;
  }

  function renderArtworkCard(item) {
    const technique = escapeHtml(item.technique || "—");
    const artist = escapeHtml(item.artist || "—");
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    const category = escapeHtml(item.category || "general");
    const catLabel = escapeHtml(
      categoryLabel("colorimetria", item.category || "general")
    );
    return (
      '<article class="item-card reveal" data-category="' +
      category +
      '">' +
      '<a class="item-card-media" href="#" data-lightbox-open aria-label="Ver ' +
      title +
      '">' +
      '<img src="' +
      escapeHtml(imageSrc(item.image_url, 600)) +
      '" alt="' +
      alt +
      '" loading="lazy" width="500" height="320">' +
      '<span class="item-card-badge">' +
      catLabel +
      '</span><span class="item-card-zoom">Ver obra</span></a>' +
      '<div class="item-info">' +
      '<h3 class="item-title">' +
      title +
      "</h3>" +
      '<p class="item-meta">' +
      technique +
      " · " +
      artist +
      '</p><a class="item-cta" data-artwork-consult data-artwork-title="' +
      title +
      '" href="#">Consultar obra</a></div></article>'
    );
  }

  function renderPhotoTile(item, large) {
    const tag = escapeHtml(item.tag || item.category);
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    const cls = large ? "photo-tile large" : "photo-tile";
    return (
      '<article class="' +
      cls +
      '">' +
      '<img src="' +
      escapeHtml(imageSrc(item.image_url, 800)) +
      '" alt="' +
      alt +
      '" loading="lazy" width="600" height="600">' +
      "<div><span>" +
      tag +
      "</span><strong>" +
      title +
      "</strong></div></article>"
    );
  }

  function renderPhotoStrip(item) {
    const label = escapeHtml(item.tag || item.title);
    const alt = escapeHtml(item.description || item.title);
    return (
      "<article>" +
      '<img src="' +
      escapeHtml(imageSrc(item.image_url, 700)) +
      '" alt="' +
      alt +
      '" loading="lazy" width="600" height="800">' +
      "<span>" +
      label +
      "</span></article>"
    );
  }

  function renderPhotoGridImg(item) {
    const alt = escapeHtml(item.description || item.title);
    return (
      '<img src="' +
      escapeHtml(imageSrc(item.image_url, 700)) +
      '" alt="' +
      alt +
      '" loading="lazy" width="600" height="600">'
    );
  }

  async function fetchItems(section, category) {
    const client = window.getSupabaseClient && window.getSupabaseClient();
    if (!client) return null;

    let query = client
      .from("gallery_items")
      .select("*")
      .eq("section", section)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[Studio13] Galería:", error.message);
      return null;
    }
    return data;
  }

  function hideGalleryNote(mount) {
    const note = mount.closest("section") && mount.closest("section").querySelector(".gallery-note");
    if (note) note.hidden = true;
  }

  function mountPortfolioGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPortfolioCard).join("");
    hideGalleryNote(mount);
  }

  function mountArtworkGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderArtworkCard).join("");
    hideGalleryNote(mount);
  }

  function mountPhotoMosaic(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(function (item, i) {
      return renderPhotoTile(item, i === 0);
    }).join("");
  }

  function mountPhotoStrip(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPhotoStrip).join("");
  }

  function mountPhotoGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPhotoGridImg).join("");
  }

  function dispatchMounted(mount, itemCount) {
    mount.dispatchEvent(
      new CustomEvent("studio13:gallery-mounted", {
        bubbles: true,
        detail: {
          section: mount.dataset.gallerySection,
          template: mount.dataset.galleryTemplate,
          itemCount: itemCount,
        },
      })
    );
  }

  async function initMount(mount) {
    const section = mount.dataset.gallerySection;
    const category = mount.dataset.galleryCategory || null;
    const template = mount.dataset.galleryTemplate;

    if (!section || !template) return;

    const items = await fetchItems(section, category);
    if (!items || !items.length) {
      dispatchMounted(mount, 0);
      return;
    }

    switch (template) {
      case "portfolio":
        mountPortfolioGrid(mount, items);
        break;
      case "artwork":
        mountArtworkGrid(mount, items);
        break;
      case "photo-mosaic":
        mountPhotoMosaic(mount, items);
        break;
      case "photo-strip":
        mountPhotoStrip(mount, items);
        break;
      case "photo-grid":
        mountPhotoGrid(mount, items);
        break;
      default:
        break;
    }

    dispatchMounted(mount, items.length);
  }

  async function init() {
    if (!window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
      return;
    }

    const mounts = document.querySelectorAll("[data-gallery-mount]");
    await Promise.all(Array.from(mounts).map(initMount));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
