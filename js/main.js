// Inyecta el header.html
fetch("/partials/header.html")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el header");
    }
    return response.text();
  })
  .then(html => {
    document.getElementById("header-container").innerHTML = html;

    //Aquí ya existe el html header
    const icono_menu = document.getElementById("icono-menu");
    const menu = document.getElementById("menu");

    icono_menu.addEventListener('click', () => {
      menu.classList.toggle('menu-open');
    })
  })
  .catch(error => {
    console.error("Error cargando el header:", error);
  });

// Injectar el footer
fetch("/partials/footer.html")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el header");
    }
    return response.text();
  })
  .then(html => {
    document.getElementById("footer-container").innerHTML = html;
  })
  .catch(error => {
    console.error("Error cargando el header:", error);
  });


