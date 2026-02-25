fetch("partials/header.html")
  .then(response => response.txt())
  .then(data => {
    document.getElementById("header-container").innerHTML = data;
  })
  .catch(error => console.error("Error cargando el header"));
