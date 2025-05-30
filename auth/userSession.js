import supabaseClient from './supabase.js'

async function checkUserSession() {
  try {
    console.log("Verificando sesión de usuario...")

    // Verificar si hay una sesión activa en Supabase
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession()

    console.log("Sesión actual:", { session, error })

    if (error) {
      console.error("Error al obtener sesión:", error)
      showLoginButton()
      return
    }

    if (session && session.user) {
      // Hay una sesión activa, obtener datos del usuario
      const { data: userData, error: userError } = await supabaseClient
        .from("Usuarios")
        .select("nombre, apellidos, email, tipoUsuario")
        .eq("id", session.user.id)
        .single()

      console.log("Datos del usuario desde BD:", { userData, userError })

      if (userData) {
        // Actualizar localStorage con los datos más recientes
        localStorage.setItem("token", session.access_token)
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: session.user.id,
            email: userData.email,
            nombre: userData.nombre,
            apellidos: userData.apellidos,
            tipoUsuario: userData.tipoUsuario,
          }),
        )

        // Mostrar información del usuario en la interfaz
        showUserInfo(userData)
      } else {
        // No hay datos en la tabla personalizada, mostrar botón de login
        showLoginButton()
      }
    } else {
      // No hay sesión activa
      showLoginButton()
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error)
    showLoginButton()
  }
}

// Función para mostrar el botón de inicio de sesión
function showLoginButton() {
  const authContainer = document.getElementById("auth-container")
  if (authContainer) {
    authContainer.innerHTML = `
      <button class="btn btn-motorsport" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
      </button>
    `
  }
}

// Función para mostrar la información del usuario
function showUserInfo(userData) {
  const authContainer = document.getElementById("auth-container")
  if (authContainer) {
    authContainer.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-toggle" onclick="toggleUserMenu()">
          <i class="bi bi-person-circle"></i>
          <span>${userData.nombre}</span>
          <i class="bi bi-chevron-down"></i>
        </button>
        <div class="user-menu-dropdown" id="userMenuDropdown">
          <a href="/HTML/cuenta/verCuenta.html" class="user-menu-item">
            <i class="bi bi-person"></i> Mi Perfil
          </a>
          ${
            userData.tipoUsuario === "Editor"
              ? '<a href="/HTML/editor/editor.html" class="user-menu-item"><i class="bi bi-pencil-square"></i> Panel de Editor</a>'
              : ""
          }
          ${
            userData.tipoUsuario === "Administrador"
              ? '<a href="/HTML/admin/admin.html" class="user-menu-item"><i class="bi bi-gear"></i> Panel de Administración</a>'
              : ""
          }
          <div class="user-menu-divider"></div>
          <a href="#" class="user-menu-item logout" onclick="logout()">
            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
          </a>
        </div>
      </div>
    `
  }
}

// Función para alternar el menú de usuario
function toggleUserMenu() {
  const dropdown = document.getElementById("userMenuDropdown")
  if (dropdown) {
    dropdown.classList.toggle("show")
  }
}

// Función para cerrar sesión
async function logout() {
  try {
    console.log("Cerrando sesión...")

    // Cerrar sesión en Supabase
    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      console.error("Error al cerrar sesión:", error)
    }

    // Limpiar localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    localStorage.removeItem("primerAcceso")
    localStorage.removeItem("refreshToken")

    // Recargar la página para mostrar la interfaz de usuario no autenticado
    window.location.reload()
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.")
  }
}

// Cerrar el menú de usuario si se hace clic fuera de él
document.addEventListener("click", (event) => {
  const userMenu = document.querySelector(".user-menu")
  const dropdown = document.getElementById("userMenuDropdown")

  if (userMenu && dropdown && !userMenu.contains(event.target)) {
    dropdown.classList.remove("show")
  }
})

// Hacer las funciones disponibles globalmente
window.checkUserSession = checkUserSession
window.toggleUserMenu = toggleUserMenu
window.logout = logout
