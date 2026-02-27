// Función para calcular la ruta del partial según la página
function getPartialPath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');
  return isInPages ? `../partials/${filename}.html` : `partials/${filename}.html`;
}

// Función para ajustar rutas de imágenes y CSS dentro de un contenedor
function fixPaths(container) {
  const isInPages = window.location.pathname.includes('/pages/');
  if (!isInPages) return;

  // Ajustar imágenes
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('../')) {
      img.setAttribute('src', '../' + src);
    }
  });

  // Ajustar hojas de estilo si las hubiera
  container.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('../')) {
      link.setAttribute('href', '../' + href);
    }
  });
}

// Función para cargar un partial en un contenedor
function loadPartial(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const partialName = container.dataset.partial;
  const path = getPartialPath(partialName);

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`No se pudo cargar ${partialName}`);
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;

      // Inicializar menú del header
      if (partialName === 'header') {
        const icono_menu = document.getElementById("icono-menu");
        const menu = document.getElementById("menu");
        if (icono_menu && menu) {
          icono_menu.addEventListener('click', () => menu.classList.toggle('menu-open'));
        }
      }

      // Ajustar rutas de imágenes y CSS
      fixPaths(container);
    })
    .catch(err => console.error(err));
}

// Cargar todos los partials automáticamente
document.querySelectorAll('[data-partial]').forEach(el => {
  if (!el.id) return;
  loadPartial(el.id);
});