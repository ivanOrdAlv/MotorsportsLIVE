// Sistema de notificaciones para MotorsportLIVE
// Este archivo crea un sistema de notificaciones tipo toast para la aplicación

// Crear el contenedor de notificaciones si no existe
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
      const toastContainer = document.createElement("div")
      toastContainer.id = "toast-container"
      toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3"
      document.body.appendChild(toastContainer)
    }
  
    // Exponer la función toast globalmente
    window.toast = mostrarToast
  })
  
  /**
   * Muestra una notificación toast
   * @param {string} mensaje - El mensaje a mostrar
   * @param {Object} opciones - Opciones de configuración
   * @param {string} opciones.type - Tipo de notificación: 'success', 'error', 'warning', 'info'
   * @param {number} opciones.duration - Duración en ms (por defecto 3000ms)
   */
  function mostrarToast(mensaje, opciones = {}) {
    const { type = "info", duration = 3000 } = opciones
  
    // Crear el elemento toast
    const toastEl = document.createElement("div")
    toastEl.className = "toast"
    toastEl.setAttribute("role", "alert")
    toastEl.setAttribute("aria-live", "assertive")
    toastEl.setAttribute("aria-atomic", "true")
  
    // Determinar el color según el tipo
    let bgColor, iconClass
    switch (type) {
      case "success":
        bgColor = "bg-success"
        iconClass = "bi-check-circle-fill"
        break
      case "error":
        bgColor = "bg-danger"
        iconClass = "bi-exclamation-circle-fill"
        break
      case "warning":
        bgColor = "bg-warning"
        iconClass = "bi-exclamation-triangle-fill"
        break
      default:
        bgColor = "bg-info"
        iconClass = "bi-info-circle-fill"
    }
  
    // Crear el contenido del toast
    toastEl.innerHTML = `
      <div class="toast-header ${bgColor} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${mensaje}
      </div>
    `
  
    // Añadir al contenedor
    const container = document.getElementById("toast-container")
    container.appendChild(toastEl)
  
    // Inicializar el toast con Bootstrap
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: duration,
    })
  
    // Mostrar el toast
    toast.show()
  
    // Eliminar el elemento cuando se oculte
    toastEl.addEventListener("hidden.bs.toast", () => {
      toastEl.remove()
    })
  }
  