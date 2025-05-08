document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("circuit-details-container");

  // Obtener el ID del circuito de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const circuitId = urlParams.get("id");

  if (!circuitId) {
    container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> No se especificó un ID de circuito.
                </div>
                <a href="/" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver a la página principal
                </a>
            </div>
        `;
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/circuitos/${circuitId}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const circuito = Array.isArray(data) ? data[0] : data;

    // Aquí iría el código para mostrar los detalles del circuito
    // (Este código ya está incluido en el HTML de detalleEventos.html)
  } catch (error) {
    console.error("Error al cargar los detalles del circuito:", error);
    container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los detalles del circuito: ${error.message}
                </div>
                <a href="/" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver a la página principal
                </a>
            </div>
        `;
  }
});
