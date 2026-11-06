(function () {
  "use strict";

  // Click en una postal del catálogo: si es un vehículo real (Supabase) abre
  // su ficha; si es una postal de ejemplo, abre las fotos en el visor a
  // pantalla completa (galeria-visor.js). Delegación sobre #catalog-grid, así
  // funciona tanto con las cards estáticas como con las de catalogo-dinamico.js.

  function boot() {
    ["catalog-grid", "destacados-grid"].forEach(function (gid) {
    var grid = document.getElementById(gid);
    if (!grid) return;
    grid.addEventListener("click", function (e) {
      if (e.target.closest("a")) return; // no interceptar WhatsApp
      if (e.target.closest("[data-ver-fotos]")) return; // lo maneja el visor
      var card = e.target.closest("[data-vehicle-card]");
      if (!card) return;
      var id = card.getAttribute("data-id");
      var href = card.getAttribute("data-href");
      if (id || href) {
        window.location.href = href || "vehiculo.html?id=" + encodeURIComponent(id);
        return;
      }
      if (window.AOVisor) window.AOVisor.desdeCard(card);
    });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      try { boot(); } catch (e) { console.warn("[catalogo-lightbox]", e); }
    });
  } else {
    try { boot(); } catch (e) { console.warn("[catalogo-lightbox]", e); }
  }
})();
