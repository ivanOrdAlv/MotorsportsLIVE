import * as bootstrap from "bootstrap"

document.addEventListener("DOMContentLoaded", () => {
  // Obtener el ID del editor de la URL
  const urlParams = new URLSearchParams(window.location.search)
  const editorId = urlParams.get("id")

  if (!editorId) {
    // Redirigir a la página de lista de editores si no hay ID
    window.location.href = "../admin/eliminarEditores.html"
    return
  }

  // Cargar los datos del editor
  loadEditorData(editorId)

  // Manejar el checkbox de confirmación
  const confirmCheck = document.getElementById("confirmCheck")
  const deleteButton = document.getElementById("deleteButton")

  confirmCheck.addEventListener("change", function () {
    deleteButton.disabled = !this.checked
  })

  // Manejar el botón de eliminar
  deleteButton.addEventListener("click", () => {
    // Mostrar el modal de confirmación final
    const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"))
    confirmationModal.show()
  })

  // Manejar el botón de eliminación final
  const finalDeleteButton = document.getElementById("finalDeleteButton")
  finalDeleteButton.addEventListener("click", () => {
    deleteEditor(editorId)
  })
})

/**
 * Carga los datos del editor desde la API
 * @param {string} editorId - ID del editor a cargar
 */
async function loadEditorData(editorId) {
  try {
    // Simulación de carga de datos (reemplazar con llamada real a la API)
    // En un caso real, harías un fetch a tu API
    const response = await simulateFetch(`/api/editors/${editorId}`)

    if (response.success) {
      displayEditorData(response.data)
      loadRecentActivity(editorId)
    } else {
      showError("No se pudo cargar la información del editor")
      setTimeout(() => {
        window.location.href = "../admin/eliminarEditores.html"
      }, 3000)
    }
  } catch (error) {
    console.error("Error al cargar los datos del editor:", error)
    showError("Error al cargar los datos del editor")
  }
}

/**
 * Muestra los datos del editor en la interfaz
 * @param {Object} editor - Datos del editor
 */
function displayEditorData(editor) {
  // Actualizar la información básica
  document.getElementById("editorName").textContent = `${editor.nombre} ${editor.apellido}`
  document.getElementById("modalEditorName").textContent = `${editor.nombre} ${editor.apellido}`
  document.getElementById("editorEmail").textContent = editor.email
  document.getElementById("editorPhone").textContent = editor.telefono || "No disponible"
  document.getElementById("editorLocation").textContent = editor.ubicacion || "No disponible"
  document.getElementById("editorSince").textContent = `Miembro desde: ${formatDate(editor.fechaCreacion)}`
  document.getElementById("editorLastLogin").textContent = formatDate(editor.ultimoAcceso)

  // Actualizar el avatar si existe
  if (editor.avatar) {
    document.getElementById("editorAvatar").src = editor.avatar
  }

  // Actualizar las estadísticas
  document.getElementById("articlesCount").textContent = editor.estadisticas?.articulos || 0
  document.getElementById("eventsCount").textContent = editor.estadisticas?.eventos || 0
  document.getElementById("driversCount").textContent = editor.estadisticas?.pilotos || 0
  document.getElementById("teamsCount").textContent = editor.estadisticas?.equipos || 0

  // Actualizar el rol
  const roleBadge = document.getElementById("editorRole")
  roleBadge.textContent = editor.rol || "Editor"

  // Cambiar el color del badge según el rol
  if (editor.rol === "Editor Senior") {
    roleBadge.classList.remove("bg-primary")
    roleBadge.classList.add("bg-success")
  } else if (editor.rol === "Editor Jefe") {
    roleBadge.classList.remove("bg-primary")
    roleBadge.classList.add("bg-danger")
  }
}

/**
 * Carga la actividad reciente del editor
 * @param {string} editorId - ID del editor
 */
async function loadRecentActivity(editorId) {
  try {
    // Simulación de carga de datos (reemplazar con llamada real a la API)
    const response = await simulateFetch(`/api/editors/${editorId}/activity`)

    if (response.success) {
      displayRecentActivity(response.data)
    } else {
      document.getElementById("recentActivityList").innerHTML = `
                <li class="list-group-item">
                    <p class="mb-0">No hay actividad reciente disponible</p>
                </li>
            `
    }
  } catch (error) {
    console.error("Error al cargar la actividad reciente:", error)
  }
}

/**
 * Muestra la actividad reciente en la interfaz
 * @param {Array} activities - Lista de actividades recientes
 */
