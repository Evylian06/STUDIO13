(function () {
  "use strict";

  const BUCKET = "gallery-images";

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function layoutClass(layout) {
    if (!layout) return "";
    return layout.split(/\s+/).filter(Boolean).join(" ");
  }

  function renderPortfolioCard(item) {
    const extra = layoutClass(item.layout);
    const tag = escapeHtml(item.tag || item.category);
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    return `
      <article class="card ${extra}" data-category="${escapeHtml(item.category)}">
        <img src="${escapeHtml(item.image_url)}" alt="${alt}" loading="lazy" width="600" height="600">
        <div class="overlay">
          <span>${tag}</span>
          <strong>${title}</strong>
        </div>
      </article>`;
  }

  function renderArtworkCard(item) {
    const technique = escapeHtml(item.technique || "—");
    const artist = escapeHtml(item.artist || "—");
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    return `
      <article class="item-card">
        <img src="${escapeHtml(item.image_url)}" alt="${alt}" loading="lazy" width="500" height="320">
        <div class="item-info">
          <strong>Título: ${title}</strong><br>
          Técnica: ${technique}<br>
          Artista: ${artist}
        </div>
      </article>`;
  }

  function renderPhotoTile(item, large) {
    const tag = escapeHtml(item.tag || item.category);
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.description || item.title);
    const cls = large ? "photo-tile large" : "photo-tile";
    return `
      <article class="${cls}">
        <img src="${escapeHtml(item.image_url)}" alt="${alt}" loading="lazy" width="600" height="600">
        <div><span>${tag}</span><strong>${title}</strong></div>
      </article>`;
  }

  function renderPhotoStrip(item) {
    const label = escapeHtml(item.tag || item.title);
    const alt = escapeHtml(item.description || item.title);
    return `
      <article>
        <img src="${escapeHtml(item.image_url)}" alt="${alt}" loading="lazy" width="600" height="800">
        <span>${label}</span>
      </article>`;
  }

  function renderPhotoGridImg(item) {
    const alt = escapeHtml(item.description || item.title);
    return `<img src="${escapeHtml(item.image_url)}" alt="${alt}" loading="lazy" width="600" height="600">`;
  }

  async function fetchItems(section, category) {
    const client = window.getSupabaseClient();
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

  function mountPortfolioGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPortfolioCard).join("");
    const note = mount.closest("section")?.querySelector(".gallery-note");
    if (note) note.hidden = true;
  }

  function mountArtworkGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderArtworkCard).join("");
    const note = mount.closest("section")?.querySelector(".gallery-note");
    if (note) note.hidden = true;
  }

  function mountPhotoMosaic(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items
      .map((item, i) => renderPhotoTile(item, i === 0))
      .join("");
  }

  function mountPhotoStrip(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPhotoStrip).join("");
  }

  function mountPhotoGrid(mount, items) {
    if (!items.length) return;
    mount.innerHTML = items.map(renderPhotoGridImg).join("");
  }

  async function initMount(mount) {
    const section = mount.dataset.gallerySection;
    const category = mount.dataset.galleryCategory || null;
    const template = mount.dataset.galleryTemplate;

    if (!section || !template) return;

    const items = await fetchItems(section, category);
    if (!items || !items.length) return;

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
  }

  async function init() {
    if (!window.isSupabaseConfigured()) return;

    const mounts = document.querySelectorAll("[data-gallery-mount]");
    await Promise.all(Array.from(mounts).map(initMount));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
