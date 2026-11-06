(function () {
  "use strict";

  var WHATSAPP_NUM = (window.SITE_BRAND && window.SITE_BRAND.whatsapp) || "5493548663333";
  var ZOOM = 2.5; // aumento de la lupa
  var fotos = [];
  var miniaturas = [];
  var idx = 0;
  var tituloActual = "";

  // Unidades de ejemplo (sin Supabase): vehiculo.html?demo=cronos
  var DEMOS = {
    cronos: {
      id: null, marca: "Fiat", modelo: "Cronos", anio: 2023, kilometraje: 45000,
      combustible: "GNC", transmision: null, tipo: "auto", estado: "disponible",
      categorias: ["seminuevos"], precio: null, moneda: null, descripcion: null,
      fotos: [2, 3, 1, 4, 5, 6, 7].map(function (n) { return { url: "img/cronos-" + n + ".webp", thumb: "img/cronos-" + n + "-th.webp" }; }),
    },
  };

  function $(sel) { return document.querySelector(sel); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatKm(km) {
    if (km === null || km === undefined || km === "") return null;
    return Number(km).toLocaleString("es-AR") + " km";
  }

  function formatPrecio(precio, moneda) {
    if (precio === null || precio === undefined) return null;
    var n = Number(precio);
    if (isNaN(n)) return null;
    return (moneda === "USD" ? "USD " : "$ ") + n.toLocaleString("es-AR");
  }

  function mostrarEstado(id) {
    ["vd-loading", "vd-not-found", "vd-detalle"].forEach(function (elId) {
      var el = document.getElementById(elId);
      if (el) el.classList.toggle("hidden", elId !== id);
    });
  }

  function render(v) {
    var nombre = v.marca + " " + v.modelo + " " + v.anio;
    tituloActual = nombre;
    document.getElementById("page-title-tag").textContent = nombre + " | Amelio Ortiz";
    $("#vd-migas").textContent = "Catálogo › " + v.marca + " › " + v.modelo;

    var cats = v.categorias || [];
    var meta = [v.anio];
    var km = formatKm(v.kilometraje);
    if (km) meta.push(km);
    meta.push(cats.indexOf("0km") !== -1 ? "0KM" : (v.tipo === "moto" ? "Moto usada" : "Usado"));
    $("#vd-meta").textContent = meta.join(" · ");
    $("#vd-title").textContent = v.marca + " " + v.modelo;

    function estampa(mod, texto) {
      return '<span class="estampa ' + mod + '" style="position:static;">' + texto + "</span>";
    }
    var badges = "";
    if (v.estado === "reservado") badges += estampa("estampa--reservado", "Reservado");
    else if (v.estado === "vendido") badges += estampa("text-[#4a5474]", "Vendido");
    if (cats.indexOf("0km") !== -1) badges += estampa("estampa--0km", "0KM");
    $("#vd-badges").innerHTML = badges;
    $("#vd-badges").classList.toggle("hidden", !badges);

    var specs = [];
    if (km) specs.push("<li><small>Kilómetros</small>" + km.replace(" km", "") + "</li>");
    specs.push("<li><small>Año</small>" + esc(v.anio) + "</li>");
    if (v.combustible) specs.push("<li><small>Combustible</small>" + esc(v.combustible) + "</li>");
    if (v.transmision) specs.push("<li><small>Caja</small>" + esc(v.transmision) + "</li>");
    if (specs.length < 3) specs.push("<li><small>Tipo</small>" + (v.tipo === "moto" ? "Moto" : "Auto") + "</li>");
    $("#vd-specs").innerHTML = specs.slice(0, 3).join("");

    var precio = formatPrecio(v.precio, v.moneda);
    $("#vd-precio").textContent = precio || "Precio a consultar";
    $("#vd-precio").classList.toggle("precio--consultar", !precio);
    $("#vd-financiacion").classList.toggle("hidden", cats.indexOf("financiados") === -1);

    if (v.descripcion) {
      $("#vd-desc").textContent = v.descripcion;
      $("#vd-desc").classList.remove("hidden");
    } else {
      $("#vd-desc").classList.add("hidden");
    }

    var wa = $("#vd-whatsapp");
    if (v.estado === "vendido") {
      wa.textContent = "Vendido";
      wa.setAttribute("aria-disabled", "true");
      wa.removeAttribute("href");
    } else {
      var texto = "Hola Amelio Ortiz, estoy interesado en el " + nombre + " que vi en la web. Podés ver el auto acá: " + window.location.href;
      wa.setAttribute("href", "https://wa.me/" + WHATSAPP_NUM + "?text=" + encodeURIComponent(texto));
    }

    var lista = (v.fotos || []).filter(function (f) { return f && f.url; });
    fotos = lista.map(function (f) { return f.url; });
    miniaturas = lista.map(function (f) { return f.thumb || f.url; });
    if (!fotos.length && v.fotoPortadaUrl) fotos = [v.fotoPortadaUrl];
    idx = 0;
    $("#vd-image").alt = nombre;
    renderTira();
    renderGaleria();

    mostrarEstado("vd-detalle");
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function renderTira() {
    var tira = $("#vd-thumbs");
    if (fotos.length < 2) { tira.innerHTML = ""; tira.hidden = true; return; }
    tira.hidden = false;
    tira.innerHTML = fotos.map(function (url, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + (miniaturas[i] || url) + '" alt="" loading="lazy" decoding="async" /></button>';
    }).join("");
    Array.prototype.forEach.call(tira.querySelectorAll("button"), function (b) {
      var ir = function () { idx = Number(b.dataset.i); renderGaleria(); };
      b.addEventListener("click", ir);
      b.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) ir(); });
    });
  }

  function renderGaleria() {
    $("#vd-image").src = fotos[idx] || "";
    var multi = fotos.length > 1;
    $("#vd-counter").textContent = multi ? (idx + 1) + " / " + fotos.length : "";
    $("#vd-counter").classList.toggle("hidden", !multi);
    $("#vd-prev").classList.toggle("hidden", !multi);
    $("#vd-next").classList.toggle("hidden", !multi);
    Array.prototype.forEach.call($("#vd-thumbs").children, function (b, i) { b.classList.toggle("is-activa", i === idx); });
  }

  function moverFoto(dir) {
    if (fotos.length < 2) return;
    idx = (idx + dir + fotos.length) % fotos.length;
    renderGaleria();
  }

  // Foto en grande: visor compartido a pantalla completa (galeria-visor.js).
  function abrirFullscreen() {
    if (!fotos.length || !window.AOVisor) return;
    var wa = $("#vd-whatsapp");
    window.AOVisor.open(fotos, idx, { titulo: tituloActual, wa: wa && wa.getAttribute("href") });
  }

  // Lupa: al pasar el mouse sobre la foto, un recuadro marca la zona y el
  // panel de la derecha la muestra ampliada (solo escritorio con mouse).
  function initLupa() {
    var esc = $("#vd-escenario"), img = $("#vd-image"), lupa = $("#vd-lupa"), panel = $("#vd-zoom-panel");
    var info = panel.parentElement;
    var puede = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");

    function cajaImagen() {
      // rectángulo real de la foto dentro del escenario (object-fit: contain)
      var r = esc.getBoundingClientRect();
      var nw = img.naturalWidth || 1, nh = img.naturalHeight || 1;
      var s = Math.min(r.width / nw, r.height / nh);
      var w = nw * s, h = nh * s;
      return { x: (r.width - w) / 2, y: (r.height - h) / 2, w: w, h: h, r: r };
    }

    function ocultar() { lupa.hidden = true; panel.hidden = true; }

    esc.addEventListener("mousemove", function (e) {
      if (!puede.matches || !img.naturalWidth || e.target.closest("button")) { ocultar(); return; }
      var c = cajaImagen();
      var mx = e.clientX - c.r.left - c.x, my = e.clientY - c.r.top - c.y;
      if (mx < 0 || my < 0 || mx > c.w || my > c.h) { ocultar(); return; }

      var ir = info.getBoundingClientRect();
      var pw = ir.width, ph = c.r.height;
      var lw = Math.min(c.w, pw / ZOOM), lh = Math.min(c.h, ph / ZOOM);
      var lx = Math.max(0, Math.min(c.w - lw, mx - lw / 2));
      var ly = Math.max(0, Math.min(c.h - lh, my - lh / 2));

      lupa.hidden = false;
      lupa.style.left = (c.x + lx) + "px";
      lupa.style.top = (c.y + ly) + "px";
      lupa.style.width = lw + "px";
      lupa.style.height = lh + "px";

      panel.hidden = false;
      panel.style.left = "0px";
      panel.style.top = "0px";
      panel.style.width = pw + "px";
      panel.style.height = ph + "px";
      panel.style.backgroundImage = 'url("' + img.currentSrc.replace(/"/g, "%22") + '")';
      panel.style.backgroundSize = (c.w * pw / lw) + "px " + (c.h * ph / lh) + "px";
      panel.style.backgroundPosition = (-lx * pw / lw) + "px " + (-ly * ph / lh) + "px";
    });
    esc.addEventListener("mouseleave", ocultar);
    window.addEventListener("scroll", ocultar, { passive: true });
  }

  // Deslizar con el dedo para cambiar de foto (celular).
  function initSwipe() {
    var esc = $("#vd-escenario"), x0 = null, y0 = 0;
    esc.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    esc.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) moverFoto(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  function boot() {
    $("#vd-prev").addEventListener("click", function () { moverFoto(-1); });
    $("#vd-next").addEventListener("click", function () { moverFoto(1); });
    $("#vd-image").addEventListener("click", abrirFullscreen);
    $("#vd-zoom").addEventListener("click", abrirFullscreen);
    document.addEventListener("keydown", function (e) {
      if (document.documentElement.classList.contains("visor-abierto")) return;
      if (e.key === "ArrowLeft") moverFoto(-1);
      if (e.key === "ArrowRight") moverFoto(1);
    });
    initLupa();
    initSwipe();

    var params = new URLSearchParams(window.location.search);
    var demo = params.get("demo");
    if (demo && DEMOS[demo]) { render(DEMOS[demo]); return; }

    var id = params.get("id");
    if (!id || !window.VehiculosRepo) { mostrarEstado("vd-not-found"); return; }
    window.VehiculosRepo.obtener(id)
      .then(function (v) {
        if (!v) { mostrarEstado("vd-not-found"); return; }
        render(v);
      })
      .catch(function (e) {
        console.warn("[vehiculo-detalle]", e);
        mostrarEstado("vd-not-found");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      try { boot(); } catch (e) { console.warn("[vehiculo-detalle]", e); mostrarEstado("vd-not-found"); }
    });
  } else {
    try { boot(); } catch (e) { console.warn("[vehiculo-detalle]", e); mostrarEstado("vd-not-found"); }
  }
})();
