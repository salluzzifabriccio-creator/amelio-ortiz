(function () {
  "use strict";
  var $ = Admin.$, $$ = Admin.$$, safe = Admin.safe;
  var todos = [];

  function render() {
    var q = $("#filter-search").value.trim().toLowerCase();
    var tipo = $("#filter-tipo").value;
    var estado = $("#filter-estado").value;

    var filtrados = todos.filter(function (v) {
      if (tipo && v.tipo !== tipo) return false;
      if (estado && v.estado !== estado) return false;
      if (q) {
        var texto = (v.marca + " " + v.modelo).toLowerCase();
        if (texto.indexOf(q) === -1) return false;
      }
      return true;
    });

    var list = $("#list");
    list.innerHTML = filtrados.map(rowHtml).join("");
    $("#empty-state").classList.toggle("hidden", filtrados.length !== 0);
    $("#result-count").textContent = filtrados.length + " vehículo" + (filtrados.length === 1 ? "" : "s");

    $$(".btn-eliminar", list).forEach(function (btn) {
      btn.addEventListener("click", function () { onEliminar(btn.dataset.id, btn.dataset.nombre); });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function rowHtml(v) {
    var img = v.fotoPortadaUrl
      ? '<img src="' + v.fotoPortadaUrl + '" alt="" class="h-16 w-20 rounded-lg object-cover" />'
      : '<div class="flex h-16 w-20 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><i data-lucide="image-off" class="h-5 w-5"></i></div>';
    var cats = (v.categorias || []).map(function (c) {
      return '<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">' + Admin.categoriaLabel(c) + "</span>";
    }).join(" ");
    return (
      '<div class="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">' +
      img +
      '<div class="min-w-[180px] flex-1">' +
      '<p class="font-display text-base font-bold text-slate-900">' + esc(v.marca) + " " + esc(v.modelo) + " <span class=\"font-semibold text-slate-400\">" + v.anio + "</span></p>" +
      '<p class="mt-1 text-sm text-slate-500">' + (v.tipo === "moto" ? "Moto" : "Auto") + " · " + esc(v.kilometraje ? Number(v.kilometraje).toLocaleString("es-AR") + " km" : "0 km") + " · " + Admin.money(v.precio, v.moneda) + "</p>" +
      '<div class="mt-2 flex flex-wrap gap-1.5">' + cats + "</div>" +
      "</div>" +
      '<span class="rounded-full px-3 py-1 text-xs font-semibold ' + Admin.estadoBadgeClass(v.estado) + '">' + Admin.estadoLabel(v.estado) + "</span>" +
      '<div class="flex items-center gap-2">' +
      '<a href="admin-vehiculo-form.html?id=' + v.id + '" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Editar</a>' +
      '<button type="button" class="btn-eliminar rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" data-id="' + v.id + '" data-nombre="' + esc(v.marca + " " + v.modelo) + '">Eliminar</button>' +
      "</div>" +
      "</div>"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function onEliminar(id, nombre) {
    if (!window.confirm('¿Eliminar "' + nombre + '"? Esto borra también sus fotos. No se puede deshacer.')) return;
    VehiculosRepo.eliminar(id)
      .then(function () {
        todos = todos.filter(function (v) { return v.id !== id; });
        render();
      })
      .catch(function (e) {
        alert("No se pudo eliminar: " + (e.message || e));
      });
  }

  function cargar() {
    VehiculosRepo.listar()
      .then(function (data) {
        if (data === null) {
          $("#result-count").textContent = "Sin conexión a Supabase.";
          return;
        }
        todos = data;
        render();
      })
      .catch(function (e) {
        $("#result-count").textContent = "Error al cargar: " + (e.message || e);
      });
  }

  function boot() {
    Admin.requireAuth(function () {
      safe(cargar, "cargar");
      safe(Admin.initLogout, "initLogout");
      $("#filter-search").addEventListener("input", render);
      $("#filter-tipo").addEventListener("change", render);
      $("#filter-estado").addEventListener("change", render);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { safe(boot, "boot"); });
  } else {
    safe(boot, "boot");
  }
})();
