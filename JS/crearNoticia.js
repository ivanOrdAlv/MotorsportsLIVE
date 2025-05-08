document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el editor Quill
    const quill = new Quill("#editor-container", {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link", "blockquote", "code-block"],
          [{ align: [] }],
          ["clean"],
        ],
      },
      placeholder: "Escribe el contenido de la noticia aquí...",
      theme: "snow",
    })
  
    // Manejar la carga de imágenes
    setupImageUpload("imagenPrincipal", "imagenPrincipalPreview", "selectImagenPrincipal")
    setupImageUpload("imagenAdicional1", "imagenAdicional1Preview", "selectImagenAdicional1")
    setupImageUpload("imagenAdicional2", "imagenAdicional2Preview", "selectImagenAdicional2")
  
    // Manejar los enlaces de referencia
    document.getElementById("add-enlace").addEventListener("click", addEnlace)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-enlace") || e.target.parentElement.classList.contains("remove-enlace")) {
        removeEnlace(e)
      }
    })
  
    // Manejar la vista previa
    document.getElementById("previewBtn").addEventListener("click", showPreview)
  
    // Manejar el envío del formulario
    document.getElementById("noticiaForm").addEventListener("submit", handleSubmit)
  
    // Manejar el guardado como borrador
    document.getElementById("guardarBorrador").addEventListener("click", () => {
      saveAsDraft(true)
    })
  })
  
  // Función para configurar la carga de imágenes
  function setupImageUpload(inputId, previewId, buttonId) {
    const input = document.getElementById(inputId)
    const preview = document.getElementById(previewId)
    const button = document.getElementById(buttonId)
  
    // Evento para el botón de selección
    button.addEventListener("click", () => {
      input.click()
    })
  
    // Evento para el área de previsualización
    preview.addEventListener("click", () => {
      input.click()
    })
  
    // Evento para cuando se selecciona un archivo
    input.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const file = this.files[0]
  
        // Validar que sea una imagen
        if (!file.type.match("image.*")) {
          showError("Por favor, selecciona un archivo de imagen válido.")
          return
        }
  
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError("La imagen es demasiado grande. El tamaño máximo es 5MB.")
          return
        }
  
        const reader = new FileReader()
  
        reader.onload = (e) => {
          // Limpiar el contenido actual
          preview.innerHTML = ""
  
          // Crear y añadir la imagen
          const img = document.createElement("img")
          img.src = e.target.result
          img.alt = "Vista previa"
          preview.appendChild(img)
        }
  
        reader.readAsDataURL(file)
      }
    })
  
    // Permitir arrastrar y soltar
    preview.addEventListener("dragover", function (e) {
      e.preventDefault()
      this.style.borderColor = "#007bff"
    })
  
    preview.addEventListener("dragleave", function () {
      this.style.borderColor = "#ced4da"
    })
  
    preview.addEventListener("drop", function (e) {
      e.preventDefault()
      this.style.borderColor = "#ced4da"
  
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        input.files = e.dataTransfer.files
  
        // Disparar el evento change manualmente
        const event = new Event("change", { bubbles: true })
        input.dispatchEvent(event)
      }
    })
  }
  
  // Función para añadir un nuevo enlace de referencia
  function addEnlace() {
    const container = document.getElementById("enlaces-container")
    const newEnlace = document.createElement("div")
    newEnlace.className = "enlace-item mb-2 d-flex"
    newEnlace.innerHTML = `
          <input type="text" class="form-control me-2" placeholder="Título del enlace" name="enlace-titulo[]">
          <input type="url" class="form-control me-2" placeholder="URL" name="enlace-url[]">
          <button type="button" class="btn btn-danger remove-enlace"><i class="fas fa-times"></i></button>
      `
    container.appendChild(newEnlace)
  }
  
  // Función para eliminar un enlace de referencia
  function removeEnlace(e) {
    const enlaceItem = e.target.closest(".enlace-item")
    enlaceItem.parentNode.removeChild(enlaceItem)
  }
  
  // Función para mostrar la vista previa
  function showPreview() {
    // Obtener los valores del formulario
    const titulo = document.getElementById("titulo").value || "Título de la Noticia"
    const subtitulo = document.getElementById("subtitulo").value || ""
    const categoria = document.getElementById("categoria").value
    const categoriaText = categoria
      ? document.getElementById("categoria").options[document.getElementById("categoria").selectedIndex].text
      : ""
    const autor = document.getElementById("autor").value || "Autor"
    const fecha = document.getElementById("fecha").value
      ? new Date(document.getElementById("fecha").value).toLocaleString("es-ES")
      : new Date().toLocaleString("es-ES")
  
    // Obtener el contenido del editor
    const contenido = document.querySelector(".ql-editor").innerHTML
  
    // Actualizar la vista previa
    document.getElementById("preview-titulo").textContent = titulo
    document.getElementById("preview-subtitulo").textContent = subtitulo
    document.getElementById("preview-categoria").textContent = categoriaText
    document.getElementById("preview-autor").textContent = autor
    document.getElementById("preview-fecha").textContent = fecha
    document.getElementById("preview-contenido").innerHTML = contenido
  
    // Mostrar la imagen principal
    const imagenPrincipalPreview = document.getElementById("imagenPrincipalPreview")
    const previewImagenPrincipal = document.querySelector(".preview-imagen-principal")
    previewImagenPrincipal.innerHTML = ""
  
    if (imagenPrincipalPreview.querySelector("img")) {
      const img = document.createElement("img")
      img.src = imagenPrincipalPreview.querySelector("img").src
      img.alt = titulo
      previewImagenPrincipal.appendChild(img)
    } else {
      previewImagenPrincipal.innerHTML =
        '<div class="p-3 bg-light text-center">No se ha seleccionado imagen principal</div>'
    }
  
    // Mostrar imágenes adicionales
    const previewImagenesAdicionales = document.getElementById("preview-imagenes-adicionales")
    previewImagenesAdicionales.innerHTML = ""
  
    const imagenAdicional1 = document.getElementById("imagenAdicional1Preview").querySelector("img")
    const imagenAdicional2 = document.getElementById("imagenAdicional2Preview").querySelector("img")
  
    if (imagenAdicional1 || imagenAdicional2) {
      if (imagenAdicional1) {
        const col = document.createElement("div")
        col.className = "col-md-6"
        const img = document.createElement("img")
        img.src = imagenAdicional1.src
        img.alt = "Imagen adicional 1"
        col.appendChild(img)
        previewImagenesAdicionales.appendChild(col)
      }
  
      if (imagenAdicional2) {
        const col = document.createElement("div")
        col.className = "col-md-6"
        const img = document.createElement("img")
        img.src = imagenAdicional2.src
        img.alt = "Imagen adicional 2"
        col.appendChild(img)
        previewImagenesAdicionales.appendChild(col)
      }
    } else {
      previewImagenesAdicionales.innerHTML =
        '<div class="col-12 p-3 bg-light text-center">No se han seleccionado imágenes adicionales</div>'
    }
  
    // Mostrar enlaces de referencia
    const previewEnlaces = document.getElementById("preview-enlaces").querySelector("ul")
    previewEnlaces.innerHTML = ""
  
    const enlacesTitulos = document.querySelectorAll('input[name="enlace-titulo[]"]')
    const enlacesUrls = document.querySelectorAll('input[name="enlace-url[]"]')
  
    let hayEnlaces = false
  
    for (let i = 0; i < enlacesTitulos.length; i++) {
      const titulo = enlacesTitulos[i].value.trim()
      const url = enlacesUrls[i].value.trim()
  
      if (titulo && url) {
        hayEnlaces = true
        const li = document.createElement("li")
        li.className = "list-group-item"
        const a = document.createElement("a")
        a.href = url
        a.target = "_blank"
        a.textContent = titulo
        li.appendChild(a)
        previewEnlaces.appendChild(li)
      }
    }
  
    if (!hayEnlaces) {
      document.getElementById("preview-enlaces").style.display = "none"
    } else {
      document.getElementById("preview-enlaces").style.display = "block"
    }
  
    // Mostrar el modal
    const previewModal = new bootstrap.Modal(document.getElementById("previewModal"))
    previewModal.show()
  }
  
  // Función para manejar el envío del formulario
  async function handleSubmit(e) {
    e.preventDefault()
  
    // Validar el formulario
    if (!validateForm()) {
      return
    }
  
    // Guardar como publicado
    saveAsDraft(false)
  }
  
  // Función para validar el formulario
  function validateForm() {
    let isValid = true
  
    // Validar título
    const titulo = document.getElementById("titulo").value.trim()
    if (!titulo) {
      showError("El título es obligatorio.")
      isValid = false
    }
  
    // Validar categoría
    const categoria = document.getElementById("categoria").value
    if (!categoria) {
      showError("La categoría es obligatoria.")
      isValid = false
    }
  
    // Validar imagen principal
    const imagenPrincipal = document.getElementById("imagenPrincipal").files
    if (!imagenPrincipal || imagenPrincipal.length === 0) {
      showError("La imagen principal es obligatoria.")
      isValid = false
    }
  
    // Validar contenido
    const contenido = document.querySelector(".ql-editor").innerHTML.trim()
    if (contenido === "<p><br></p>" || contenido === "") {
      showError("El contenido de la noticia es obligatorio.")
      isValid = false
    }
  
    // Validar autor
    const autor = document.getElementById("autor").value.trim()
    if (!autor) {
      showError("El autor es obligatorio.")
      isValid = false
    }
  
    return isValid
  }
  
  // Función para mostrar mensajes de error
  function showError(message) {
    const alertDiv = document.createElement("div")
    alertDiv.className = "alert alert-danger alert-float"
    alertDiv.innerHTML = `
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          ${message}
      `
    document.body.appendChild(alertDiv)
  
    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 5000)
  }
  
  // Función para mostrar mensajes de éxito
  function showSuccess(message) {
    const alertDiv = document.createElement("div")
    alertDiv.className = "alert alert-success alert-float"
    alertDiv.innerHTML = `
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          ${message}
      `
    document.body.appendChild(alertDiv)
  
    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 5000)
  }
  
  // Función para guardar como borrador o publicar
  async function saveAsDraft(isDraft) {
    try {
      // Si es un borrador, no validamos campos obligatorios
      if (!isDraft && !validateForm()) {
        return
      }
  
      // Mostrar indicador de carga
      showLoading()
  
      // Obtener los datos del formulario
      const formData = new FormData()
      formData.append("titulo", document.getElementById("titulo").value.trim())
      formData.append("subtitulo", document.getElementById("subtitulo").value.trim())
      formData.append("categoria", document.getElementById("categoria").value)
      formData.append("contenido", document.querySelector(".ql-editor").innerHTML)
      formData.append("autor", document.getElementById("autor").value.trim())
  
      // Fecha (si no se especifica, usar la actual)
      const fechaInput = document.getElementById("fecha").value
      const fecha = fechaInput ? new Date(fechaInput) : new Date()
      formData.append("fecha", fecha.toISOString())
  
      // Estado (borrador o publicado)
      formData.append("estado", isDraft ? "borrador" : "publicado")
  
      // Imágenes
      if (document.getElementById("imagenPrincipal").files.length > 0) {
        formData.append("imagenPrincipal", document.getElementById("imagenPrincipal").files[0])
      }
  
      if (document.getElementById("imagenAdicional1").files.length > 0) {
        formData.append("imagenAdicional1", document.getElementById("imagenAdicional1").files[0])
      }
  
      if (document.getElementById("imagenAdicional2").files.length > 0) {
        formData.append("imagenAdicional2", document.getElementById("imagenAdicional2").files[0])
      }
  
      // Enlaces de referencia
      const enlacesTitulos = document.querySelectorAll('input[name="enlace-titulo[]"]')
      const enlacesUrls = document.querySelectorAll('input[name="enlace-url[]"]')
  
      const enlaces = []
  
      for (let i = 0; i < enlacesTitulos.length; i++) {
        const titulo = enlacesTitulos[i].value.trim()
        const url = enlacesUrls[i].value.trim()
  
        if (titulo && url) {
          enlaces.push({ titulo, url })
        }
      }
  
      formData.append("enlaces", JSON.stringify(enlaces))
  
      // Enviar los datos a la API
      const response = await fetch("http://localhost:3000/noticias", {
        method: "POST",
        body: formData,
      })
  
      // Ocultar indicador de carga
      hideLoading()
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al guardar la noticia")
      }
  
      const data = await response.json()
  
      // Mostrar mensaje de éxito
      showSuccess(isDraft ? "Borrador guardado correctamente" : "Noticia publicada correctamente")
  
      // Redirigir a la página de noticias después de 2 segundos
      setTimeout(() => {
        window.location.href = "../noticias/noticias.html"
      }, 2000)
    } catch (error) {
      // Ocultar indicador de carga
      hideLoading()
  
      // Mostrar mensaje de error
      showError(error.message || "Error al guardar la noticia")
      console.error("Error:", error)
    }
  }
  
  // Funciones para mostrar y ocultar el indicador de carga
  function showLoading() {
    const loadingOverlay = document.createElement("div")
    loadingOverlay.className = "loading-overlay"
    loadingOverlay.id = "loadingOverlay"
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>'
    document.body.appendChild(loadingOverlay)
  }
  
  function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay")
    if (loadingOverlay) {
      loadingOverlay.parentNode.removeChild(loadingOverlay)
    }
  }
  