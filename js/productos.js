// Al hacer click en las categorías de productos
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#contenedor-categoria-productos .card");
  const contCategorias = document.getElementById("contenedor-categoria-productos");
  const contProductos = document.getElementById("contenedor-articulo-producto");
  const productos = document.querySelectorAll("#contenedor-articulo-producto .producto-card");
  const volverBtn = document.getElementById("volver-categorias");

  if (!cards.length || !contProductos) return;

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const categoria = card.dataset.categoria;

      // ocultar categorías
      contCategorias.style.display = "none";

      // animar productos
      contProductos.classList.add("hidden");  // inicia oculto
      contProductos.classList.remove("hidden"); // dispara transición

      // mostrar solo la categoría seleccionada
      productos.forEach(prod => {
        prod.style.display = prod.classList.contains(categoria) ? "" : "none";
      });
    });
  });

  volverBtn?.addEventListener("click", () => {
    contProductos.classList.add("hidden");
    contCategorias.style.display = "grid";
  });
});
