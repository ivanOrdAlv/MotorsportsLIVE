import supabase from "../services/supabase.js"
import * as bootstrap from "bootstrap"

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#loginModal form")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }
})

async function handleLogin(event) {
  event.preventDefault()

  // Obtener los datos del formulario
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Validar datos
  if (!email || !password) {
    mostrarNotificacion("Por favor, ingresa tu correo electrónico y contraseña.", "error")
    return
  }

  // Mostrar indicador de carga
  const submitBtn = event.target.querySelector('button[type="submit"]')
  const originalBtnText = submitBtn.innerHTML
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...'
  submitBtn.disabled = true

  try {
    // Iniciar sesión en Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user || !data.session) {
      throw new Error("No se pudo iniciar sesión")
    }

    // Guardar token
    localStorage.setItem("token", data.session.access_token)

    // Si es "recordarme", guardar el refresh token
    if (rememberMe) {
      localStorage.setItem("refreshToken", data.session.refresh_token)
    }

    // Verificar si es primer acceso consultando la tabla Usuarios
    const { data: userData, error: userError } = await supabase
      .from("Usuarios")
      .select("nombre, apellidos, tipo, primer_acceso")
      .eq("id", data.user.id)
      .single()

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false

    // Cerrar modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"))
    if (loginModal) {
      loginModal.hide()
    }

    // Mostrar mensaje de éxito
    mostrarNotificacion(`¡Bienvenido${userData?.nombre ? " " + userData.nombre : ""}!`, "success")

    // Determinar redirección según el tipo de usuario y si es primer acceso
    if (userError || !userData) {
      // Si no hay datos en la tabla Usuarios, consideramos que es primer acceso
      localStorage.setItem("primerAcceso", "true")
      window.location.href = "/HTML/usuario/primerAcceso.html"
    } else if (userData.primer_acceso) {
      localStorage.setItem("primerAcceso", "true")
      window.location.href = "/HTML/usuario/primerAcceso.html"
    } else {
      // Redirigir según el tipo de usuario
      switch (userData.tipo) {
        case "administrador":
          window.location.href = "/HTML/admin/admin.html"
          break
        case "editor":
          window.location.href = "/HTML/admin/editor.html"
          break
        default:
          // Recargar la página actual para usuarios invitados
          window.location.reload()
      }
    }
  } catch (error) {
    console.error("Error:", error)
    mostrarNotificacion(`Error al iniciar sesión: ${error.message}`, "error")

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false
  }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
  // Si existe un sistema de notificaciones, usarlo
  if (window.toast) {
    window.toast(mensaje, { type: tipo })
    return
  }

  // Si no, usar alert para errores y console.log para éxitos
  if (tipo === "error") {
    alert(mensaje)
  } else {
    console.log(mensaje)
  }
}
