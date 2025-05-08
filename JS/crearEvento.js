document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const formAlert = document.getElementById("formAlert")
    const loadingContainer = document.getElementById("loading-container")
    const formContainer = document.getElementById("form-container")
    const createEventForm = document.getElementById("createEventForm")
    const previewMapBtn = document.getElementById("preview-map-btn")
    const mapPreview = document.getElementById("map-preview")
    const layoutPreviewContainer = document.getElementById("layout-preview-container")
    const heroPreviewContainer = document.getElementById("hero-preview-container")
    const circuitLayoutInput = document.getElementById("circuitLayout")
    const heroImageInput = document.getElementById("heroImage")
    const latInput = document.getElementById("lat")
    const lngInput = document.getElementById("lng")
    const nameInput = document.getElementById("name")
    const circuitRefInput = document.getElementById("circuitRef")
  
    // Función para mostrar alertas
    function showAlert(message, type) {
      formAlert.textContent = message
      formAlert.className = `alert mt-3 alert-${type}`
      formAlert.classList.remove("d-none")
  
      // Hacer scroll hasta la alerta
      formAlert.scrollIntoView({ behavior: "smooth", block: "center" })
  
      // Ocultar la alerta después de 5 segundos
      setTimeout(() => {
        formAlert.classList.add("d-none")
      }, 5000)
    }
  
    // Función para generar una referencia de circuito a partir del nombre
    function generateCircuitRef(name) {
      if (!name) return ""
  
      return name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
        .replace(/\s+/g, "_") // Reemplazar espacios con guiones bajos
        .trim()
    }
  
    // Evento para generar automáticamente la referencia del circuito
    nameInput.addEventListener("input", () => {
      circuitRefInput.value = generateCircuitRef(nameInput.value)
    })
  
    // Función para previsualizar el mapa
    function updateMapPreview() {
      const lat = latInput.value
      const lng = lngInput.value
  
      if (lat && lng) {
        mapPreview.innerHTML = `
                  <iframe 
                      width="100%" 
                      height="100%" 
                      frameborder="0" 
                      scrolling="no" 
                      marginheight="0" 
                      marginwidth="0" 
                      src="https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed"
                  ></iframe>
              `
      } else {
        mapPreview.innerHTML = `
                  <p class="text-center text-muted p-5">
                      <i class="bi bi-map"></i> Introduce las coordenadas para ver el mapa
                  </p>
              `
      }
    }
  
    // Evento para previsualizar el mapa
    previewMapBtn.addEventListener("click", updateMapPreview)
  
    // Función para previsualizar imágenes
    function updateImagePreview(url, container) {
      if (url && isValidUrl(url)) {
        container.innerHTML = `
                  <img src="${url}" class="preview-image" alt="Previsualización">
              `
      } else {
        container.innerHTML = `
                  <p class="text-muted mb-0 text-center p-3">
                      <i class="bi bi-image"></i> Introduce una URL válida para previsualizar
                  </p>
              `
      }
    }
  
    // Validar URL
    function isValidUrl(string) {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    }
  
    // Eventos para previsualizar imágenes
    circuitLayoutInput.addEventListener("blur", () => {
      updateImagePreview(circuitLayoutInput.value, layoutPreviewContainer)
    })
  
    heroImageInput.addEventListener("blur", () => {
      updateImagePreview(heroImageInput.value, heroPreviewContainer)
    })
  
    // Asegurarse de que los campos de latitud y longitud tengan valores iniciales
    // Esto evita el error "An invalid form control with name='lat/lng' is not focusable"
    latInput.value = latInput.value || ""
    lngInput.value = lngInput.value || ""
  
    // Manejar el envío del formulario
    createEventForm.addEventListener("submit", async (event) => {
      event.preventDefault()
  
      // Validar campos obligatorios
      const requiredFields = ["name", "circuitRef", "location", "country", "lat", "lng"]
      let isValid = true
  
      requiredFields.forEach((field) => {
        const input = document.getElementById(field)
        if (!input.value.trim()) {
          input.classList.add("is-invalid")
          isValid = false
        } else {
          input.classList.remove("is-invalid")
        }
      })
  
      if (!isValid) {
        showAlert("Por favor, completa todos los campos obligatorios", "danger")
        return
      }
  
      // Mostrar indicador de carga
      const submitButton = document.getElementById("save-circuit-btn")
      const originalButtonText = submitButton.innerHTML
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
      submitButton.disabled = true
  
      try {
        // Recopilar datos del formulario
        const circuitData = {
          name: document.getElementById("name").value,
          circuitRef: document.getElementById("circuitRef").value,
          location: document.getElementById("location").value,
          country: document.getElementById("country").value,
          lat: Number.parseFloat(document.getElementById("lat").value),
          lng: Number.parseFloat(document.getElementById("lng").value),
          alt: Number.parseFloat(document.getElementById("alt").value) || 0,
          url: document.getElementById("url").value || "",
          // Detalles técnicos
          length: Number.parseFloat(document.getElementById("length").value) || null,
          turns: Number.parseInt(document.getElementById("turns").value) || null,
          drsZones: Number.parseInt(document.getElementById("drsZones").value) || null,
          maxSpeed: Number.parseInt(document.getElementById("maxSpeed").value) || null,
          capacity: Number.parseInt(document.getElementById("capacity").value) || null,
          inauguratedYear: Number.parseInt(document.getElementById("inauguratedYear").value) || null,
          lapRecord: document.getElementById("lapRecord").value || null,
          lapRecordHolder: document.getElementById("lapRecordHolder").value || null,
          description: document.getElementById("description").value || null,
          category: document.getElementById("category").value,
          // Multimedia
          circuitLayout: document.getElementById("circuitLayout").value || null,
          heroImage: document.getElementById("heroImage").value || null,
          videoUrl: document.getElementById("videoUrl").value || null,
        }
  
        // Reemplazar con:
  
        // Recopilar datos del formulario - Versión simplificada que coincide con el formato existente
        //const circuitData = {
        //  name: document.getElementById("name").value,
        //  circuitRef: document.getElementById("circuitRef").value,
        //  location: document.getElementById("location").value,
        //  country: document.getElementById("country").value,
        //  lat: parseFloat(document.getElementById("lat").value),
        //  lng: parseFloat(document.getElementById("lng").value),
        //  alt: parseFloat(document.getElementById("alt").value) || 0,
        //  url: document.getElementById("url").value || ""
        //};
  
        // Añadir campos adicionales solo si tienen valor
        const additionalFields = {
          // Detalles técnicos
          length: document.getElementById("length").value
            ? Number.parseFloat(document.getElementById("length").value)
            : undefined,
          turns: document.getElementById("turns").value
            ? Number.parseInt(document.getElementById("turns").value)
            : undefined,
          drsZones: document.getElementById("drsZones").value
            ? Number.parseInt(document.getElementById("drsZones").value)
            : undefined,
          maxSpeed: document.getElementById("maxSpeed").value
            ? Number.parseInt(document.getElementById("maxSpeed").value)
            : undefined,
          capacity: document.getElementById("capacity").value
            ? Number.parseInt(document.getElementById("capacity").value)
            : undefined,
          inauguratedYear: document.getElementById("inauguratedYear").value
            ? Number.parseInt(document.getElementById("inauguratedYear").value)
            : undefined,
          lapRecord: document.getElementById("lapRecord").value || undefined,
          lapRecordHolder: document.getElementById("lapRecordHolder").value || undefined,
          description: document.getElementById("description").value || undefined,
          category: document.getElementById("category").value,
          // Multimedia
          circuitLayout: document.getElementById("circuitLayout").value || undefined,
          heroImage: document.getElementById("heroImage").value || undefined,
          videoUrl: document.getElementById("videoUrl").value || undefined,
        }
  
        // Añadir solo los campos que tienen valor
        Object.keys(additionalFields).forEach((key) => {
          if (additionalFields[key] !== undefined) {
            circuitData[key] = additionalFields[key]
          }
        })
  
        console.log("Datos simplificados del circuito:", circuitData)
  
        console.log("Enviando datos:", circuitData)
  
        // Verificar la URL de la API
        console.log("URL de la API:", "http://localhost:3000/circuitos")
  
        // Enviar datos a la API
        const response = await fetch("http://localhost:3000/circuitos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(circuitData),
        })
  
        // Registrar información detallada de la respuesta
        console.log("Respuesta completa:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers]),
          url: response.url,
        })
  
        console.log("Respuesta del servidor:", response.status)
  
        // Manejar respuestas no-OK
        if (!response.ok) {
          // Crear una copia de la respuesta para poder leerla múltiples veces
          const responseClone = response.clone()
  
          let errorMessage
          try {
            // Intentar parsear como JSON
            const errorData = await responseClone.json()
            errorMessage = errorData.message || `Error: ${response.status}`
          } catch (parseError) {
            try {
              // Si no es JSON, usar el texto de la respuesta
              const errorText = await response.text()
              console.error("Respuesta no-JSON:", errorText)
              errorMessage = `Error ${response.status}: ${errorText || "No se pudo procesar la respuesta del servidor"}`
            } catch (textError) {
              // Si tampoco podemos leer como texto
              errorMessage = `Error ${response.status}: No se pudo leer la respuesta del servidor`
            }
          }
          throw new Error(errorMessage)
        }
  
        // Parsear la respuesta JSON
        let savedCircuit
        try {
          // Crear una copia de la respuesta para evitar errores de "body already read"
          const responseClone = response.clone()
  
          try {
            savedCircuit = await responseClone.json()
            console.log("Circuito guardado:", savedCircuit)
          } catch (jsonError) {
            console.error("Error al parsear JSON:", jsonError)
  
            // Intentar leer como texto si falla el JSON
            const textResponse = await response.text()
            console.log("Respuesta como texto:", textResponse)
  
            // Intentar convertir el texto a JSON si es posible
            try {
              savedCircuit = JSON.parse(textResponse)
              console.log("Texto convertido a JSON:", savedCircuit)
            } catch (parseError) {
              console.error("No se pudo convertir el texto a JSON:", parseError)
              throw new Error("Error al procesar la respuesta del servidor: " + textResponse)
            }
          }
        } catch (parseError) {
          console.error("Error al procesar la respuesta:", parseError)
          throw new Error("Error al procesar la respuesta del servidor")
        }
  
        // Mostrar mensaje de éxito
        showAlert("¡Circuito creado con éxito!", "success")
  
        // Redirigir a la página de detalle después de 2 segundos
        setTimeout(() => {
          window.location.href = `/HTML/eventos/detalleEventos.html?id=${savedCircuit.circuitId}`
        }, 2000)
      } catch (error) {
        console.error("Error:", error)
        showAlert(`Error al guardar el circuito: ${error.message}`, "danger")
      } finally {
        // Restaurar el botón
        submitButton.innerHTML = originalButtonText
        submitButton.disabled = false
      }
    })
  
    // Inicializar
    document.querySelectorAll('.nav-link[data-bs-toggle="tab"]').forEach((tab) => {
      tab.addEventListener("shown.bs.tab", (event) => {
        // Actualizar la URL con el hash de la pestaña activa
        history.pushState(null, null, event.target.getAttribute("data-bs-target"))
      })
    })
  
    // Activar la pestaña correspondiente si hay un hash en la URL
    const hash = window.location.hash
    if (hash) {
      const tab = document.querySelector(`.nav-link[data-bs-target="${hash}"]`)
      if (tab) {
        try {
          // Ensure bootstrap is available
          if (typeof bootstrap !== "undefined") {
            const bsTab = new bootstrap.Tab(tab)
            bsTab.show()
          } else {
            console.error("Bootstrap is not defined. Ensure it is properly loaded.")
          }
        } catch (error) {
          console.error("Error al activar la pestaña:", error)
        }
      }
    }
  })
  
  