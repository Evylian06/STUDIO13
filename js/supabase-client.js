(function () {
  "use strict";

  window.getSupabaseClient = function () {
    if (window.__supabaseClient) return window.__supabaseClient;

    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;

    if (!url || !key || typeof window.supabase === "undefined") {
      return null;
    }

    window.__supabaseClient = window.supabase.createClient(url, key);
    return window.__supabaseClient;
  };

  window.isSupabaseConfigured = function () {
    return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
  };
})();
