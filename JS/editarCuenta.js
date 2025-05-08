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
    document.getElementById("editProfileForm").addEventListener("submit", saveProfileChanges)
    document.getElementById("changeAvatarBtn").addEventListener("click", openAvatarModal)
    document.getElementById("avatarUpload").addEventListener("change", handleAvatarPreview)
    document.getElementById("saveAvatarBtn").addEventListener("click", saveAvatar)
    document.getElementById("cerrarSesionBtn").addEventListener("click", logout)
    document.getElementById("misFavoritosBtn").addEventListener("click", navigateToFavorites)
    document.getElementById("misComentariosBtn").addEventListener("click", navigateToComments)
  
    // Validación de contraseñas
    document.getElementById("password").addEventListener("input", validatePasswords)
    document.getElementById("confirm-password").addEventListener("input", validatePasswords)
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
  
      // Rellenar el formulario con los datos del usuario
      document.getElementById("nombre").value = userData.nombre || ""
      document.getElementById("apellido").value = userData.apellido || ""
      document.getElementById("email").value = userData.email || ""
      document.getElementById("telefono").value = userData.telefono || ""
      document.getElementById("direccion").value = userData.direccion || ""
      document.getElementById("ciudad").value = userData.ciudad || ""
      document.getElementById("codigo-postal").value = userData.codigoPostal || ""
  
      if (userData.fechaNacimiento) {
        // Formatear la fecha para el input date (YYYY-MM-DD)
        const fecha = new Date(userData.fechaNacimiento)
        const fechaFormateada = fecha.toISOString().split("T")[0]
        document.getElementById("fecha-nacimiento").value = fechaFormateada
      }
  
      // Marcar categorías favoritas
      if (userData.categoriasFavoritas && userData.categoriasFavoritas.length > 0) {
        userData.categoriasFavoritas.forEach((categoria) => {
          const checkbox = document.getElementById(`cat-${categoria.toLowerCase()}`)
          if (checkbox) {
            checkbox.checked = true
          }
        })
      }
  
      // Configurar preferencias de notificaciones
      if (userData.recibirNotificaciones) {
        document.getElementById("recibir-notificaciones").checked = true
      }
  
      // Ocultar spinner y mostrar formulario
      document.getElementById("formLoading").classList.add("d-none")
      document.getElementById("editProfileForm").classList.remove("d-none")
    } catch (error) {
      console.error("Error:", error)
      // Mostrar mensaje de error
      document.getElementById("formLoading").innerHTML = `
              <div class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Error al cargar los datos del usuario. Por favor, intenta de nuevo más tarde.
              </div>
          `
    }
  }
  
  // Función para guardar los cambios del perfil
  async function saveProfileChanges(event) {
    event.preventDefault()
  
    // Validar contraseñas si se están cambiando
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value
    const currentPassword = document.getElementById("current-password").value
  
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        showToast("Error", "Las contraseñas no coinciden", "error")
        return
      }
  
      if (!currentPassword) {
        showToast("Error", "Debes ingresar tu contraseña actual para cambiarla", "error")
        return
      }
    }
  
    // Recopilar datos del formulario
    const formData = {
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      email: document.getElementById("email").value,
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
      ciudad: document.getElementById("ciudad").value,
      codigoPostal: document.getElementById("codigo-postal").value,
      fechaNacimiento: document.getElementById("fecha-nacimiento").value,
      categoriasFavoritas: [],
      recibirNotificaciones: document.getElementById("recibir-notificaciones").checked,
    }
  
    // Recopilar categorías favoritas
    const categorias = document.querySelectorAll('input[name="categorias"]:checked')
    categorias.forEach((cat) => {
      formData.categoriasFavoritas.push(cat.value)
    })
  
    // Añadir contraseñas si se están cambiando
    if (password && currentPassword) {
      formData.currentPassword = currentPassword
      formData.newPassword = password
    }
  
    try {
      // Mostrar indicador de carga
      const saveBtn = document.getElementById("saveProfileBtn")
      const originalBtnText = saveBtn.innerHTML
      saveBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
      saveBtn.disabled = true
  
      const token = localStorage.getItem("token")
      const response = await fetch("/api/usuarios/actualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
  
      // Restaurar botón
      saveBtn.innerHTML = originalBtnText
      saveBtn.disabled = false
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el perfil")
      }
  
      // Mostrar mensaje de éxito
      showToast("Éxito", "Perfil actualizado correctamente", "success")
  
      // Actualizar datos en localStorage si es necesario
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.nombre = formData.nombre
      userData.apellido = formData.apellido
      localStorage.setItem("userData", JSON.stringify(userData))
  
      // Actualizar nombre en el sidebar
      document.getElementById("userName").textContent = `${formData.nombre} ${formData.apellido}`
    } catch (error) {
      console.error("Error:", error)
      showToast("Error", error.message || "Error al actualizar el perfil", "error")
    }
  }
  
  // Función para validar que las contraseñas coincidan
  function validatePasswords() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value
  
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        document.getElementById("confirm-password").setCustomValidity("Las contraseñas no coinciden")
      } else {
        document.getElementById("confirm-password").setCustomValidity("")
      }
    } else {
      document.getElementById("confirm-password").setCustomValidity("")
    }
  }
  
  // Función para abrir el modal de cambio de avatar
  function openAvatarModal() {
    const modal = new bootstrap.Modal(document.getElementById("changeAvatarModal"))
    modal.show()
  }
  
  // Función para manejar la vista previa del avatar
  function handleAvatarPreview(event) {
    const file = event.target.files[0]
    if (!file) return
  
    // Validar que sea una imagen
    if (!file.type.match("image.*")) {
      showToast("Error", "Por favor, selecciona un archivo de imagen válido", "error")
      return
    }
  
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Error", "La imagen es demasiado grande. El tamaño máximo permitido es 2MB", "error")
      return
    }
  
    const reader = new FileReader()
    reader.onload = (e) => {
      document.getElementById("avatarPreview").src = e.target.result
    }
    reader.readAsDataURL(file)
  }
  
  // Función para guardar el avatar
  async function saveAvatar() {
    const fileInput = document.getElementById("avatarUpload")
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast("Error", "Por favor, selecciona una imagen", "error")
      return
    }
  
    const file = fileInput.files[0]
    const formData = new FormData()
    formData.append("avatar", file)
  
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/usuarios/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error("Error al actualizar el avatar")
      }
  
      const data = await response.json()
  
      // Actualizar avatar en la página
      document.getElementById("userAvatar").src = data.avatarUrl
  
      // Cerrar modal
      const modalElement = document.getElementById("changeAvatarModal")
      const modal = bootstrap.Modal.getInstance(modalElement)
      modal.hide()
  
      // Mostrar mensaje de éxito
      showToast("Éxito", "Avatar actualizado correctamente", "success")
    } catch (error) {
      console.error("Error:", error)
      showToast("Error", "Error al actualizar el avatar", "error")
    }
  }
  
  // Función para mostrar notificaciones toast
  function showToast(title, message, type = "info") {
    const toastEl = document.getElementById("notificationToast")
    const toast = new bootstrap.Toast(toastEl)
  
    document.getElementById("toastTitle").textContent = title
    document.getElementById("toastMessage").textContent = message
  
    // Aplicar clase según el tipo
    toastEl.className = "toast"
    if (type === "error") {
      toastEl.classList.add("bg-danger", "text-white")
    } else if (type === "success") {
      toastEl.classList.add("bg-success", "text-white")
    } else if (type === "warning") {
      toastEl.classList.add("bg-warning")
    } else {
      toastEl.classList.add("bg-info", "text-white")
    }
  
    toast.show()
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
  