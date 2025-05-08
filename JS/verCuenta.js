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
    document.getElementById("changeAvatarBtn").addEventListener("click", openAvatarModal)
    document.getElementById("avatarUpload").addEventListener("change", handleAvatarPreview)
    document.getElementById("saveAvatarBtn").addEventListener("click", saveAvatar)
    document.getElementById("cerrarSesionBtn").addEventListener("click", logout)
    document.getElementById("misFavoritosBtn").addEventListener("click", navigateToFavorites)
    document.getElementById("misComentariosBtn").addEventListener("click", navigateToComments)
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
  
      // Actualizar la información del perfil
      document.getElementById("fullName").textContent = `${userData.nombre} ${userData.apellido}`
      document.getElementById("birthDate").textContent = formatDate(userData.fechaNacimiento)
      document.getElementById("memberSince").textContent = formatDate(userData.fechaRegistro)
      document.getElementById("emailAddress").textContent = userData.email
      document.getElementById("phoneNumber").textContent = userData.telefono || "No especificado"
  
      let direccionCompleta = ""
      if (userData.direccion) {
        direccionCompleta += userData.direccion
        if (userData.ciudad) direccionCompleta += `, ${userData.ciudad}`
        if (userData.codigoPostal) direccionCompleta += ` (${userData.codigoPostal})`
        if (userData.pais) direccionCompleta += `, ${userData.pais}`
      } else {
        direccionCompleta = "No especificada"
      }
  
      document.getElementById("address").textContent = direccionCompleta
  
      // Mostrar categorías favoritas
      if (userData.categoriasFavoritas && userData.categoriasFavoritas.length > 0) {
        const categoriesContainer = document.getElementById("favoriteCategories")
        categoriesContainer.innerHTML = ""
  
        userData.categoriasFavoritas.forEach((categoria) => {
          const categoryTag = document.createElement("span")
          categoryTag.className = `category-tag ${categoria.toLowerCase()}`
          categoryTag.textContent = getCategoryName(categoria)
          categoriesContainer.appendChild(categoryTag)
        })
      } else {
        document.getElementById("favoriteCategories").innerHTML =
          '<p class="text-muted">No has seleccionado categorías favoritas</p>'
      }
  
      // Mostrar información de actividad
      document.getElementById("lastLogin").textContent = userData.ultimoAcceso
        ? formatDate(userData.ultimoAcceso, true)
        : "No disponible"
      document.getElementById("commentsCount").textContent = userData.comentariosCount || "0"
  
      // Ocultar spinner y mostrar contenido
      document.getElementById("profileLoading").classList.add("d-none")
      document.getElementById("profileContent").classList.remove("d-none")
    } catch (error) {
      console.error("Error:", error)
      // Mostrar mensaje de error
      document.getElementById("profileLoading").innerHTML = `
              <div class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Error al cargar los datos del usuario. Por favor, intenta de nuevo más tarde.
              </div>
          `
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
      alert("Por favor, selecciona un archivo de imagen válido.")
      return
    }
  
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado grande. El tamaño máximo permitido es 2MB.")
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
      alert("Por favor, selecciona una imagen.")
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
      alert("Avatar actualizado correctamente")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el avatar. Por favor, intenta de nuevo.")
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
  
  // Función para formatear fechas
  function formatDate(dateString, includeTime = false) {
    if (!dateString) return "No disponible"
  
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  
    if (includeTime) {
      options.hour = "2-digit"
      options.minute = "2-digit"
    }
  
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }
  
  // Función para obtener el nombre legible de una categoría
  function getCategoryName(categoryCode) {
    const categories = {
      formula1: "Fórmula 1",
      formula2: "Fórmula 2",
      formula3: "Fórmula 3",
      motogp: "MotoGP",
      wrc: "WRC",
      wec: "WEC",
      indycar: "IndyCar",
    }
  
    return categories[categoryCode] || categoryCode
  }
  