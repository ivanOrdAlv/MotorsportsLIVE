// Archivo: JS/cargarNoticias.js
// Funcionalidad para cargar y mostrar noticias

document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let noticias = []
    let noticiasFiltradas = []
    let paginaActual = 1
    const noticiasPorPagina = 9
    let categoriaActual = "todas"
    let terminoBusqueda = ""
  
    // Elementos del DOM
    const noticiasGrid = document.getElementById("noticiasGrid")
    const noticiaDestacada = document.getElementById("noticiaDestacada")
    const paginacionElement = document.getElementById("paginacion")
    const categoriasFiltros = document.getElementById("categoriasFiltros")
    const buscarInput = document.getElementById("buscarNoticias")
    const buscarBtn = document.getElementById("buscarBtn")
    const resetFiltrosBtn = document.getElementById("resetFiltrosBtn")
    const noNoticiasContainer = document.getElementById("noNoticiasContainer")
    const crearNoticiaBtn = document.getElementById("crearNoticiaBtn")
  
    // Verificar si el usuario está autenticado y es administrador
    function verificarAdmin() {
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("userRole")
  
      if (token && userRole === "editor") {
        crearNoticiaBtn.classList.remove("d-none")
        crearNoticiaBtn.addEventListener("click", () => {
          window.location.href = "../editor/crearNoticia.html"
        })
      }
    }
  
    // Cargar noticias desde la API
    async function cargarNoticias() {
      try {
        const response = await fetch("https://motorsportlive-api.onrender.com/api/noticias")
  
        if (!response.ok) {
          throw new Error("Error al cargar las noticias")
        }
  
        noticias = await response.json()
  
        // Ordenar noticias por fecha (más recientes primero)
        noticias.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion))
  
        // Aplicar filtros iniciales
        aplicarFiltros()
      } catch (error) {
        console.error("Error:", error)
        mostrarError("No se pudieron cargar las noticias. Por favor, intenta de nuevo más tarde.")
      }
    }
  
    // Aplicar filtros a las noticias
    function aplicarFiltros() {
      // Filtrar por categoría
      if (categoriaActual === "todas") {
        noticiasFiltradas = [...noticias]
      } else {
        noticiasFiltradas = noticias.filter((noticia) => noticia.categoria === categoriaActual)
      }
  
      // Filtrar por término de búsqueda
      if (terminoBusqueda) {
        const termino = terminoBusqueda.toLowerCase()
        noticiasFiltradas = noticiasFiltradas.filter(
          (noticia) =>
            noticia.titulo.toLowerCase().includes(termino) ||
            noticia.subtitulo.toLowerCase().includes(termino) ||
            noticia.contenido.toLowerCase().includes(termino),
        )
      }
  
      // Mostrar mensaje si no hay noticias
      if (noticiasFiltradas.length === 0) {
        noticiasGrid.innerHTML = ""
        noticiaDestacada.innerHTML = ""
        noNoticiasContainer.classList.remove("d-none")
        paginacionElement.classList.add("d-none")
      } else {
        noNoticiasContainer.classList.add("d-none")
        paginacionElement.classList.remove("d-none")
        mostrarNoticias()
      }
    }
  
    // Mostrar noticias en la página
    function mostrarNoticias() {
      // Mostrar noticia destacada (la más reciente)
      mostrarNoticiaDestacada(noticiasFiltradas[0])
  
      // Calcular paginación
      const totalPaginas = Math.ceil((noticiasFiltradas.length - 1) / noticiasPorPagina)
      const inicio = (paginaActual - 1) * noticiasPorPagina + 1 // +1 porque la primera noticia es la destacada
      const fin = Math.min(inicio + noticiasPorPagina - 1, noticiasFiltradas.length)
  
      // Mostrar noticias de la página actual
      const noticiasActuales = noticiasFiltradas.slice(inicio, fin + 1)
  
      // Limpiar grid de noticias
      noticiasGrid.innerHTML = ""
  
      // Mostrar noticias en el grid
      noticiasActuales.forEach((noticia) => {
        noticiasGrid.appendChild(crearTarjetaNoticia(noticia))
      })
  
      // Actualizar paginación
      actualizarPaginacion(totalPaginas)
    }
  
    // Mostrar noticia destacada
    function mostrarNoticiaDestacada(noticia) {
      if (!noticia) return
  
      noticiaDestacada.innerHTML = `
              <div class="col-12">
                  <div class="card noticia-destacada">
                      <div class="row g-0">
                          <div class="col-md-6">
                              <img src="${noticia.imagenPrincipal}" class="card-img" alt="${noticia.titulo}">
                          </div>
                          <div class="col-md-6">
                              <div class="card-body d-flex flex-column h-100">
                                  <span class="noticia-badge ${noticia.categoria}">${getCategoriaTexto(noticia.categoria)}</span>
                                  <h2 class="card-title h3 fw-bold">${noticia.titulo}</h2>
                                  <p class="card-text lead">${noticia.subtitulo}</p>
                                  <p class="card-text">${truncarTexto(stripHtml(noticia.contenido), 150)}</p>
                                  <div class="mt-auto d-flex justify-content-between align-items-center">
                                      <small class="text-muted">
                                          ${formatearFecha(noticia.fechaPublicacion)} · ${noticia.autor}
                                      </small>
                                      <a href="./detalleNoticia.html?id=${noticia._id}" class="btn btn-primary">Leer más</a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `
    }
  
    // Crear tarjeta de noticia
    function crearTarjetaNoticia(noticia) {
      const col = document.createElement("div")
      col.className = "col-md-4 mb-4"
  
      col.innerHTML = `
              <div class="card h-100">
                  <img src="${noticia.imagenPrincipal}" class="card-img-top" alt="${noticia.titulo}">
                  <div class="card-body">
                      <span class="noticia-badge ${noticia.categoria}">${getCategoriaTexto(noticia.categoria)}</span>
                      <h5 class="card-title fw-bold">${noticia.titulo}</h5>
                      <p class="card-text">${truncarTexto(stripHtml(noticia.contenido), 100)}</p>
                  </div>
                  <div class="card-footer bg-white border-top-0">
                      <small class="text-muted">${formatearFecha(noticia.fechaPublicacion)}</small>
                  </div>
                  <a href="./detalleNoticia.html?id=${noticia._id}" class="stretched-link"></a>
              </div>
          `
  
      return col
    }
  
    // Actualizar paginación
    function actualizarPaginacion(totalPaginas) {
      paginacionElement.innerHTML = ""
  
      // Botón anterior
      const prevLi = document.createElement("li")
      prevLi.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`
      prevLi.innerHTML = `<a class="page-link" href="#" tabindex="-1" aria-disabled="${paginaActual === 1}">Anterior</a>`
      prevLi.addEventListener("click", (e) => {
        e.preventDefault()
        if (paginaActual > 1) {
          paginaActual--
          mostrarNoticias()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
      paginacionElement.appendChild(prevLi)
  
      // Números de página
      const maxPagesToShow = 5
      let startPage = Math.max(1, paginaActual - Math.floor(maxPagesToShow / 2))
      const endPage = Math.min(totalPaginas, startPage + maxPagesToShow - 1)
  
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }
  
      for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li")
        pageLi.className = `page-item ${i === paginaActual ? "active" : ""}`
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`
        pageLi.addEventListener("click", (e) => {
          e.preventDefault()
          paginaActual = i
          mostrarNoticias()
          window.scrollTo({ top: 0, behavior: "smooth" })
        })
        paginacionElement.appendChild(pageLi)
      }
  
      // Botón siguiente
      const nextLi = document.createElement("li")
      nextLi.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`
      nextLi.innerHTML = `<a class="page-link" href="#" aria-disabled="${paginaActual === totalPaginas}">Siguiente</a>`
      nextLi.addEventListener("click", (e) => {
        e.preventDefault()
        if (paginaActual < totalPaginas) {
          paginaActual++
          mostrarNoticias()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
      paginacionElement.appendChild(nextLi)
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
  
    function truncarTexto(texto, longitud) {
      if (texto.length <= longitud) return texto
      return texto.substring(0, longitud) + "..."
    }
  
    function stripHtml(html) {
      const tmp = document.createElement("div")
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ""
    }
  
    function mostrarError(mensaje) {
      noticiasGrid.innerHTML = `
              <div class="col-12 text-center py-5">
                  <i class="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
                  <h3>Error</h3>
                  <p class="text-muted">${mensaje}</p>
              </div>
          `
      noticiaDestacada.innerHTML = ""
      paginacionElement.classList.add("d-none")
    }
  
    // Event listeners
    if (categoriasFiltros) {
      categoriasFiltros.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn")) {
          // Actualizar botones activos
          document.querySelectorAll("#categoriasFiltros .btn").forEach((btn) => {
            btn.classList.remove("active")
          })
          e.target.classList.add("active")
  
          // Actualizar categoría y aplicar filtros
          categoriaActual = e.target.dataset.categoria
          paginaActual = 1
          aplicarFiltros()
        }
      })
    }
  
    if (buscarBtn) {
      buscarBtn.addEventListener("click", () => {
        terminoBusqueda = buscarInput.value.trim()
        paginaActual = 1
        aplicarFiltros()
      })
    }
  
    if (buscarInput) {
      buscarInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          terminoBusqueda = buscarInput.value.trim()
          paginaActual = 1
          aplicarFiltros()
        }
      })
    }
  
    if (resetFiltrosBtn) {
      resetFiltrosBtn.addEventListener("click", () => {
        // Resetear filtros
        categoriaActual = "todas"
        terminoBusqueda = ""
        paginaActual = 1
        buscarInput.value = ""
  
        // Actualizar UI
        document.querySelectorAll("#categoriasFiltros .btn").forEach((btn) => {
          btn.classList.remove("active")
        })
        document.querySelector('#categoriasFiltros [data-categoria="todas"]').classList.add("active")
  
        // Aplicar filtros
        aplicarFiltros()
      })
    }
  
    // Inicializar
    verificarAdmin()
    cargarNoticias()
  })
  