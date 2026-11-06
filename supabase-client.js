(function () {
  "use strict";

  // La anon key es pública por diseño (se usa en el navegador); la seguridad
  // real la da Row Level Security en la base, no esta key.
  var SUPABASE_URL = "https://cxpkloyhmdnpoqfawefk.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cGtsb3lobWRucG9xZmF3ZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQyNzMsImV4cCI6MjEwODM0MDI3M30.b1Uj13USJMcaemOapipKo39iouHtm6H6sU6Vl9SB_vc";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.warn("[supabase-client] supabase-js no cargó, el catálogo sigue con los datos estáticos.");
    return;
  }

  if (SUPABASE_URL.indexOf("TU-PROYECTO") !== -1) {
    console.warn("[supabase-client] Falta configurar SUPABASE_URL/SUPABASE_KEY en supabase-client.js.");
    return;
  }

  try {
    window.__SUPABASE__ = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.warn("[supabase-client]", e);
  }
})();
