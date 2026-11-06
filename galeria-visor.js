(function () {
  "use strict";

  // Visor de fotos a pantalla completa: contador, zoom, pantalla completa,
  // flechas, tira de miniaturas, teclado y deslizar con el dedo.
  // Uso: window.AOVisor.open(["foto1.jpg", ...], indiceInicial, { titulo, wa })

  var ICON = {
    cerrar: '<path d="M18 6 6 18M6 6l12 12"/>',
    izq: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    der: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/>',
    full: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + "</svg>";
  }
  var WA_PATH = "M16.004 3C9.377 3 4 8.373 4 15c0 2.34.657 4.526 1.797 6.386L4 29l7.86-1.76A11.9 11.9 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.7c-1.94 0-3.75-.57-5.27-1.55l-.378-.24-4.66 1.04 1.07-4.53-.25-.4A9.65 9.65 0 016.35 15c0-5.32 4.33-9.65 9.654-9.65 5.32 0 9.65 4.33 9.65 9.65s-4.33 9.7-9.65 9.7zm5.32-7.23c-.29-.147-1.71-.845-1.977-.94-.266-.098-.46-.147-.653.147-.194.293-.75.94-.92 1.133-.17.194-.34.22-.63.073-.29-.146-1.224-.451-2.332-1.44-.862-.77-1.444-1.72-1.613-2.01-.17-.293-.018-.45.127-.596.13-.13.29-.34.435-.51.146-.17.194-.293.29-.488.098-.196.05-.367-.024-.513-.073-.146-.653-1.573-.895-2.154-.236-.564-.476-.488-.653-.497-.17-.008-.363-.01-.556-.01-.194 0-.51.073-.777.367-.266.293-1.017.994-1.017 2.425 0 1.43 1.04 2.813 1.185 3.008.146.194 2.05 3.13 4.966 4.39.694.3 1.235.478 1.657.611.696.222 1.33.19 1.83.116.558-.083 1.71-.7 1.952-1.377.242-.677.242-1.257.17-1.377-.073-.122-.266-.195-.556-.34z";

  var el = null, fotos = [], idx = 0, zoom = false, ultimoFoco = null;
  var pan = { x: 0, y: 0 };

  function crear() {
    el = document.createElement("div");
    el.className = "visor";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Fotos del vehículo");
    el.hidden = true;
    el.innerHTML =
      '<div class="visor-barra">' +
        '<span class="visor-contador tabular" aria-live="polite"></span>' +
        '<span class="visor-titulo"></span>' +
        '<div class="visor-botones">' +
          '<button type="button" data-v="zoom" aria-label="Acercar">' + svg("zoomIn") + "</button>" +
          '<button type="button" data-v="full" aria-label="Pantalla completa">' + svg("full") + "</button>" +
          '<button type="button" data-v="cerrar" aria-label="Cerrar">' + svg("cerrar") + "</button>" +
        "</div>" +
      "</div>" +
      '<div class="visor-escenario">' +
        '<button type="button" class="visor-flecha visor-flecha--izq" data-v="prev" aria-label="Foto anterior">' + svg("izq") + "</button>" +
        '<img class="visor-img" alt="" draggable="false" />' +
        '<button type="button" class="visor-flecha visor-flecha--der" data-v="next" aria-label="Foto siguiente">' + svg("der") + "</button>" +
      "</div>" +
      '<div class="visor-pie">' +
        '<div class="visor-tira"></div>' +
        '<a class="visor-wa" target="_blank" rel="noopener"><svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="' + WA_PATH + '"/></svg>Consultar por WhatsApp</a>' +
      "</div>";
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v]");
      if (b) {
        var v = b.getAttribute("data-v");
        if (v === "cerrar") cerrar();
        else if (v === "prev") mover(-1);
        else if (v === "next") mover(1);
        else if (v === "zoom") setZoom(!zoom);
        else if (v === "full") pantallaCompleta();
        return;
      }
      var t = e.target.closest("[data-i]");
      if (t) { ir(Number(t.getAttribute("data-i"))); return; }
      if (e.target.classList.contains("visor-escenario")) cerrar();
    });

    var img = el.querySelector(".visor-img");
    img.addEventListener("click", function (e) {
      if (!zoom) {
        var r = img.getBoundingClientRect();
        pan.x = (0.5 - (e.clientX - r.left) / r.width) * r.width;
        pan.y = (0.5 - (e.clientY - r.top) / r.height) * r.height;
        setZoom(true);
      } else setZoom(false);
    });

    // Arrastrar con zoom, deslizar para cambiar de foto sin zoom.
    var inicio = null;
    var esc = el.querySelector(".visor-escenario");
    esc.addEventListener("pointerdown", function (e) {
      inicio = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, movio: false };
    });
    esc.addEventListener("pointermove", function (e) {
      if (!inicio || !zoom) return;
      var dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) inicio.movio = true;
      pan.x = inicio.px + dx; pan.y = inicio.py + dy;
      aplicarTransform();
    });
    esc.addEventListener("pointerup", function (e) {
      if (!inicio) return;
      var dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
      if (!zoom && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mover(dx < 0 ? 1 : -1);
      if (zoom && inicio.movio) {
        // evitar que el click de soltar desactive el zoom
        img.addEventListener("click", function frenar(ev) { ev.stopImmediatePropagation(); img.removeEventListener("click", frenar, true); }, true);
      }
      inicio = null;
    });

    document.addEventListener("keydown", function (e) {
      if (!el || el.hidden) return;
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowLeft") mover(-1);
      else if (e.key === "ArrowRight") mover(1);
      else if (e.key === "Tab") atraparFoco(e);
    });
  }

  function atraparFoco(e) {
    var f = Array.prototype.filter.call(el.querySelectorAll("button, a[href]"), function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }

  function aplicarTransform() {
    var img = el.querySelector(".visor-img");
    img.style.transform = zoom ? "translate(" + pan.x + "px," + pan.y + "px) scale(2.2)" : "";
  }

  function setZoom(on) {
    zoom = on;
    if (!on) { pan.x = 0; pan.y = 0; }
    el.classList.toggle("is-zoom", on);
    var b = el.querySelector('[data-v="zoom"]');
    b.innerHTML = svg(on ? "zoomOut" : "zoomIn");
    b.setAttribute("aria-label", on ? "Alejar" : "Acercar");
    aplicarTransform();
  }

  function pantallaCompleta() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
    } catch (e) { /* sin soporte: el visor ya ocupa toda la ventana */ }
  }

  function render() {
    var multi = fotos.length > 1;
    var img = el.querySelector(".visor-img");
    img.src = fotos[idx];
    el.querySelector(".visor-contador").textContent = (idx + 1) + " / " + fotos.length;
    el.querySelectorAll(".visor-flecha").forEach(function (b) { b.hidden = !multi; });
    var tira = el.querySelector(".visor-tira");
    tira.hidden = !multi;
    Array.prototype.forEach.call(tira.children, function (t, i) {
      t.classList.toggle("is-activa", i === idx);
      if (i === idx) t.scrollIntoView({ block: "nearest", inline: "center" });
    });
    // precargar la siguiente
    if (multi) { var p = new Image(); p.src = fotos[(idx + 1) % fotos.length]; }
  }

  function ir(i) { idx = (i + fotos.length) % fotos.length; setZoom(false); render(); }
  function mover(d) { if (fotos.length > 1) ir(idx + d); }

  function open(lista, inicio, opts) {
    lista = (lista || []).filter(Boolean);
    if (!lista.length) return;
    if (!el) crear();
    opts = opts || {};
    fotos = lista;
    idx = Math.max(0, Math.min(lista.length - 1, inicio || 0));
    el.querySelector(".visor-titulo").textContent = opts.titulo || "";
    var wa = el.querySelector(".visor-wa");
    if (opts.wa) { wa.href = opts.wa; wa.hidden = false; } else { wa.removeAttribute("href"); wa.hidden = true; }
    el.querySelector(".visor-tira").innerHTML = lista.map(function (u, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + u + '" alt="" loading="lazy" /></button>';
    }).join("");
    ultimoFoco = document.activeElement;
    el.hidden = false;
    document.documentElement.classList.add("visor-abierto");
    setZoom(false);
    render();
    el.querySelector('[data-v="cerrar"]').focus();
  }

  function cerrar() {
    if (!el || el.hidden) return;
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    el.hidden = true;
    document.documentElement.classList.remove("visor-abierto");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  // Postales estáticas (sin ficha propia en Supabase): "Ver fotos" abre el visor.
  function datosDeCard(card) {
    var fotosCard = [];
    try { fotosCard = JSON.parse(card.getAttribute("data-photos") || "[]"); } catch (e) {}
    if (!fotosCard.length) { var im = card.querySelector("img"); if (im) fotosCard = [im.src]; }
    var h = card.querySelector("h3");
    var wa = card.querySelector('a[href*="wa.me"]');
    return { fotos: fotosCard, titulo: h ? h.textContent.trim() : "", wa: wa ? wa.getAttribute("href") : "" };
  }

  document.addEventListener("click", function (e) {
    var gatillo = e.target.closest("[data-ver-fotos]");
    if (!gatillo) return;
    var card = gatillo.closest("[data-vehicle-card]");
    if (!card) return;
    e.preventDefault();
    var d = datosDeCard(card);
    open(d.fotos, 0, { titulo: d.titulo, wa: d.wa });
  });

  window.AOVisor = { open: open, close: cerrar, desdeCard: function (card) { var d = datosDeCard(card); open(d.fotos, 0, { titulo: d.titulo, wa: d.wa }); } };
})();
