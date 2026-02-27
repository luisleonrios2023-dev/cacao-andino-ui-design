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
  container.querySelectorAll('a').forEach(img => {
    const herf = img.getAttribute('href');
    if (!herf) return;

    // Si no es URL absoluta
    if (!herf.startsWith('http') && !herf.startsWith('/')) {
      if (isGitHubPages) {
        // Añadir repo al inicio solo en GitHub Pages
        const cleanHref = herf.replace(/^(\.\.\/)+/, ''); 
        img.setAttribute('href', `/${REPO_NAME}/${cleanHref}`);
      } 
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