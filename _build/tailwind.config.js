module.exports = {
  content: [
    "../{index,catalogo,vehiculo,alquiler,financiacion,nosotros,contacto}.html",
    "../{main,catalogo-dinamico,catalogo-lightbox,vehiculo-detalle,galeria-visor}.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        orange: { 50: "#FEF5EA", 100: "#FDE8CC", 200: "#FAD09A", 300: "#F6B663", 400: "#F3A443", 500: "#F09428", 600: "#D27A12", 700: "#A85E0B", 800: "#7E470B", 900: "#5C340A", 950: "#331C04" },
        navy: { 50: "#F2F5FB", 100: "#E2E8F4", 200: "#C3CEE6", 300: "#9FB1D6", 400: "#7088BC", 500: "#4B659E", 600: "#344D82", 700: "#283E6D", 800: "#1D3059", 900: "#152446", 950: "#0D1830" },
      },
    },
  },
};
