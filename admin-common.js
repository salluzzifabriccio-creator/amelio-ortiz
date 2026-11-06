(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  // Los "value" tienen que coincidir con los que usa el filtro del catálogo
  // público (main.js: vehicleMatches / data-tab), que están en plural.
  var CATEGORIAS = [
    { value: "0km", label: "Autos 0KM" },
    { value: "seminuevos", label: "Seminuevo" },
    { value: "financiados", label: "Financiado" },
  ];

  var ESTADOS = [
    { value: "disponible", label: "Disponible" },
    { value: "reservado", label: "Reservado" },
    { value: "vendido", label: "Vendido" },
  ];

  // Redirige a login.html si no hay sesión. Llama a onReady(session) si sí la hay.
  // Devuelve el cliente de supabase por conveniencia (o null si no está configurado).
  function requireAuth(onReady) {
    var sb = window.__SUPABASE__;
    if (!sb) {
      alert("No se pudo conectar con Supabase. Revisá supabase-client.js.");
      return null;
    }
    sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) {
        window.location.href = "admin-login.html";
        return;
      }
      onReady(session, sb);
    });
    return sb;
  }

  function initLogout() {
    var btn = $("#logout-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var sb = window.__SUPABASE__;
      if (!sb) return;
      sb.auth.signOut().then(function () {
        window.location.href = "admin-login.html";
      });
    });
  }

  function estadoBadgeClass(estado) {
    if (estado === "disponible") return "bg-emerald-100 text-emerald-700";
    if (estado === "reservado") return "bg-amber-100 text-amber-700";
    if (estado === "vendido") return "bg-slate-200 text-slate-600";
    return "bg-slate-100 text-slate-600";
  }

  function estadoLabel(estado) {
    var found = ESTADOS.filter(function (e) { return e.value === estado; })[0];
    return found ? found.label : estado;
  }

  function categoriaLabel(cat) {
    var found = CATEGORIAS.filter(function (c) { return c.value === cat; })[0];
    return found ? found.label : cat;
  }

  function money(precio, moneda) {
    if (precio === null || precio === undefined || precio === "") return "Consultar precio";
    var n = Number(precio);
    if (isNaN(n)) return "Consultar precio";
    var formatted = n.toLocaleString("es-AR");
    return (moneda === "USD" ? "USD " : "$") + formatted;
  }

  window.Admin = {
    $: $,
    $$: $$,
    safe: safe,
    CATEGORIAS: CATEGORIAS,
    ESTADOS: ESTADOS,
    requireAuth: requireAuth,
    initLogout: initLogout,
    estadoBadgeClass: estadoBadgeClass,
    estadoLabel: estadoLabel,
    categoriaLabel: categoriaLabel,
    money: money,
  };
})();
