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
  const isInPages = window.location.pathname.includes('/pages/');

  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src) return;

    // Si no es URL absoluta
    if (!src.startsWith('http') && !src.startsWith('/')) {
      const cleanSrc = src.replace(/^(\.\.\/)+/, '');

      if (isGitHubPages) {
        // Añadir repo al inicio solo en GitHub Pages
        img.setAttribute('src', `/${REPO_NAME}/${cleanSrc}`);
        return;
      }

      img.setAttribute('src', isInPages ? `../${cleanSrc}` : cleanSrc);
    }
  });
}

// Ajustamos rutas de enlaces (header, footer, partials)
function fixLinkPaths(container) {
  const links = container.querySelectorAll("a[href]");

  const path = window.location.pathname;
  const isInPages = path.includes("/pages/");
  const isGitHubPages = window.location.hostname.includes("github.io");

  links.forEach(a => {
    let href = a.getAttribute("href");
    if (!href) return;

    // Ignorar URLs que no debemos tocar
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#")
    ) return;

    // Limpiamos ../ para normalizar
    href = href.replace(/^(\.\.\/)+/, "");

    // Si estamos en GitHub Pages
    if (isGitHubPages) {
      a.setAttribute("href", `/${REPO_NAME}/${href}`);
      return;
    }

    // Si estamos en /pages/
    if (isInPages) {
      a.setAttribute("href", `../${href}`);
      return;
    }

    // Si estamos en la raíz (index.html)
    a.setAttribute("href", href);
  });
}

// Marca el enlace de navegación que corresponde al documento actual
function setCurrentNavigationPage(container) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts[pathParts.length - 1];
  const currentPage = !lastPathPart || !lastPathPart.includes('.')
    ? 'index.html'
    : lastPathPart;

  container.querySelectorAll('.menu a[href]').forEach(link => {
    const linkPath = new URL(link.getAttribute('href'), window.location.href).pathname;
    const linkParts = linkPath.split('/').filter(Boolean);
    const linkPage = linkParts[linkParts.length - 1];

    if (linkPage === currentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

const WHATSAPP_PENDING_MESSAGE = 'Los pedidos por WhatsApp estarán disponibles próximamente';
const WHATSAPP_DESCRIPTION_ID = 'whatsapp-pending-description';
const WHATSAPP_NOTICE_ID = 'whatsapp-pending-notice';
let whatsappNoticeTimer;

// Prepara una única descripción y una región de estado para todos los CTA pendientes
function setupPendingWhatsApp() {
  const description = document.createElement('span');
  description.id = WHATSAPP_DESCRIPTION_ID;
  description.className = 'sr-only';
  description.textContent = WHATSAPP_PENDING_MESSAGE;
  document.body.appendChild(description);

  const notice = document.createElement('div');
  notice.id = WHATSAPP_NOTICE_ID;
  notice.className = 'whatsapp-notice';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.setAttribute('aria-atomic', 'true');
  document.body.appendChild(notice);

  document.addEventListener('click', handlePendingWhatsAppActivation);
  document.addEventListener('keydown', handlePendingWhatsAppActivation);
}

// Un único manejador cubre enlaces presentes y partials cargados posteriormente
function handlePendingWhatsAppActivation(event) {
  const target = event.target instanceof Element
    ? event.target.closest('[data-whatsapp-pending]')
    : null;
  const isClick = event.type === 'click';
  const isSpaceKey = event.type === 'keydown' && event.key === ' ';

  if (!target || (!isClick && !isSpaceKey)) return;

  event.preventDefault();
  showPendingWhatsAppNotice();
}

function showPendingWhatsAppNotice() {
  const notice = document.getElementById(WHATSAPP_NOTICE_ID);
  if (!notice) return;

  window.clearTimeout(whatsappNoticeTimer);
  notice.textContent = '';

  window.requestAnimationFrame(() => {
    notice.textContent = WHATSAPP_PENDING_MESSAGE;
    notice.classList.add('is-visible');

    whatsappNoticeTimer = window.setTimeout(() => {
      notice.classList.remove('is-visible');
      notice.textContent = '';
    }, 5000);
  });
}

setupPendingWhatsApp();

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
        const menuToggle = document.getElementById("menu-toggle");
        const menu = document.getElementById("menu");
        if (menuToggle && menu) {
          const setMenuState = isOpen => {
            menu.classList.toggle('menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute(
              'aria-label',
              isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
            );
          };

          menuToggle.addEventListener('click', () => {
            setMenuState(!menu.classList.contains('menu-open'));
          });

          document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !menu.classList.contains('menu-open')) return;

            event.preventDefault();
            setMenuState(false);
            menuToggle.focus();
          });
        }
      }

      // Usamos la función de abajo del todo
      if (partialName === 'footer') {
        ocultarFooterEnContacto();
      }

      // Ajustar rutas de imágenes en header, footer o cualquier partial
      fixImagePaths(container);
      // Ajustar rutas de enlaces en cualquier partial
      fixLinkPaths(container);
      // Identificar la página actual una vez normalizadas las rutas
      setCurrentNavigationPage(container);
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
