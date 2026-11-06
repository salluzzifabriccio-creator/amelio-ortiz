(function () {
  "use strict";
  var $ = Admin.$, $$ = Admin.$$, safe = Admin.safe;
  var vehiculoId = new URLSearchParams(window.location.search).get("id");
  var fotosActuales = []; // fotos ya subidas (modo edición)
  var fotoPortadaId = null;
  var pendientes = []; // {id, file, previewUrl, orden} — elegidas antes de guardar por primera vez
  var pendientesSeq = 0;

  function llenarForm(v) {
    $("#f-tipo").value = v.tipo;
    $("#f-estado").value = v.estado;
    $("#f-marca").value = v.marca;
    $("#f-modelo").value = v.modelo;
    $("#f-anio").value = v.anio;
    $("#f-km").value = v.kilometraje != null ? v.kilometraje : "";
    $("#f-precio").value = v.precio != null ? v.precio : "";
    $("#f-moneda").value = v.moneda || "ARS";
    $("#f-combustible").value = v.combustible || "";
    $("#f-transmision").value = v.transmision || "";
    $("#f-descripcion").value = v.descripcion || "";
    var cats = v.categorias || [];
    $$("#f-categorias input[type=checkbox]").forEach(function (cb) { cb.checked = cats.indexOf(cb.value) !== -1; });
    fotosActuales = v.fotos || [];
    fotoPortadaId = v.foto_portada_id;
    renderFotos();
  }

  function leerForm() {
    var cats = $$("#f-categorias input[type=checkbox]").filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.value; });
    return {
      tipo: $("#f-tipo").value,
      estado: $("#f-estado").value,
      marca: $("#f-marca").value.trim(),
      modelo: $("#f-modelo").value.trim(),
      anio: Number($("#f-anio").value),
      kilometraje: $("#f-km").value === "" ? null : Number($("#f-km").value),
      precio: $("#f-precio").value === "" ? null : Number($("#f-precio").value),
      moneda: $("#f-moneda").value,
      combustible: $("#f-combustible").value.trim() || null,
      transmision: $("#f-transmision").value.trim() || null,
      descripcion: $("#f-descripcion").value.trim() || null,
      categorias: cats,
    };
  }

  function renderFotos() {
    if (vehiculoId) {
      renderFotosPersistidas();
    } else {
      renderFotosPendientes();
    }
  }

  function renderFotosPersistidas() {
    var grid = $("#fotos-grid");
    var ordenadas = fotosActuales.slice().sort(function (a, b) { return a.orden - b.orden; });
    grid.innerHTML = ordenadas.map(function (f, i) {
      var esPortada = f.id === fotoPortadaId || (!fotoPortadaId && i === 0);
      return (
        '<div class="relative overflow-hidden rounded-lg border ' + (esPortada ? "border-orange-400 ring-2 ring-orange-300" : "border-slate-200") + '">' +
        '<img src="' + f.url + '" alt="" class="h-28 w-full object-cover" />' +
        (esPortada ? '<span class="absolute left-1.5 top-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">★ Portada</span>' : "") +
        '<div class="flex items-center justify-between gap-1 bg-white p-1.5">' +
        '<button type="button" class="btn-mover rounded p-1 text-slate-500 hover:bg-slate-100" data-id="' + f.id + '" data-dir="-1" title="Mover antes"><i data-lucide="arrow-left" class="h-3.5 w-3.5"></i></button>' +
        (esPortada ? "" : '<button type="button" class="btn-portada rounded px-1.5 py-1 text-[11px] font-medium text-orange-600 hover:bg-orange-50" data-id="' + f.id + '">Portada</button>') +
        '<button type="button" class="btn-mover rounded p-1 text-slate-500 hover:bg-slate-100" data-id="' + f.id + '" data-dir="1" title="Mover después"><i data-lucide="arrow-right" class="h-3.5 w-3.5"></i></button>' +
        '<button type="button" class="btn-eliminar-foto rounded p-1 text-red-500 hover:bg-red-50" data-id="' + f.id + '" data-path="' + f.storage_path + '" title="Eliminar"><i data-lucide="trash-2" class="h-3.5 w-3.5"></i></button>' +
        "</div></div>"
      );
    }).join("");

    $$(".btn-mover", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { moverFoto(btn.dataset.id, Number(btn.dataset.dir)); });
    });
    $$(".btn-portada", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { marcarPortada(btn.dataset.id); });
    });
    $$(".btn-eliminar-foto", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { eliminarFoto(btn.dataset.id, btn.dataset.path); });
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function renderFotosPendientes() {
    var grid = $("#fotos-grid");
    var ordenadas = pendientes.slice().sort(function (a, b) { return a.orden - b.orden; });
    grid.innerHTML = ordenadas.map(function (p, i) {
      var esPortada = i === 0;
      return (
        '<div class="relative overflow-hidden rounded-lg border ' + (esPortada ? "border-orange-400 ring-2 ring-orange-300" : "border-slate-200") + '">' +
        '<img src="' + p.previewUrl + '" alt="" class="h-28 w-full object-cover" />' +
        (esPortada ? '<span class="absolute left-1.5 top-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">★ Portada</span>' : "") +
        '<div class="flex items-center justify-between gap-1 bg-white p-1.5">' +
        '<button type="button" class="btn-mover-p rounded p-1 text-slate-500 hover:bg-slate-100" data-id="' + p.id + '" data-dir="-1" title="Mover antes"><i data-lucide="arrow-left" class="h-3.5 w-3.5"></i></button>' +
        '<span class="text-[10px] text-slate-400">Pendiente</span>' +
        '<button type="button" class="btn-mover-p rounded p-1 text-slate-500 hover:bg-slate-100" data-id="' + p.id + '" data-dir="1" title="Mover después"><i data-lucide="arrow-right" class="h-3.5 w-3.5"></i></button>' +
        '<button type="button" class="btn-quitar-p rounded p-1 text-red-500 hover:bg-red-50" data-id="' + p.id + '" title="Quitar"><i data-lucide="x" class="h-3.5 w-3.5"></i></button>' +
        "</div></div>"
      );
    }).join("");

    $$(".btn-mover-p", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { moverPendiente(btn.dataset.id, Number(btn.dataset.dir)); });
    });
    $$(".btn-quitar-p", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { quitarPendiente(btn.dataset.id); });
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function moverFoto(id, dir) {
    var ordenadas = fotosActuales.slice().sort(function (a, b) { return a.orden - b.orden; });
    var idx = ordenadas.findIndex(function (f) { return f.id === id; });
    var swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ordenadas.length) return;
    var tmp = ordenadas[idx].orden;
    ordenadas[idx].orden = ordenadas[swapIdx].orden;
    ordenadas[swapIdx].orden = tmp;
    fotosActuales = ordenadas;
    renderFotos();
    VehiculosRepo.reordenarFotos(ordenadas.map(function (f) { return { id: f.id, orden: f.orden }; })).catch(function (e) {
      alert("No se pudo reordenar: " + (e.message || e));
    });
  }

  function marcarPortada(id) {
    fotoPortadaId = id;
    renderFotos();
    VehiculosRepo.marcarPortada(vehiculoId, id).catch(function (e) {
      alert("No se pudo marcar la portada: " + (e.message || e));
    });
  }

  function eliminarFoto(id, path) {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    VehiculosRepo.eliminarFoto(id, path)
      .then(function () {
        fotosActuales = fotosActuales.filter(function (f) { return f.id !== id; });
        if (fotoPortadaId === id) fotoPortadaId = null;
        renderFotos();
      })
      .catch(function (e) { alert("No se pudo eliminar la foto: " + (e.message || e)); });
  }

  function moverPendiente(id, dir) {
    var ordenadas = pendientes.slice().sort(function (a, b) { return a.orden - b.orden; });
    var idx = ordenadas.findIndex(function (p) { return p.id === id; });
    var swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ordenadas.length) return;
    var tmp = ordenadas[idx].orden;
    ordenadas[idx].orden = ordenadas[swapIdx].orden;
    ordenadas[swapIdx].orden = tmp;
    pendientes = ordenadas;
    renderFotos();
  }

  function quitarPendiente(id) {
    var p = pendientes.filter(function (p) { return p.id === id; })[0];
    if (p) URL.revokeObjectURL(p.previewUrl);
    pendientes = pendientes.filter(function (p) { return p.id !== id; });
    renderFotos();
  }

  function agregarPendientes(files) {
    var base = pendientes.length ? Math.max.apply(null, pendientes.map(function (p) { return p.orden; })) + 1 : 0;
    Array.prototype.forEach.call(files, function (file, i) {
      pendientesSeq += 1;
      pendientes.push({ id: "p" + pendientesSeq, file: file, previewUrl: URL.createObjectURL(file), orden: base + i });
    });
    renderFotos();
  }

  function subirFotos(files) {
    var label = $("#upload-label");
    label.textContent = "Subiendo " + files.length + " foto(s)…";
    var siguienteOrden = fotosActuales.length ? Math.max.apply(null, fotosActuales.map(function (f) { return f.orden; })) + 1 : 0;

    var promesas = Array.prototype.map.call(files, function (file, i) {
      return VehiculosRepo.subirFoto(vehiculoId, file, siguienteOrden + i);
    });

    Promise.all(promesas)
      .then(function (nuevas) {
        fotosActuales = fotosActuales.concat(nuevas);
        label.textContent = "Hacé clic para elegir fotos (podés elegir varias)";
        renderFotos();
      })
      .catch(function (e) {
        label.textContent = "Hacé clic para elegir fotos (podés elegir varias)";
        alert("No se pudieron subir todas las fotos: " + (e.message || e));
      });
  }

  function guardar(e) {
    e.preventDefault();
    var btn = $("#submit-btn");
    btn.disabled = true;
    btn.textContent = "Guardando…";
    var datos = leerForm();

    if (vehiculoId) {
      VehiculosRepo.actualizar(vehiculoId, datos)
        .then(function () {
          btn.disabled = false;
          btn.textContent = "Guardar";
          var feedback = $("#save-feedback");
          feedback.textContent = "¡Guardado!";
          feedback.classList.remove("hidden");
          setTimeout(function () { feedback.classList.add("hidden"); }, 2500);
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = "Guardar";
          alert("No se pudo guardar: " + (err.message || err));
        });
      return;
    }

    VehiculosRepo.crear(datos)
      .then(function (fila) {
        if (!pendientes.length) {
          window.location.href = "admin-vehiculo-form.html?id=" + fila.id;
          return;
        }
        btn.textContent = "Subiendo fotos…";
        var ordenadas = pendientes.slice().sort(function (a, b) { return a.orden - b.orden; });
        var promesas = ordenadas.map(function (p, i) { return VehiculosRepo.subirFoto(fila.id, p.file, i); });
        return Promise.all(promesas)
          .then(function () {
            window.location.href = "admin-vehiculo-form.html?id=" + fila.id;
          })
          .catch(function (err) {
            alert('El vehículo se guardó, pero hubo un problema subiendo alguna foto: ' + (err.message || err) + ". Podés reintentar desde la edición.");
            window.location.href = "admin-vehiculo-form.html?id=" + fila.id;
          });
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = "Guardar";
        alert("No se pudo guardar: " + (err.message || err));
      });
  }

  function cargarSiExiste() {
    if (!vehiculoId) return;
    $("#page-title").textContent = "Editar vehículo";
    VehiculosRepo.obtener(vehiculoId)
      .then(function (v) {
        if (!v) { alert("No se encontró el vehículo."); window.location.href = "admin-index.html"; return; }
        llenarForm(v);
      })
      .catch(function (e) { alert("No se pudo cargar el vehículo: " + (e.message || e)); });
  }

  function boot() {
    Admin.requireAuth(function () {
      safe(Admin.initLogout, "initLogout");
      safe(cargarSiExiste, "cargarSiExiste");
      $("#vehiculo-form").addEventListener("submit", function (e) { safe(function () { guardar(e); }, "guardar"); });
      $("#f-fotos-input").addEventListener("change", function (e) {
        if (!e.target.files.length) return;
        if (vehiculoId) {
          subirFotos(e.target.files);
        } else {
          agregarPendientes(e.target.files);
        }
        e.target.value = "";
      });
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { safe(boot, "boot"); });
  } else {
    safe(boot, "boot");
  }
})();
