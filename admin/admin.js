(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

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

  function cloudinary() {
    return window.CloudinaryStudio;
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "message " + (type || "");
    el.hidden = !text;
  }

  function escapeHtml(text) {
    const el = document.createElement("div");
    el.textContent = text == null ? "" : String(text);
    return el.innerHTML;
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
      .map(function (o) {
        return '<option value="' + o.value + '">' + o.label + "</option>";
      })
      .join("");
  }

  function toggleLayoutField(section) {
    const wrap = $("#field-layout");
    if (wrap) wrap.hidden = section !== "studio13";
  }

  function thumbUrl(url) {
    const c = cloudinary();
    if (c && c.optimizeUrl) {
      return c.optimizeUrl(url, { width: 160 });
    }
    return url;
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
      .map(function (item) {
        const meta = [
          item.category,
          item.published ? "Publicado" : "Borrador",
        ].join(" · ");
        return (
          '<article class="item-row" data-id="' +
          escapeHtml(item.id) +
          '">' +
          '<img src="' +
          escapeHtml(thumbUrl(item.image_url)) +
          '" alt="" loading="lazy">' +
          "<div><h3>" +
          escapeHtml(item.title) +
          '</h3><p class="meta">' +
          escapeHtml(meta) +
          '</p></div><div class="item-actions">' +
          '<button type="button" class="btn btn-ghost" data-edit="' +
          escapeHtml(item.id) +
          '">Editar</button>' +
          '<button type="button" class="btn btn-danger" data-delete="' +
          escapeHtml(item.id) +
          '">Eliminar</button>' +
          "</div></article>"
        );
      })
      .join("");

    list.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openEdit(btn.getAttribute("data-edit"));
      });
    });
    list.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteItem(btn.getAttribute("data-delete"));
      });
    });
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
    showMessage($("#list-message"), "", "");
  }

  function openModal(isEdit) {
    const modal = $("#item-modal");
    if (modal) modal.hidden = false;
    $("#modal-title").textContent = isEdit ? "Editar imagen" : "Nueva imagen";
    const inputImage = $("#item-image");
    if (inputImage) inputImage.required = !isEdit;
  }

  function closeModal() {
    const modal = $("#item-modal");
    if (modal) modal.hidden = true;
    state.editingId = null;
    const form = $("#item-form");
    if (form) form.reset();
    const preview = $("#image-preview");
    if (preview) preview.hidden = true;
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
    const item = state.items.find(function (i) {
      return i.id === id;
    });
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
    $("#item-sort").value = item.sort_order != null ? item.sort_order : 0;
    $("#item-published").checked = item.published;

    const preview = $("#image-preview");
    preview.src = thumbUrl(item.image_url);
    preview.hidden = false;

    openModal(true);
  }

  async function uploadImage(file, section) {
    const c = cloudinary();
    if (!c || !c.isConfigured()) {
      throw new Error("Configura Cloudinary en js/cloudinary-config.js");
    }
    return c.uploadImage(file, section);
  }

  async function removeCloudinaryAsset(publicId) {
    const c = cloudinary();
    if (c && c.deleteImage && publicId) {
      await c.deleteImage(publicId);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    const supabase = client();
    const msg = $("#form-message");
    const submitBtn = $("#btn-save");

    const section = $("#item-section").value;
    const payload = {
      section: section,
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
        const updatePayload = Object.assign({}, payload);

        if (file) {
          const uploaded = await uploadImage(file, section);
          updatePayload.image_url = uploaded.url;
          updatePayload.storage_path = uploaded.publicId;

          const old = state.items.find(function (i) {
            return i.id === state.editingId;
          });
          if (
            old &&
            old.storage_path &&
            old.storage_path !== uploaded.publicId
          ) {
            await removeCloudinaryAsset(old.storage_path);
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
          section: payload.section,
          category: payload.category,
          title: payload.title,
          description: payload.description,
          tag: payload.tag,
          technique: payload.technique,
          artist: payload.artist,
          layout: payload.layout,
          sort_order: payload.sort_order,
          published: payload.published,
          image_url: uploaded.url,
          storage_path: uploaded.publicId,
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
    if (!confirm("¿Eliminar esta imagen del sitio?")) return;

    const supabase = client();
    const item = state.items.find(function (i) {
      return i.id === id;
    });
    if (!item) return;

    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    await removeCloudinaryAsset(item.storage_path);
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

    const { error } = await supabase.auth.signInWithPassword({
      email: $("#login-email").value.trim(),
      password: $("#login-password").value,
    });

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

  function updateConfigWarnings() {
    const warn = $("#config-warn");
    if (!warn) return;

    const supabaseOk =
      window.isSupabaseConfigured && window.isSupabaseConfigured();
    const cloudinaryOk =
      window.CloudinaryStudio && window.CloudinaryStudio.isConfigured();

    if (!supabaseOk || !cloudinaryOk) {
      warn.hidden = false;
      const parts = [];
      if (!supabaseOk) parts.push("Supabase (js/supabase-config.js)");
      if (!cloudinaryOk) parts.push("Cloudinary (js/cloudinary-config.js)");
      warn.innerHTML =
        "<strong>Falta configurar:</strong> " +
        parts.join(" y ") +
        ". Revisa supabase/INSTRUCCIONES.txt.";
    } else {
      warn.hidden = true;
    }
  }

  function bindUi() {
    const loginForm = $("#login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    const logoutBtn = $("#btn-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    const newBtn = $("#btn-new");
    if (newBtn) newBtn.addEventListener("click", openCreate);
    const cancelBtn = $("#btn-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    const itemForm = $("#item-form");
    if (itemForm) itemForm.addEventListener("submit", saveItem);

    const itemModal = $("#item-modal");
    if (itemModal) itemModal.addEventListener("click", function (e) {
      if (e.target.id === "item-modal") closeModal();
    });

    const imageInput = $("#item-image");
    if (imageInput) imageInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      const preview = $("#image-preview");
      if (!file) {
        preview.hidden = true;
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
    });

    const sectionSelect = $("#item-section");
    if (sectionSelect) sectionSelect.addEventListener("change", function (e) {
      fillCategorySelect(e.target.value);
      toggleLayoutField(e.target.value);
    });

    document.querySelectorAll(".tabs-admin button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tabs-admin button").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        state.section = btn.getAttribute("data-section");
        loadItems();
      });
    });
  }

  async function init() {
    bindUi();
    updateConfigWarnings();

    if (!window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
      return;
    }

    const session = await requireAuth();
    if (session) showApp();
    else showLogin();

    const supabase = client();
    if (supabase) {
      supabase.auth.onAuthStateChange(function (_event, sess) {
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
