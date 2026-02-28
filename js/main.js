// Detectar entorno
const isGitHubPages = window.location.hostname.includes('github.io');
const REPO_NAME = "cacao-andino-ui-design"; // nombre exacto de tu repo

// Calcula la ruta del partial según la página
function getPartialPath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');
  return isInPages ? `../partials/${filename}.html` : `partials/${filename}.html`;
}

// Ajusta rutas de imágenes dentro de un contenedor
function fixImagePaths(container) {
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src) return;

    // Si no es URL absoluta
    if (!src.startsWith('http') && !src.startsWith('/')) {
      if (isGitHubPages) {
        // Añadir repo al inicio solo en GitHub Pages
        const cleanSrc = src.replace(/^(\.\.\/)+/, '');
        img.setAttribute('src', `/${REPO_NAME}/${cleanSrc}`);
      }
    }
  });
}

// Ajustamos rutas de enlaces
function fixLinkPaths(container) {
  container.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;

    // Ignorar URLs absolutas reales (https://, mailto:, tel:, etc.)
    if (
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) return;

    if (isGitHubPages) {
      const cleanHref = href.replace(/^(\.\.\/)+/, '');
      a.setAttribute('href', `/${REPO_NAME}/${cleanHref}`);
    }
  });
}

// Carga un partial en un contenedor
function loadPartial(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const partialName = container.dataset.partial;
  const path = getPartialPath(partialName);

  fetch(path)
    .then(res => res.ok ? res.text() : Promise.reject(`No se pudo cargar ${partialName}`))
    .then(html => {
      container.innerHTML = html;

      // Inicializa menú si es header
      if (partialName === 'header') {
        const icono_menu = document.getElementById("icono-menu");
        const menu = document.getElementById("menu");
        if (icono_menu && menu) {
          icono_menu.addEventListener('click', () => menu.classList.toggle('menu-open'));
        }
      }

      // Usamos la función de abajo del todo
      if (partialName === 'footer'){
        ocultarFooterEnContacto();
      }

      // Ajustar rutas de imágenes en header, footer o cualquier partial
      fixImagePaths(container);
      // Ajustar rutas de enlaces en cualquier partial
      fixLinkPaths(container);
    })
    .catch(err => console.error(err));
}

// Cargar todos los partials automáticamente
document.querySelectorAll('[data-partial]').forEach(el => {
  if (!el.id) return;
  loadPartial(el.id);
});


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

// Función para ocultar info del footer en contacto.html
function ocultarFooterEnContacto() {
  if (!window.location.pathname.includes("contacto.html")) return;

  const footerInfo = document.querySelector(".footer-info");
  const footerSocial = document.querySelector(".footer-social");

  if (!footerInfo || !footerSocial) return;

  footerInfo.classList.add("hidden");
  footerSocial.classList.add("hidden");
}