function displayRecentActivity(activities) {
  const activityList = document.getElementById("recentActivityList")

  if (!activities || activities.length === 0) {
    activityList.innerHTML = `
            <li class="list-group-item">
                <p class="mb-0">No hay actividad reciente disponible</p>
            </li>
        `
    return
  }

  let html = ""

  activities.forEach((activity) => {
    // Determinar el color del indicador según el tipo de actividad
    let indicatorColor = "bg-primary"

    switch (activity.tipo) {
      case "articulo":
        indicatorColor = "bg-info"
        break
      case "evento":
        indicatorColor = "bg-success"
        break
      case "piloto":
        indicatorColor = "bg-warning"
        break
      case "equipo":
        indicatorColor = "bg-danger"
        break
      case "login":
        indicatorColor = "bg-secondary"
        break
    }

    html += `
            <li class="list-group-item d-flex align-items-center">
                <div class="activity-indicator ${indicatorColor}"></div>
                <div>
                    <p class="mb-0">${activity.descripcion}</p>
                    <small class="text-muted">${formatDate(activity.fecha)}</small>
                </div>
            </li>
        `
  })

  activityList.innerHTML = html
}

/**
 * Elimina un editor
 * @param {string} editorId - ID del editor a eliminar
 */
async function deleteEditor(editorId) {
  try {
    // Simulación de eliminación (reemplazar con llamada real a la API)
    const response = await simulateFetch(`/api/editors/${editorId}`, {
      method: "DELETE",
    })

    if (response.success) {
      // Cerrar el modal de confirmación
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById("confirmationModal"))
      confirmationModal.hide()

      // Mostrar toast de éxito
      const successToast = new bootstrap.Toast(document.getElementById("successToast"))
      successToast.show()

      // Redirigir después de un breve retraso
      setTimeout(() => {
        window.location.href = "../admin/eliminarEditores.html?deleted=true"
      }, 2000)
    } else {
      showError(response.message || "Error al eliminar el editor")
    }
  } catch (error) {
    console.error("Error al eliminar el editor:", error)
    showError("Error al eliminar el editor")
  }
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
  alert(message) // Reemplazar con una mejor UI para errores
}

/**
 * Formatea una fecha para mostrarla
 * @param {string} dateString - Fecha en formato string
 * @returns {string} - Fecha formateada
 */
function formatDate(dateString) {
  if (!dateString) return "No disponible"

  const date = new Date(dateString)
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Simula una llamada a la API para desarrollo
 * @param {string} url - URL de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>} - Respuesta simulada
 */
function simulateFetch(url, options = {}) {
  return new Promise((resolve) => {
    // Simular un retraso de red
    setTimeout(() => {
      // Si es una solicitud para obtener datos del editor
      if (url.includes("/api/editors/") && !url.includes("/activity") && options.method !== "DELETE") {
        resolve({
          success: true,
          data: {
            id: "123",
            nombre: "Carlos",
            apellido: "Rodríguez",
            email: "carlos.rodriguez@motorsportlive.com",
            telefono: "+34 612 345 678",
            ubicacion: "Madrid, España",
            fechaCreacion: "2022-03-15T10:30:00",
            ultimoAcceso: "2023-04-20T15:45:00",
            rol: "Editor Senior",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            estadisticas: {
              articulos: 47,
              eventos: 12,
              pilotos: 8,
              equipos: 5,
            },
          },
        })
      }
      // Si es una solicitud para obtener la actividad reciente
      else if (url.includes("/activity")) {
        resolve({
          success: true,
          data: [
            {
              id: "1",
              tipo: "articulo",
              descripcion: 'Publicó el artículo "Hamilton domina en Silverstone"',
              fecha: "2023-04-19T14:30:00",
            },
            {
              id: "2",
              tipo: "evento",
              descripcion: "Actualizó los resultados del GP de España",
              fecha: "2023-04-18T10:15:00",
            },
            {
              id: "3",
              tipo: "piloto",
              descripcion: "Editó el perfil de Max Verstappen",
              fecha: "2023-04-17T16:45:00",
            },
            {
              id: "4",
              tipo: "login",
              descripcion: "Inició sesión en el sistema",
              fecha: "2023-04-17T09:00:00",
            },
            {
              id: "5",
              tipo: "equipo",
              descripcion: "Actualizó la información de Ferrari",
              fecha: "2023-04-16T11:30:00",
            },
          ],
        })
      }
      // Si es una solicitud para eliminar un editor
      else if (options.method === "DELETE") {
        resolve({
          success: true,
          message: "Editor eliminado correctamente",
        })
      }
      // Respuesta por defecto
      else {
        resolve({
          success: false,
          message: "Operación no soportada en el modo de simulación",
        })
      }
    }, 800) // Simular un retraso de 800ms
  })
}
