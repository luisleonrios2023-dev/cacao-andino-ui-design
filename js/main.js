const SITE_ROOT = new URL('../', document.currentScript.src);

function shouldPreserveUrl(url) {
  return url.startsWith('#') || url.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(url);
}

// Ajusta rutas de imágenes dentro de un contenedor
function fixImagePaths(container) {
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src || shouldPreserveUrl(src)) return;

    img.setAttribute('src', new URL(src, SITE_ROOT).href);
  });
}

// Ajustamos rutas de enlaces (header, footer, partials)
function fixLinkPaths(container) {
  const links = container.querySelectorAll("a[href]");

  links.forEach(a => {
    const href = a.getAttribute("href");
    if (!href || shouldPreserveUrl(href)) return;

    a.setAttribute("href", new URL(href, SITE_ROOT).href);
  });
}

// Marca el enlace de navegación que corresponde al documento actual
function setCurrentNavigationPage(container) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts[pathParts.length - 1];
  const currentPage = !lastPathPart || !lastPathPart.includes('.')
    ? 'index.html'
    : lastPathPart;

  container.querySelectorAll('.menu a[href], .footer-nav a[href]').forEach(link => {
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
  const path = new URL(`partials/${partialName}.html`, SITE_ROOT);

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
