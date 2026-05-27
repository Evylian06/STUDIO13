/**
 * Mejoras clave:
 * - Experiencia premium por sesion para la pagina principal.
 * - CTA de reserva destacado sin bloquear la navegacion.
 * - Mensajes de apoyo conectados al flujo real de WhatsApp.
 */
(function () {
  "use strict";

  if (!document.body.classList.contains("index-page")) return;

  var docEl = document.documentElement;
  var storageKey = "studio13_premium_session_v2";
  var state = readState() || {
    createdAt: Date.now(),
    onboarded: false,
    highlightedCta: false,
    interactions: 0,
  };

  function readState() {
    try {
      var raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      /* Storage can be blocked in private browsing. The page must still work. */
    }
  }

  function ensureToast() {
    var existing = document.getElementById("premium-toast");
    if (existing) return existing;

    var toast = document.createElement("div");
    toast.id = "premium-toast";
    toast.className = "premium-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.hidden = true;
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message) {
    var toast = ensureToast();
    toast.textContent = message;
    toast.hidden = false;
    docEl.classList.add("premium-toast-open");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      docEl.classList.remove("premium-toast-open");
      window.setTimeout(function () {
        if (!docEl.classList.contains("premium-toast-open")) {
          toast.hidden = true;
        }
      }, 250);
    }, 2400);
  }

  function pulseReservationCta() {
    var cta = document.querySelector('.nav-cta[href="#contacto"]');
    if (!cta || state.highlightedCta) return;

    state.highlightedCta = true;
    saveState();

    cta.classList.add("premium-cta-pulse");
    window.setTimeout(function () {
      cta.classList.remove("premium-cta-pulse");
    }, 1600);
  }

  function bumpInteraction() {
    state.interactions += 1;
    saveState();
    pulseReservationCta();
  }

  function prefillPremiumService() {
    var service = document.getElementById("client-service");
    if (!service) return;

    var premiumOption = Array.from(service.options).find(function (option) {
      return option.value.toLowerCase().indexOf("premium") !== -1;
    });

    if (premiumOption) {
      service.value = premiumOption.value;
    }
  }

  function focusBookingForm() {
    prefillPremiumService();

    var name = document.getElementById("client-name");
    if (name) {
      window.setTimeout(function () {
        name.focus({ preventScroll: true });
      }, 450);
    }

    showToast("Experiencia premium lista: completa tus datos y te llevamos directo a WhatsApp.");
  }

  function wireInteractions() {
    document
      .querySelectorAll("header a, .hero-actions a, .activity-strip a")
      .forEach(function (link) {
        link.addEventListener("click", bumpInteraction);
      });

    var reservationLinks = document.querySelectorAll('a[href="#contacto"]');
    reservationLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(focusBookingForm, 250);
      });
    });

    var form = document.getElementById("whatsapp-form");
    if (form) {
      form.addEventListener("submit", function () {
        bumpInteraction();
        showToast("Solicitud preparada. WhatsApp se abrira en una nueva pestana.");
      });
    }

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 120) bumpInteraction();
      },
      { passive: true, once: true }
    );
  }

  function init() {
    docEl.classList.add("is-premium");
    wireInteractions();

    if (!state.onboarded) {
      state.onboarded = true;
      saveState();
      window.setTimeout(function () {
        showToast("Modo premium activado. Explora el portafolio y reserva cuando estes listo.");
      }, 650);
    }

    if (window.location.hash === "#contacto") {
      window.setTimeout(focusBookingForm, 350);
    }
  }

  init();
})();
