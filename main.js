(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  // Estado único de filtros — panel de filtros del catálogo, buscador del
  // header y accesos directos del nav escriben acá. Los arrays vacíos
  // significan "sin filtro" en esa dimensión (se muestra todo).
  var state = {
    tipos: [], condiciones: [], marcas: [], transmisiones: [], combustibles: [],
    anioMin: null, anioMax: null, precioMin: null, precioMax: null, query: ""
  };
  var anioRange = null;
  var precioRange = null;

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function initNav() {
    var toggle = $("#menu-toggle");
    var menu = $("#mobile-menu");
    var iconOpen = $("#icon-menu-open");
    var iconClose = $("#icon-menu-close");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      if (iconOpen) iconOpen.classList.toggle("hidden", open);
      if (iconClose) iconClose.classList.toggle("hidden", !open);
    }

    toggle.addEventListener("click", function () {
      setOpen(menu.classList.contains("hidden"));
    });
    $$("#mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function initHeaderScroll() {
    var header = $("#site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // Postal del hero: se da vuelta para mostrar el dorso escrito a mano.
  // La cara oculta sale del orden de tabulación y del árbol de accesibilidad.
  function initHeroPostal() {
    var postal = $("#hero-postal");
    if (!postal) return;
    var frente = $(".hero-cara--frente", postal);
    var dorso = $(".hero-cara--dorso", postal);

    function setFlipped(flipped) {
      postal.classList.toggle("is-flipped", flipped);
      frente.setAttribute("aria-hidden", String(flipped));
      dorso.setAttribute("aria-hidden", String(!flipped));
      $$("a, button", frente).forEach(function (el) { el.tabIndex = flipped ? -1 : 0; });
      $$("a, button", dorso).forEach(function (el) { el.tabIndex = flipped ? 0 : -1; });
    }

    $$("[data-flip]", postal).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var flipped = !postal.classList.contains("is-flipped");
        setFlipped(flipped);
        var target = flipped ? $("[data-flip]", dorso) : $("[data-flip]", frente);
        if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, reduced ? 0 : 450);
      });
    });
  }

  function getCatalogCards() {
    return $$("#catalog-grid [data-vehicle-card]");
  }

  function vehicleMatches(card) {
    var vType = card.dataset.type || "";
    var vBrand = card.dataset.brand || "";
    var vYear = parseInt(card.dataset.year, 10);
    var vCategory = " " + (card.dataset.category || "") + " ";
    var vTrans = card.dataset.transmision || "";
    var vComb = card.dataset.combustible || "";
    var vPrice = card.dataset.price ? parseFloat(card.dataset.price) : null;

    if (state.tipos.length && state.tipos.indexOf(vType) === -1) return false;

    if (state.condiciones.length) {
      var okCond = state.condiciones.some(function (c) { return vCategory.indexOf(" " + c + " ") !== -1; });
      if (!okCond) return false;
    }

    if (state.marcas.length && state.marcas.indexOf(vBrand) === -1) return false;
    if (state.transmisiones.length && state.transmisiones.indexOf(vTrans) === -1) return false;
    if (state.combustibles.length && state.combustibles.indexOf(vComb) === -1) return false;

    if (!isNaN(vYear)) {
      if (state.anioMin != null && vYear < state.anioMin) return false;
      if (state.anioMax != null && vYear > state.anioMax) return false;
    }

    if (vPrice != null) {
      if (state.precioMin != null && vPrice < state.precioMin) return false;
      if (state.precioMax != null && vPrice > state.precioMax) return false;
    }

    if (state.query) {
      var titleEl = card.querySelector("h3");
      var haystack = ((titleEl ? titleEl.textContent : "") + " " + vBrand).toLowerCase();
      if (haystack.indexOf(state.query.toLowerCase()) === -1) return false;
    }

    return true;
  }

  function applyFilters() {
    var cards = getCatalogCards();
    var visibleCount = 0;
    cards.forEach(function (card) {
      var ok = vehicleMatches(card);
      card.classList.toggle("hidden", !ok);
      if (ok) visibleCount++;
    });
    var emptyState = $("#catalog-empty");
    if (emptyState) emptyState.classList.toggle("hidden", visibleCount !== 0);
    applySort();
  }

  // Reordena las cards del catálogo según #filtro-orden. Los vehículos sin
  // precio/año (dato inexistente) quedan siempre al final, sin importar el
  // sentido del orden elegido.
  function applySort() {
    var select = $("#filtro-orden");
    if (!select || select.value === "relevancia") return;
    var grid = $("#catalog-grid");
    if (!grid) return;
    var mode = select.value;
    var items = getCatalogCards().map(function (c) {
      var price = c.dataset.price ? parseFloat(c.dataset.price) : null;
      var year = parseInt(c.dataset.year, 10);
      return { el: c, price: price, year: isNaN(year) ? null : year };
    });
    items.sort(function (a, b) {
      if (mode.indexOf("precio") === 0) {
        var aHas = a.price != null, bHas = b.price != null;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (!aHas) return 0;
        return mode === "precio-asc" ? a.price - b.price : b.price - a.price;
      }
      if (mode.indexOf("anio") === 0) {
        var aY = a.year != null, bY = b.year != null;
        if (aY !== bY) return aY ? -1 : 1;
        if (!aY) return 0;
        return mode === "anio-asc" ? a.year - b.year : b.year - a.year;
      }
      return 0;
    });
    items.forEach(function (item) { grid.appendChild(item.el); });
  }

  // -----------------------------------------------------------------
  // Panel de filtros del catálogo (tipo, condición, marca, transmisión,
  // combustible, año y precio). Marca/transmisión/combustible se arman
  // dinámicamente a partir de lo que haya realmente en las cards, así no
  // hace falta mantener listas a mano cuando cambia el stock.
  // -----------------------------------------------------------------

  function uniqueValues(cards, attr) {
    var seen = {};
    var out = [];
    cards.forEach(function (c) {
      var v = c.dataset[attr];
      if (v && !seen[v]) { seen[v] = true; out.push(v); }
    });
    out.sort(function (a, b) { return a.localeCompare(b, "es"); });
    return out;
  }

  function initStaticCheckboxGroup(className, stateKey) {
    $$("." + className).forEach(function (cb) {
      cb.addEventListener("change", function () {
        state[stateKey] = $$("." + className).filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
        applyFilters();
      });
    });
  }

  function buildCheckboxGroup(containerSel, values, className, stateKey) {
    var container = $(containerSel);
    if (!container) return;
    if (!values.length) {
      container.innerHTML = '<p class="text-xs text-[#4a5474]">Sin datos por ahora</p>';
      return;
    }
    container.innerHTML = values.map(function (v) {
      var esc = v.replace(/"/g, "&quot;");
      return (
        '<label class="flex items-center gap-2.5 text-sm text-[#17203a]">' +
        '<input type="checkbox" value="' + esc + '" class="' + className + '" /> ' + esc +
        "</label>"
      );
    }).join("");
    $$("." + className, container).forEach(function (cb) {
      cb.addEventListener("change", function () {
        state[stateKey] = $$("." + className, container).filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
        applyFilters();
      });
    });
  }

  // Slider de doble punta reutilizable (Año, Precio). Los listeners se
  // registran una sola vez (guardados con data-wired); updateBounds() se
  // puede volver a llamar después (ej. cuando llegan datos de Supabase)
  // para recalcular el rango sin duplicar listeners.
  function createDualRange(opts) {
    var bounds = { min: 0, max: 1 };
    var rangeMin = $(opts.rangeMinId), rangeMax = $(opts.rangeMaxId);
    var numMin = $(opts.minInputId), numMax = $(opts.maxInputId);
    var fill = $(opts.fillId);
    if (!rangeMin || !rangeMax) return { updateBounds: function () {}, reset: function () {} };

    function updateFill() {
      var lo = parseFloat(rangeMin.value), hi = parseFloat(rangeMax.value);
      var span = (bounds.max - bounds.min) || 1;
      var pctLo = ((lo - bounds.min) / span) * 100;
      var pctHi = ((hi - bounds.min) / span) * 100;
      if (fill) { fill.style.left = pctLo + "%"; fill.style.right = (100 - pctHi) + "%"; }
    }

    function commit() {
      var lo = parseFloat(rangeMin.value), hi = parseFloat(rangeMax.value);
      if (lo > hi) { var t = lo; lo = hi; hi = t; rangeMin.value = String(lo); rangeMax.value = String(hi); }
      state[opts.stateMinKey] = lo <= bounds.min ? null : lo;
      state[opts.stateMaxKey] = hi >= bounds.max ? null : hi;
      if (numMin) numMin.value = lo <= bounds.min ? "" : String(lo);
      if (numMax) numMax.value = hi >= bounds.max ? "" : String(hi);
      updateFill();
      applyFilters();
    }

    function updateBounds(min, max) {
      min = Math.floor(min); max = Math.ceil(max);
      if (min === max) max = min + (opts.step || 1);
      bounds.min = min; bounds.max = max;
      [rangeMin, rangeMax].forEach(function (el) { el.min = String(min); el.max = String(max); el.step = String(opts.step || 1); });
      rangeMin.value = String(min); rangeMax.value = String(max);
      if (numMin) { numMin.placeholder = String(min); numMin.value = ""; }
      if (numMax) { numMax.placeholder = String(max); numMax.value = ""; }
      state[opts.stateMinKey] = null; state[opts.stateMaxKey] = null;
      updateFill();
    }

    if (!rangeMin.dataset.wired) {
      rangeMin.dataset.wired = "1"; rangeMax.dataset.wired = "1";
      rangeMin.addEventListener("input", function () {
        if (parseFloat(rangeMin.value) > parseFloat(rangeMax.value)) rangeMin.value = rangeMax.value;
        updateFill();
      });
      rangeMax.addEventListener("input", function () {
        if (parseFloat(rangeMax.value) < parseFloat(rangeMin.value)) rangeMax.value = rangeMin.value;
        updateFill();
      });
      rangeMin.addEventListener("change", commit);
      rangeMax.addEventListener("change", commit);
      if (numMin) numMin.addEventListener("change", function () {
        var v = numMin.value === "" ? bounds.min : parseFloat(numMin.value);
        if (isNaN(v)) v = bounds.min;
        v = Math.max(bounds.min, Math.min(bounds.max, v));
        rangeMin.value = String(v);
        if (v > parseFloat(rangeMax.value)) rangeMax.value = String(v);
        commit();
      });
      if (numMax) numMax.addEventListener("change", function () {
        var v = numMax.value === "" ? bounds.max : parseFloat(numMax.value);
        if (isNaN(v)) v = bounds.max;
        v = Math.max(bounds.min, Math.min(bounds.max, v));
        rangeMax.value = String(v);
        if (v < parseFloat(rangeMin.value)) rangeMin.value = String(v);
        commit();
      });
    }

    updateFill();
    return { updateBounds: updateBounds, reset: function () { updateBounds(bounds.min, bounds.max); } };
  }

  // Recalcula las opciones de marca/transmisión/combustible y los rangos de
  // año/precio a partir de las cards que haya en pantalla en ese momento.
  // Se llama al boot y de nuevo cada vez que catalogo-dinamico.js reemplaza
  // las cards de ejemplo por las reales de Supabase (vía NQ_REFILTER).
  function refreshFiltrosDatos() {
    if (!$("#filtros-panel")) return;
    var cards = getCatalogCards();

    buildCheckboxGroup("#filtro-marca-opciones", uniqueValues(cards, "brand"), "filtro-marca", "marcas");
    buildCheckboxGroup("#filtro-transmision-opciones", uniqueValues(cards, "transmision"), "filtro-transmision", "transmisiones");
    buildCheckboxGroup("#filtro-combustible-opciones", uniqueValues(cards, "combustible"), "filtro-combustible", "combustibles");

    var years = cards.map(function (c) { return parseInt(c.dataset.year, 10); }).filter(function (v) { return !isNaN(v); });
    var yMin = years.length ? Math.min.apply(null, years) : 2000;
    var yMax = years.length ? Math.max.apply(null, years) : (new Date().getFullYear() + 1);
    if (anioRange) anioRange.updateBounds(yMin, yMax);

    var prices = cards.map(function (c) { return c.dataset.price ? parseFloat(c.dataset.price) : null; }).filter(function (v) { return v != null && !isNaN(v); });
    var pMin = prices.length ? Math.min.apply(null, prices) : 0;
    var pMax = prices.length ? Math.max.apply(null, prices) : 30000000;
    if (precioRange) precioRange.updateBounds(pMin, pMax);
  }

  function initFiltrosSidebar() {
    var panel = $("#filtros-panel");
    if (!panel) return;

    initStaticCheckboxGroup("filtro-tipo", "tipos");
    initStaticCheckboxGroup("filtro-condicion", "condiciones");

    var buscar = $("#filtro-buscar");
    if (buscar) buscar.addEventListener("input", function () {
      state.query = buscar.value.trim();
      applyFilters();
    });

    var orden = $("#filtro-orden");
    if (orden) orden.addEventListener("change", applyFilters);

    anioRange = createDualRange({
      rangeMinId: "#anio-range-min", rangeMaxId: "#anio-range-max",
      minInputId: "#anio-desde-input", maxInputId: "#anio-hasta-input",
      fillId: "#anio-slider-fill", stateMinKey: "anioMin", stateMaxKey: "anioMax", step: 1
    });
    precioRange = createDualRange({
      rangeMinId: "#precio-range-min", rangeMaxId: "#precio-range-max",
      minInputId: "#precio-desde-input", maxInputId: "#precio-hasta-input",
      fillId: "#precio-slider-fill", stateMinKey: "precioMin", stateMaxKey: "precioMax", step: 50000
    });

    refreshFiltrosDatos();

    var limpiar = $("#filtros-limpiar");
    if (limpiar) limpiar.addEventListener("click", function () {
      $$(".filtro-tipo, .filtro-condicion, .filtro-marca, .filtro-transmision, .filtro-combustible").forEach(function (cb) { cb.checked = false; });
      state.tipos = []; state.condiciones = []; state.marcas = []; state.transmisiones = []; state.combustibles = []; state.query = "";
      if (buscar) buscar.value = "";
      if (orden) orden.value = "relevancia";
      if (anioRange) anioRange.reset();
      if (precioRange) precioRange.reset();
      applyFilters();
    });

    var toggleMobile = $("#filtros-toggle-mobile");
    var cerrarMobile = $("#filtros-cerrar-mobile");
    if (toggleMobile) toggleMobile.addEventListener("click", function () {
      panel.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    });
    if (cerrarMobile) cerrarMobile.addEventListener("click", function () {
      panel.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    });
    panel.addEventListener("click", function (e) {
      if (e.target === panel) {
        panel.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    });
  }

  // Buscador de texto libre del header (aparece en las 5 páginas, versión
  // desktop y versión mobile). Siempre redirige/recarga catalogo.html con
  // ?q=, que ahí se lee y aplica sobre el listado ya renderizado.
  function initHeaderSearch() {
    $$(".header-search-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector(".header-search-input");
        var q = input ? input.value.trim() : "";
        window.location.href = "catalogo.html" + (q ? "?q=" + encodeURIComponent(q) : "");
      });
    });
  }

  // En catalogo.html: si llegamos con ?tipo=&marca=&q= (desde el buscador
  // del header, el buscador del home o un link "Motos"), pre-aplica esos
  // filtros al cargar y marca las casillas correspondientes en el panel.
  function initUrlFilters() {
    var grid = $("#catalog-grid");
    if (!grid) return;
    var params = new URLSearchParams(window.location.search);
    var tipo = params.get("tipo");
    var marca = params.get("marca");
    var q = params.get("q");
    if (!tipo && !marca && !q) return;
    if (tipo === "auto" || tipo === "moto") {
      state.tipos = [tipo];
      $$(".filtro-tipo").forEach(function (cb) { cb.checked = cb.value === tipo; });
    }
    if (marca) {
      state.marcas = [marca];
      $$(".filtro-marca").forEach(function (cb) { cb.checked = cb.value === marca; });
    }
    if (q) {
      state.query = q;
      $$(".header-search-input").forEach(function (input) { input.value = q; });
      var buscarInput = $("#filtro-buscar");
      if (buscarInput) buscarInput.value = q;
    }
    applyFilters();
  }

  function scrollToEl(el) {
    var headerEl = $("#site-header");
    var offset = (headerEl ? headerEl.offsetHeight : 0) + 12;
    var top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
  }

  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToEl(target);
      history.pushState(null, "", id);
    });
  }

  function initRevealOnScroll() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: si algo quedó sin revelar (observer no disparó), se fuerza a los 6s.
    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  function initPermutaForm() {
    var form = $("#permuta-form");
    if (!form) return;
    var feedback = $("#permuta-feedback");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var nombre = $("#permuta-nombre").value.trim();
      var telefono = $("#permuta-telefono").value.trim();
      var autoActual = $("#permuta-auto-actual").value.trim();
      var autoInteres = $("#permuta-auto-interes").value;
      var brand = (window.SITE_BRAND && window.SITE_BRAND.whatsapp) || "5493548663333";

      var lines = [
        "Hola Amelio Ortiz, quiero cotizar una permuta / financiación.",
        "Nombre: " + nombre,
        "Teléfono: " + telefono,
        "Mi auto actual: " + autoActual,
        "Me interesa: " + autoInteres
      ];
      var url = "https://wa.me/" + brand + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");

      if (feedback) {
        feedback.textContent = "¡Gracias! Te llevamos a WhatsApp para confirmar los datos.";
        feedback.classList.remove("hidden");
      }
      form.reset();
    });
  }

  // Carrusel de vistas serranas: cambia de foto cada 5s con fundido.
  // Se frena con movimiento reducido o cuando la pestaña no está visible.
  // Video de alquiler: se queda solo si no hay movimiento reducido ni ahorro
  // de datos. Si se saca (o falla al cargar) queda el carrusel de fotos debajo.
  function initVideoAlquiler() {
    $$("[data-video-alquiler]").forEach(function (video) {
      var con = navigator.connection || {};
      var box = video.parentElement;
      function sacar() { video.remove(); if (box) box.removeAttribute("data-con-video"); }
      if (reduced || con.saveData) { sacar(); return; }
      if (box) box.setAttribute("data-con-video", "");
      video.addEventListener("error", sacar, true);
      var p = video.play && video.play();
      if (p && p.catch) p.catch(function () { /* autoplay bloqueado: queda el póster */ });
    });
  }

  function initCarrusel() {
    $$("[data-carrusel]").forEach(function (box) {
      var fotos = $$(".carrusel-foto", box);
      if (fotos.length < 2 || reduced) return;
      if (box.hasAttribute("data-con-video")) return;
      var i = 0;
      setInterval(function () {
        if (document.hidden) return;
        fotos[i].classList.remove("is-activa");
        i = (i + 1) % fotos.length;
        var sig = fotos[i];
        if (sig.loading === "lazy") sig.loading = "eager";
        sig.classList.add("is-activa");
        var prox = fotos[(i + 1) % fotos.length];
        if (prox.loading === "lazy") prox.loading = "eager";
      }, 5000);
    });
  }

  // Postal "¿Buscás un modelo en particular?" del inicio: arma el WhatsApp
  // con lo que la persona escribió, igual que el formulario de permuta.
  function initBuscoForm() {
    var form = $("#busco-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var brand = (window.SITE_BRAND && window.SITE_BRAND.whatsapp) || "5493548663333";
      var anio = form.elements.anio.value.trim();
      var lines = [
        "Hola Amelio Ortiz, estoy buscando un vehículo en particular.",
        "Marca y modelo: " + form.elements.modelo.value.trim(),
      ];
      if (anio) lines.push("Año aproximado: " + anio);
      lines.push("¿Entrego usado?: " + form.elements.usado.value);
      window.open("https://wa.me/" + brand + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }

  function initFooterYear() {
    var el = $("#current-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // Las cards estáticas del catálogo (sin data-id, sin ficha propia en
  // Supabase) no pueden armar su link a vehiculo.html?id=... como hacen las
  // reales. Acá les agregamos, al mensaje de WhatsApp que ya tienen escrito
  // en el HTML, el link a esta misma página del catálogo donde se las ve.
  function initCatalogoWhatsappLinks() {
    var grid = $("#catalog-grid");
    if (!grid) return;
    var pageUrl = window.location.origin + window.location.pathname;
    $$("[data-vehicle-card]", grid).forEach(function (card) {
      if (card.dataset.id) return; // ya arma su propio link con la ficha
      var link = card.querySelector('a[href*="wa.me"]');
      if (!link) return;
      var href = link.getAttribute("href");
      var idx = href.indexOf("text=");
      if (idx === -1) return;
      var textoActual = decodeURIComponent(href.slice(idx + 5));
      if (textoActual.indexOf("Podés ver el auto") !== -1) return;
      var nuevoTexto = textoActual + " Podés ver el auto acá: " + pageUrl;
      link.setAttribute("href", href.slice(0, idx) + "text=" + encodeURIComponent(nuevoTexto));
    });
  }

  function boot() {
    safe(initIcons, "initIcons");
    safe(initNav, "initNav");
    safe(initHeaderScroll, "initHeaderScroll");
    safe(initHeroPostal, "initHeroPostal");
    safe(initFiltrosSidebar, "initFiltrosSidebar");
    safe(initCatalogoWhatsappLinks, "initCatalogoWhatsappLinks");
    safe(initHeaderSearch, "initHeaderSearch");
    safe(applyFilters, "applyFilters");
    safe(initUrlFilters, "initUrlFilters");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initRevealOnScroll, "initRevealOnScroll");
    safe(initPermutaForm, "initPermutaForm");
    safe(initBuscoForm, "initBuscoForm");
    safe(initVideoAlquiler, "initVideoAlquiler");
    safe(initCarrusel, "initCarrusel");
    safe(initFooterYear, "initFooterYear");
    document.documentElement.classList.add("is-ready");
  }

  // Gancho público: lo usa catalogo-dinamico.js después de reemplazar
  // las cards estáticas por las que vienen de Supabase, para que las
  // opciones del panel de filtros (marca/transmisión/combustible/año/precio)
  // y los ?tipo=/marca=/q= de la URL se vuelvan a aplicar sobre los datos reales.
  window.NQ_REFILTER = function () {
    safe(refreshFiltrosDatos, "refreshFiltrosDatos");
    safe(applyFilters, "applyFilters");
    safe(initUrlFilters, "initUrlFilters");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
