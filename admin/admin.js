(function () {
  "use strict";

  const BUCKET = "gallery-images";

  const $ = (sel, root = document) => root.querySelector(sel);

  const state = {
    section: "studio13",
    items: [],
    editingId: null,
  };

  const categories = {
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
  };

  function client() {
    return window.getSupabaseClient();
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "message " + (type || "");
    el.hidden = !text;
  }

  function slugName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function requireAuth() {
    const supabase = client();
    if (!supabase) return null;

    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  function fillCategorySelect(section) {
    const select = $("#item-category");
    if (!select) return;
    const opts = categories[section] || categories.studio13;
    select.innerHTML = opts
      .map((o) => `<option value="${o.value}">${o.label}</option>`)
      .join("");
  }

  function toggleLayoutField(section) {
    const wrap = $("#field-layout");
    if (wrap) wrap.hidden = section !== "studio13";
  }

  function renderList() {
    const list = $("#item-list");
    if (!list) return;

    if (!state.items.length) {
      list.innerHTML =
        '<p class="empty-admin">No hay imágenes en esta sección. Pulsa «Nueva imagen» para agregar la primera.</p>';
      return;
    }

    list.innerHTML = state.items
      .map((item) => {
        const meta = [
          item.category,
          item.published ? "Publicado" : "Borrador",
        ].join(" · ");
        return `
        <article class="item-row" data-id="${item.id}">
          <img src="${item.image_url}" alt="">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="meta">${escapeHtml(meta)}</p>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-ghost" data-edit="${item.id}">Editar</button>
            <button type="button" class="btn btn-danger" data-delete="${item.id}">Eliminar</button>
          </div>
        </article>`;
      })
      .join("");

    list.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => openEdit(btn.dataset.edit));
    });
    list.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deleteItem(btn.dataset.delete));
    });
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  async function loadItems() {
    const supabase = client();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("section", state.section)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      showMessage($("#list-message"), error.message, "error");
      return;
    }

    state.items = data || [];
    renderList();
  }

  function openModal(isEdit) {
    const modal = $("#item-modal");
    if (modal) modal.hidden = false;
    $("#modal-title").textContent = isEdit ? "Editar imagen" : "Nueva imagen";
    $("#field-image").hidden = isEdit;
    $("#item-image").required = !isEdit;
  }

  function closeModal() {
    const modal = $("#item-modal");
    if (modal) modal.hidden = true;
    state.editingId = null;
    $("#item-form").reset();
    $("#image-preview").hidden = true;
    showMessage($("#form-message"), "", "");
  }

  function openCreate() {
    state.editingId = null;
    fillCategorySelect(state.section);
    toggleLayoutField(state.section);
    $("#item-section").value = state.section;
    openModal(false);
  }

  function openEdit(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;

    state.editingId = id;
    fillCategorySelect(item.section);
    toggleLayoutField(item.section);

    $("#item-section").value = item.section;
    $("#item-category").value = item.category;
    $("#item-title").value = item.title;
    $("#item-tag").value = item.tag || "";
    $("#item-description").value = item.description || "";
    $("#item-technique").value = item.technique || "";
    $("#item-artist").value = item.artist || "";
    $("#item-layout").value = item.layout || "";
    $("#item-sort").value = item.sort_order ?? 0;
    $("#item-published").checked = item.published;

    const preview = $("#image-preview");
    preview.src = item.image_url;
    preview.hidden = false;

    openModal(true);
  }

  async function uploadImage(file, section) {
    const supabase = client();
    const path = `${section}/${Date.now()}-${slugName(file.name)}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, url: data.publicUrl };
  }

  async function deleteStoragePath(storagePath) {
    if (!storagePath) return;
    const supabase = client();
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  async function saveItem(event) {
    event.preventDefault();
    const supabase = client();
    const msg = $("#form-message");
    const submitBtn = $("#btn-save");

    const section = $("#item-section").value;
    const payload = {
      section,
      category: $("#item-category").value,
      title: $("#item-title").value.trim(),
      description: $("#item-description").value.trim(),
      tag: $("#item-tag").value.trim(),
      technique: $("#item-technique").value.trim(),
      artist: $("#item-artist").value.trim(),
      layout: section === "studio13" ? $("#item-layout").value : "",
      sort_order: parseInt($("#item-sort").value, 10) || 0,
      published: $("#item-published").checked,
    };

    if (!payload.title) {
      showMessage(msg, "El título es obligatorio.", "error");
      return;
    }

    submitBtn.disabled = true;
    showMessage(msg, "Guardando…", "");

    try {
      if (state.editingId) {
        const file = $("#item-image").files[0];
        let updatePayload = { ...payload };

        if (file) {
          const uploaded = await uploadImage(file, section);
          updatePayload.image_url = uploaded.url;
          updatePayload.storage_path = uploaded.path;
          const old = state.items.find((i) => i.id === state.editingId);
          if (old && old.storage_path && old.storage_path !== uploaded.path) {
            await deleteStoragePath(old.storage_path);
          }
        }

        const { error } = await supabase
          .from("gallery_items")
          .update(updatePayload)
          .eq("id", state.editingId);

        if (error) throw error;
      } else {
        const file = $("#item-image").files[0];
        if (!file) {
          showMessage(msg, "Selecciona una imagen.", "error");
          submitBtn.disabled = false;
          return;
        }

        const uploaded = await uploadImage(file, section);
        const { error } = await supabase.from("gallery_items").insert({
          ...payload,
          image_url: uploaded.url,
          storage_path: uploaded.path,
        });

        if (error) throw error;
      }

      showMessage(msg, "Guardado correctamente.", "ok");
      closeModal();
      await loadItems();
    } catch (err) {
      showMessage(msg, err.message || "Error al guardar.", "error");
    }

    submitBtn.disabled = false;
  }

  async function deleteItem(id) {
    if (!confirm("¿Eliminar esta imagen? No se puede deshacer.")) return;

    const supabase = client();
    const item = state.items.find((i) => i.id === id);
    if (!item) return;

    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    await deleteStoragePath(item.storage_path);
    await loadItems();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const supabase = client();
    const msg = $("#auth-message");

    if (!supabase) {
      showMessage(msg, "Configura Supabase en js/supabase-config.js", "error");
      return;
    }

    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showMessage(msg, error.message, "error");
      return;
    }

    showApp();
  }

  async function handleLogout() {
    const supabase = client();
    if (supabase) await supabase.auth.signOut();
    showLogin();
  }

  function showLogin() {
    $("#auth-view").hidden = false;
    $("#app-view").hidden = true;
  }

  function showApp() {
    $("#auth-view").hidden = true;
    $("#app-view").hidden = false;
    loadItems();
  }

  function bindUi() {
    $("#login-form")?.addEventListener("submit", handleLogin);
    $("#btn-logout")?.addEventListener("click", handleLogout);
    $("#btn-new")?.addEventListener("click", openCreate);
    $("#btn-cancel")?.addEventListener("click", closeModal);
    $("#item-form")?.addEventListener("submit", saveItem);

    $("#item-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "item-modal") closeModal();
    });

    $("#item-image")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const preview = $("#image-preview");
      if (!file) {
        preview.hidden = true;
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
    });

    $("#item-section")?.addEventListener("change", (e) => {
      fillCategorySelect(e.target.value);
      toggleLayoutField(e.target.value);
    });

    document.querySelectorAll(".tabs-admin button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tabs-admin button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.section = btn.dataset.section;
        loadItems();
      });
    });
  }

  async function init() {
    bindUi();

    if (!window.isSupabaseConfigured()) {
      $("#config-warn").hidden = false;
      return;
    }

    const session = await requireAuth();
    if (session) showApp();
    else showLogin();

    const supabase = client();
    if (supabase) {
      supabase.auth.onAuthStateChange((_event, sess) => {
        if (sess) showApp();
        else showLogin();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
