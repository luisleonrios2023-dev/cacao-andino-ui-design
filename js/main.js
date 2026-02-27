// Calcula ruta del partial según la carpeta
function getPartialPath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');
  return isInPages ? `../partials/${filename}.html` : `partials/${filename}.html`;
}

// Carga partial en su contenedor
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

      // Inicializa menú solo si es el header
      if (partialName === 'header') {
        const icono_menu = document.getElementById("icono-menu");
        const menu = document.getElementById("menu");
        if (icono_menu && menu) {
          icono_menu.addEventListener('click', () => {
            menu.classList.toggle('menu-open');
          });
        }
      }
    })
    .catch(err => console.error(err));
}

// Carga todos los partials automáticamente
document.querySelectorAll('[data-partial]').forEach(el => loadPartial(el.id));