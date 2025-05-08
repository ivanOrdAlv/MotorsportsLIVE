// Archivo: JS/detalleNoticia.js
// Funcionalidad para mostrar el detalle de una noticia

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el ID de la noticia de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const noticiaId = urlParams.get("id")
  
    if (!noticiaId) {
      mostrarError("No se ha especificado una noticia")
      return
    }
  
    // Elementos del DOM
    const noticiaHeader = document.getElementById("noticiaHeader")
    const noticiaContenido = document.getElementById("noticiaContenido")
    const noticiaGaleria = document.getElementById("noticiaGaleria")
    const noticiaReferencias = document.getElementById("noticiaReferencias")
    const listaReferencias = document.getElementById("listaReferencias")
    const autorCard = document.getElementById("autorCard")
    const noticiasRelacionadas = document.getElementById("noticiasRelacionadas")
  
    // Botones de compartir
    const shareTwitter = document.getElementById("shareTwitter")
    const shareFacebook = document.getElementById("shareFacebook")
    const shareWhatsapp = document.getElementById("shareWhatsapp")
    const copyLink = document.getElementById("copyLink")
  
    // Cargar detalle de la noticia
    async function cargarDetalleNoticia() {
      try {
        const response = await fetch(`https://motorsportlive-api.onrender.com/api/noticias/${noticiaId}`)
  
        if (!response.ok) {
          throw new Error("Error al cargar la noticia")
        }
  
        const noticia = await response.json()
  
        // Actualizar título de la página
        document.title = `MotorsportLIVE - ${noticia.titulo}`
  
        // Mostrar la noticia
        mostrarNoticia(noticia)
  
        // Cargar noticias relacionadas
        cargarNoticiasRelacionadas(noticia.categoria)
  
        // Configurar botones de compartir
        configurarCompartir(noticia)
      } catch (error) {
        console.error("Error:", error)
        mostrarError("No se pudo cargar la noticia. Por favor, intenta de nuevo más tarde.")
      }
    }
  
    // Mostrar la noticia en la página
    function mostrarNoticia(noticia) {
      // Header de la noticia
      noticiaHeader.innerHTML = `
              <img src="${noticia.imagenPrincipal}" alt="${noticia.titulo}" class="w-100 h-100 object-fit-cover">
              <div class="noticia-detalle-header-overlay">
                  <span class="noticia-badge ${noticia.categoria} mb-3">${getCategoriaTexto(noticia.categoria)}</span>
                  <h1 class="display-4 fw-bold">${noticia.titulo}</h1>
                  <p class="lead">${noticia.subtitulo}</p>
                  <div class="d-flex align-items-center mt-3">
                      <span class="me-3">
                          <i class="far fa-calendar-alt me-1"></i> ${formatearFecha(noticia.fechaPublicacion)}
                      </span>
                      <span>
                          <i class="far fa-user me-1"></i> ${noticia.autor}
                      </span>
                  </div>
              </div>
          `
  
      // Contenido de la noticia
      noticiaContenido.innerHTML = `
              <div class="noticia-contenido">
                  ${noticia.contenido}
              </div>
          `
  
      // Galería de imágenes adicionales
      if (noticia.imagenesAdicionales && noticia.imagenesAdicionales.length > 0) {
        noticiaGaleria.innerHTML = `
                  <h4 class="mb-3">Galería de imágenes</h4>
                  <div class="row g-3">
                      ${noticia.imagenesAdicionales
                        .map(
                          (img) => `
                          <div class="col-md-6">
                              <div class="noticia-galeria-item" data-bs-toggle="modal" data-bs-target="#imagenModal" data-img="${img}">
                                  <img src="${img}" alt="Imagen adicional" class="img-fluid">
                              </div>
                          </div>
                      `,
                        )
                        .join("")}
                  </div>
              `
  
        // Configurar modal para las imágenes
        document.querySelectorAll(".noticia-galeria-item").forEach((item) => {
          item.addEventListener("click", function () {
            document.getElementById("modalImagen").src = this.dataset.img
          })
        })
      } else {
        noticiaGaleria.classList.add("d-none")
      }
  
      // Referencias
      if (noticia.referencias && noticia.referencias.length > 0) {
        noticiaReferencias.classList.remove("d-none")
        listaReferencias.innerHTML = noticia.referencias
          .map(
            (ref) => `
                  <li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.titulo}</a></li>
              `,
          )
          .join("")
      } else {
        noticiaReferencias.classList.add("d-none")
      }
  
      // Información del autor
      autorCard.innerHTML = `
              <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Autor</h5>
              </div>
              <div class="card-body">
                  <h5 class="card-title">${noticia.autor}</h5>
                  <p class="card-text text-muted">Editor en MotorsportLIVE</p>
                  <p class="card-text">Especialista en noticias de ${getCategoriaTexto(noticia.categoria)}</p>
              </div>
          `
    }
  
    // Cargar noticias relacionadas
    async function cargarNoticiasRelacionadas(categoria) {
      try {
        const response = await fetch(
          `https://motorsportlive-api.onrender.com/api/noticias?categoria=${categoria}&limit=5`,
        )
  
        if (!response.ok) {
          throw new Error("Error al cargar noticias relacionadas")
        }
  
        const noticias = await response.json()
  
        // Filtrar la noticia actual
        const noticiasRelacionadasData = noticias.filter((noticia) => noticia._id !== noticiaId).slice(0, 3)
  
        if (noticiasRelacionadasData.length === 0) {
          noticiasRelacionadas.innerHTML = `
                      <li class="list-group-item text-center py-4">
                          <p class="text-muted mb-0">No hay noticias relacionadas disponibles</p>
                      </li>
                  `
          return
        }
  
        // Mostrar noticias relacionadas
        noticiasRelacionadas.innerHTML = noticiasRelacionadasData
          .map(
            (noticia) => `
                  <li class="list-group-item">
                      <a href="./detalleNoticia.html?id=${noticia._id}" class="text-decoration-none">
                          <h6 class="mb-1">${noticia.titulo}</h6>
                          <small class="text-muted">
                              <i class="far fa-calendar-alt me-1"></i> ${formatearFecha(noticia.fechaPublicacion)}
                          </small>
                      </a>
                  </li>
              `,
          )
          .join("")
      } catch (error) {
        console.error("Error:", error)
        noticiasRelacionadas.innerHTML = `
                  <li class="list-group-item text-center py-4">
                      <p class="text-muted mb-0">Error al cargar noticias relacionadas</p>
                  </li>
              `
      }
    }
  
    // Configurar botones de compartir
    function configurarCompartir(noticia) {
      const currentUrl = window.location.href
      const titulo = encodeURIComponent(noticia.titulo)
  
      // Twitter
      shareTwitter.href = `https://twitter.com/intent/tweet?text=${titulo}&url=${encodeURIComponent(currentUrl)}`
  
      // Facebook
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  
      // WhatsApp
      shareWhatsapp.href = `https://api.whatsapp.com/send?text=${titulo}%20${encodeURIComponent(currentUrl)}`
  
      // Copiar enlace
      copyLink.addEventListener("click", function () {
        navigator.clipboard.writeText(currentUrl).then(() => {
          const originalText = this.innerHTML
          this.innerHTML = '<i class="fas fa-check me-2"></i>Enlace copiado'
  
          setTimeout(() => {
            this.innerHTML = originalText
          }, 2000)
        })
      })
    }
  
    // Funciones de utilidad
    function getCategoriaTexto(categoria) {
      const categorias = {
        formula1: "Fórmula 1",
        motogp: "MotoGP",
        wrc: "WRC",
        wec: "WEC",
        indycar: "IndyCar",
        otros: "Otros",
      }
      return categorias[categoria] || "General"
    }
  
    function formatearFecha(fechaStr) {
      const fecha = new Date(fechaStr)
      return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }
  
    function mostrarError(mensaje) {
      noticiaHeader.innerHTML = ""
      noticiaContenido.innerHTML = `
              <div class="text-center py-5">
                  <i class="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
                  <h3>Error</h3>
                  <p class="text-muted">${mensaje}</p>
                  <a href="./noticias.html" class="btn btn-primary mt-3">
                      <i class="fas fa-arrow-left me-2"></i>Volver a noticias
                  </a>
              </div>
          `
      noticiaGaleria.classList.add("d-none")
      noticiaReferencias.classList.add("d-none")
      autorCard.classList.add("d-none")
      document.querySelector(".col-lg-4").classList.add("d-none")
    }
  
    // Inicializar
    cargarDetalleNoticia()
  })
  