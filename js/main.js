// Nombre del repositorio (para rutas absolutas en GitHub Pages)
const REPO_NAME = "cacao-andino-ui-design";

// Devuelve la ruta correcta del partial según la carpeta de la página
function getPartialPath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');
  return isInPages ? `../partials/${filename}.html` : `partials/${filename}.html`;
}

// Ajusta rutas de imágenes dentro de un contenedor para GitHub Pages
function fixImagePaths(container) {
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src) return;

    // Si la ruta no es absoluta (no empieza con http o /)
    if (!src.startsWith('http') && !src.startsWith('/')) {
      // Eliminamos cualquier "../" inicial y añadimos la ruta del repo
      const cleanSrc = src.replace(/^(\.\.\/)+/, '');
      img.setAttribute('src', `/${REPO_NAME}/${cleanSrc}`);
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

      // Inicializa el menú si es header
      if (partialName === 'header') {
        const icono_menu = document.getElementById("icono-menu");
        const menu = document.getElementById("menu");
        if (icono_menu && menu) {
          icono_menu.addEventListener('click', () => menu.classList.toggle('menu-open'));
        }
      }

      // Arregla rutas de imágenes para GitHub Pages
      fixImagePaths(container);
    })
    .catch(err => console.error(err));
}

// Detecta todos los contenedores con data-partial y los carga
document.querySelectorAll('[data-partial]').forEach(el => {
  if (!el.id) return;
  loadPartial(el.id);
});