document.addEventListener("DOMContentLoaded", () => {
    // Comprobar si el usuario está autenticado
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "../auth/login.html"
      return
    }
  
    // Cargar datos del usuario
    loadUserData()
  
    // Event listeners
    document.getElementById("cerrarSesionBtn").addEventListener("click", logout)
    document.getElementById("misFavoritosBtn").addEventListener("click", navigateToFavorites)
    document.getElementById("misComentariosBtn").addEventListener("click", navigateToComments)
  
    // Event listeners para el formulario de eliminación
    document.getElementById("confirm-delete").addEventListener("change", toggleDeleteButton)
    document.getElementById("password-confirm").addEventListener("input", toggleDeleteButton)
    document.getElementById("deleteAccountBtn").addEventListener("click", confirmDeleteAccount)
    document.getElementById("finalDeleteBtn").addEventListener("click", deleteAccount)
  
    // Event listener para mostrar campo de otro motivo
    document.getElementById("razon5").addEventListener("change", function () {
      document.getElementById("otro-motivo-container").classList.toggle("d-none", !this.checked)
    })
  })
  
  // Función para cargar los datos del usuario
  async function loadUserData() {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/usuarios/perfil", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (!response.ok) {
        throw new Error("Error al cargar los datos del usuario")
      }
  
      const userData = await response.json()
  
      // Actualizar la información del sidebar
      document.getElementById("userName").textContent = `${userData.nombre} ${userData.apellido}`
      document.getElementById("userEmail").textContent = userData.email
  
      if (userData.avatar) {
        document.getElementById("userAvatar").src = userData.avatar
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar los datos del usuario. Por favor, intenta de nuevo más tarde.")
    }
  }
  
  // Función para habilitar/deshabilitar el botón de eliminar cuenta
  function toggleDeleteButton() {
    const confirmCheckbox = document.getElementById("confirm-delete").checked
    const password = document.getElementById("password-confirm").value.trim()
  
    document.getElementById("deleteAccountBtn").disabled = !(confirmCheckbox && password)
  }
  
  // Función para mostrar el modal de confirmación final
  function confirmDeleteAccount() {
    const confirmDeleteModal = document.getElementById("confirmDeleteModal")
    const modal = new bootstrap.Modal(confirmDeleteModal)
    modal.show()
  }
  
  // Función para eliminar la cuenta
  async function deleteAccount() {
    const password = document.getElementById("password-confirm").value.trim()
    const razonElement = document.querySelector('input[name="razon-eliminacion"]:checked')
  
    if (!password) {
      alert("Por favor, ingresa tu contraseña para confirmar.")
      return
    }
  
    if (!razonElement) {
      alert("Por favor, selecciona un motivo para eliminar tu cuenta.")
      return
    }
  
    const razon = razonElement.value
    let comentario = ""
  
    if (razon === "otro") {
      comentario = document.getElementById("otro-motivo").value.trim()
    }
  
    try {
      // Mostrar indicador de carga
      const deleteBtn = document.getElementById("finalDeleteBtn")
      const originalBtnText = deleteBtn.innerHTML
      deleteBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...'
      deleteBtn.disabled = true
  
      const token = localStorage.getItem("token")
      const response = await fetch("/api/usuarios/eliminar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: password,
          razon: razon,
          comentario: comentario,
        }),
      })
  
      // Restaurar botón
      deleteBtn.innerHTML = originalBtnText
      deleteBtn.disabled = false
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar la cuenta")
      }
  
      // Eliminar datos de sesión
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
  
      // Redirigir a la página de confirmación
      window.location.href = "../auth/cuenta-eliminada.html"
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar la cuenta: " + error.message)
    }
  }
  
  // Función para cerrar sesión
  function logout() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      window.location.href = "../auth/login.html"
    }
  }
  
  // Función para navegar a favoritos
  function navigateToFavorites(event) {
    event.preventDefault()
    alert("Funcionalidad de favoritos en desarrollo")
    // Implementar navegación a favoritos cuando esté disponible
  }
  
  // Función para navegar a comentarios
  function navigateToComments(event) {
    event.preventDefault()
    alert("Funcionalidad de comentarios en desarrollo")
    // Implementar navegación a comentarios cuando esté disponible
  }
  