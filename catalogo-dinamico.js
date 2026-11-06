(function () {
  "use strict";

  // Si hay conexión a Supabase, reemplaza las postales estáticas del catálogo
  // (y las 3 destacadas del inicio) por el stock real. Si no hay conexión, o
  // la tabla está vacía, no toca nada y quedan las unidades de ejemplo.

  var WHATSAPP_NUM = (window.SITE_BRAND && window.SITE_BRAND.whatsapp) || "5493548663333";

  var whatsappIconSvg =
    '<svg viewBox="0 0 32 32" fill="currentColor" class="h-4 w-4 shrink-0" aria-hidden="true">' +
    '<path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.657 4.526 1.797 6.386L4 29l7.86-1.76A11.9 11.9 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.7c-1.94 0-3.75-.57-5.27-1.55l-.378-.24-4.66 1.04 1.07-4.53-.25-.4A9.65 9.65 0 016.35 15c0-5.32 4.33-9.65 9.654-9.65 5.32 0 9.65 4.33 9.65 9.65s-4.33 9.7-9.65 9.7zm5.32-7.23c-.29-.147-1.71-.845-1.977-.94-.266-.098-.46-.147-.653.147-.194.293-.75.94-.92 1.133-.17.194-.34.22-.63.073-.29-.146-1.224-.451-2.332-1.44-.862-.77-1.444-1.72-1.613-2.01-.17-.293-.018-.45.127-.596.13-.13.29-.34.435-.51.146-.17.194-.293.29-.488.098-.196.05-.367-.024-.513-.073-.146-.653-1.573-.895-2.154-.236-.564-.476-.488-.653-.497-.17-.008-.363-.01-.556-.01-.194 0-.51.073-.777.367-.266.293-1.017.994-1.017 2.425 0 1.43 1.04 2.813 1.185 3.008.146.194 2.05 3.13 4.966 4.39.694.3 1.235.478 1.657.611.696.222 1.33.19 1.83.116.558-.083 1.71-.7 1.952-1.377.242-.677.242-1.257.17-1.377-.073-.122-.266-.195-.556-.34z"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatKm(km) {
    if (km === null || km === undefined || km === "") return null;
    return Number(km).toLocaleString("es-AR");
  }

  function formatPrecio(precio, moneda) {
    if (precio === null || precio === undefined) return null;
    var n = Number(precio);
    if (isNaN(n)) return null;
    return (moneda === "USD" ? "USD " : "$ ") + n.toLocaleString("es-AR");
  }

  // Estados como marcas estampadas sobre la foto, no como pastillas de color.
  function estampasHtml(v, cats) {
    if (v.estado === "vendido") return '<span class="estampa estampa--vendido">Vendido</span>';
    if (v.estado === "reservado") return '<span class="estampa estampa--reservado">Reservado</span>';
    if (cats.indexOf("0km") !== -1) return '<span class="estampa estampa--0km">0KM</span>';
    return "";
  }

  function accionesHtml(v, nombre) {
    var verBtn = '<a href="vehiculo.html?id=' + encodeURIComponent(v.id) + '" class="btn btn-papel-linea btn-sm">Ver detalle</a>';
    if (v.estado === "vendido") {
      return '<div class="ficha-acciones">' + verBtn + '<span class="btn btn-sm" aria-disabled="true">Vendido</span></div>';
    }
    var link = window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "vehiculo.html?id=" + encodeURIComponent(v.id);
    var texto = "Hola Amelio Ortiz, estoy interesado en el " + nombre + " que vi en la web. Podés ver el auto acá: " + link;
    var href = "https://wa.me/" + WHATSAPP_NUM + "?text=" + encodeURIComponent(texto);
    return (
      '<div class="ficha-acciones">' + verBtn +
      '<a href="' + href + '" target="_blank" rel="noopener" class="btn btn-tinta btn-sm">' + whatsappIconSvg + "Consultar</a></div>"
    );
  }

  function cardHtml(v) {
    var nombre = esc(v.marca) + " " + esc(v.modelo);
    var cats = v.categorias || [];
    var img = v.fotoPortadaUrl || "img/lomas-800.webp";
    var fotosUrls = (v.fotos || []).map(function (f) { return f.url; }).filter(Boolean);
    if (!fotosUrls.length) fotosUrls = [img];
    var dataPhotos = esc(JSON.stringify(fotosUrls));

    var datos = [];
    var km = formatKm(v.kilometraje);
    if (km) datos.push("<li><small>Km</small>" + km + "</li>");
    if (v.combustible) datos.push("<li><small>Combustible</small>" + esc(v.combustible) + "</li>");
    if (v.transmision) datos.push("<li><small>Caja</small>" + esc(v.transmision) + "</li>");
    if (datos.length < 3) datos.push("<li><small>Tipo</small>" + (v.tipo === "moto" ? "Moto" : "Auto") + "</li>");

    var precio = formatPrecio(v.precio, v.moneda);
    var precioHtml = precio
      ? '<span class="precio">' + precio + "</span>"
      : '<span class="precio precio--consultar">Precio a consultar</span>';
    var financia = cats.indexOf("financiados") !== -1
      ? '<span class="marca-financia"><i data-lucide="badge-percent" class="h-3.5 w-3.5"></i>Financiación</span>'
      : "";
    var desc = v.descripcion ? "<p data-card-desc hidden>" + esc(v.descripcion) + "</p>" : "";

    var dataTransmision = v.transmision ? ' data-transmision="' + esc(v.transmision) + '"' : "";
    var dataCombustible = v.combustible ? ' data-combustible="' + esc(v.combustible) + '"' : "";
    var dataPrecio = (v.moneda === "ARS" && v.precio != null && !isNaN(v.precio)) ? ' data-price="' + Number(v.precio) + '"' : "";

    return (
      '<article data-vehicle-card data-reveal class="postal postal-auto is-visible' + (v.estado === "vendido" ? " es-vendido" : "") + '" data-id="' + esc(v.id) + '" data-type="' + esc(v.tipo) + '" data-brand="' + esc(v.marca) + '" data-year="' + esc(v.anio) + '" data-category="' + esc(cats.join(" ")) + '"' + dataTransmision + dataCombustible + dataPrecio + " data-photos='" + dataPhotos + "'>" +
      '<div class="postal-foto"><img src="' + esc(img) + '" alt="' + nombre + " " + esc(v.anio) + '" loading="lazy" decoding="async" />' + estampasHtml(v, cats) + "</div>" +
      '<div class="ficha">' +
      "<h3>" + nombre + ' <span class="anio">' + esc(v.anio) + "</span></h3>" +
      '<ul class="ficha-datos">' + datos.slice(0, 3).join("") + "</ul>" +
      '<div class="ficha-precio" data-card-precio>' + precioHtml + financia + "</div>" +
      desc +
      accionesHtml(v, nombre + " " + v.anio) +
      "</div></article>"
    );
  }

  function vacioHtml() {
    return (
      '<p id="catalog-empty" class="col-span-full hidden rounded-xl border border-dashed border-[#cdd5e6] p-10 text-center text-[#4a5474]">' +
      "No encontramos vehículos con esos filtros. " +
      '<a href="https://wa.me/' + WHATSAPP_NUM + '?text=Hola%20Amelio%20Ortiz%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20veh%C3%ADculos." target="_blank" rel="noopener" class="font-bold text-navy-900 underline">Escribinos por WhatsApp</a>' +
      " y te ayudamos a encontrarlo.</p>"
    );
  }

  function iconos() {
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function renderCatalogo(vehiculos) {
    var grid = document.getElementById("catalog-grid");
    if (!grid || !vehiculos.length) return;
    grid.innerHTML = vehiculos.map(cardHtml).join("") + vacioHtml();
    iconos();
    if (typeof window.NQ_REFILTER === "function") window.NQ_REFILTER();
  }

  // Inicio: las 3 unidades más nuevas que no estén vendidas.
  function renderDestacados(vehiculos) {
    var grid = document.getElementById("destacados-grid");
    if (!grid) return;
    // La postal "¿Buscás un modelo?" queda siempre al final: con ella, hasta 2 autos.
    var busco = document.getElementById("busco-card");
    var disponibles = vehiculos.filter(function (v) { return v.estado !== "vendido"; }).slice(0, busco ? 2 : 3);
    if (!disponibles.length) return;
    grid.innerHTML = disponibles.map(cardHtml).join("");
    if (busco) { busco.classList.add("is-visible"); grid.appendChild(busco); }
    grid.addEventListener("click", function (e) {
      if (e.target.closest("a") || e.target.closest("[data-ver-fotos]")) return;
      var card = e.target.closest("[data-vehicle-card]");
      if (card && card.dataset.id) window.location.href = "vehiculo.html?id=" + encodeURIComponent(card.dataset.id);
    });
    iconos();
  }

  function boot() {
    if (!window.VehiculosRepo) return;
    if (!document.getElementById("catalog-grid") && !document.getElementById("destacados-grid")) return;
    window.VehiculosRepo.listar()
      .then(function (data) {
        if (data === null) return; // sin Supabase configurado: quedan las postales de ejemplo
        renderCatalogo(data);
        renderDestacados(data);
      })
      .catch(function (e) {
        console.warn("[catalogo-dinamico] no se pudo cargar desde Supabase, se mantiene el catálogo de ejemplo:", e);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
