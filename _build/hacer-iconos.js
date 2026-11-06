const fs = require("fs");
const vm = require("vm");
const ctx = { window: {}, self: {}, globalThis: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("lucide.min.js", "utf8"), ctx);
const lucide = ctx.lucide || ctx.window.lucide || ctx.self.lucide;
const usados = process.argv.slice(2);
const pascal = n => n.split("-").map(p => p[0].toUpperCase() + p.slice(1)).join("");
const mapa = {};
for (const n of usados) {
  const nodo = lucide.icons[pascal(n)];
  if (!nodo) { console.error("falta", n); continue; }
  // nodo: [tag, attrs, children] en esta versión; normalizamos a lista de [tag, attrs]
  const hijos = Array.isArray(nodo[2]) ? nodo[2] : nodo;
  mapa[n] = hijos.map(([tag, attrs]) => [tag, attrs]);
}
const salida = `(function () {
  "use strict";
  // Íconos usados en el sitio (subconjunto de Lucide 0.460.0, licencia ISC).
  // Reemplaza a la librería completa: misma API window.lucide.createIcons().
  var ICONOS = ${JSON.stringify(mapa)};
  var NS = "http://www.w3.org/2000/svg";
  function crear(nombre, original) {
    var nodos = ICONOS[nombre];
    if (!nodos) return null;
    var svg = document.createElementNS(NS, "svg");
    var base = { xmlns: NS, width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
    Object.keys(base).forEach(function (k) { svg.setAttribute(k, base[k]); });
    svg.setAttribute("class", ("lucide lucide-" + nombre + " " + (original.getAttribute("class") || "")).trim());
    nodos.forEach(function (n) {
      var el = document.createElementNS(NS, n[0]);
      Object.keys(n[1]).forEach(function (k) { if (k !== "key") el.setAttribute(k, n[1][k]); });
      svg.appendChild(el);
    });
    return svg;
  }
  function createIcons() {
    var lista = document.querySelectorAll("i[data-lucide]");
    Array.prototype.forEach.call(lista, function (i) {
      var svg = crear(i.getAttribute("data-lucide"), i);
      if (svg) i.parentNode.replaceChild(svg, i);
    });
  }
  window.lucide = { createIcons: createIcons };
})();
`;
fs.writeFileSync("D:/amelio-ortiz/iconos.js", salida);
console.log(Object.keys(mapa).length, "iconos,", salida.length, "bytes");
