import supabase from "../services/supabase.js"
import bootstrap from "bootstrap"
// Importar el CSS de Bootstrap para los toasts
import "bootstrap/dist/css/bootstrap.min.css"

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#registerModal form")

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }
})

async function handleRegister(event) {
  event.preventDefault()

  // Obtener los datos del formulario
  const nombre = document.getElementById("registerFirstName").value
  const apellidos = document.getElementById("registerLastName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("registerConfirmPassword").value
  const termsAccepted = document.getElementById("termsCheck").checked

  // Validar datos
  if (!nombre || !apellidos || !email || !password) {
    mostrarNotificacion("Por favor, completa todos los campos obligatorios.", "error")
    return
  }

  if (password !== confirmPassword) {
    mostrarNotificacion("Las contraseñas no coinciden.", "error")
    return
  }

  if (!termsAccepted) {
    mostrarNotificacion("Debes aceptar los términos y condiciones para continuar.", "error")
    return
  }

  // Mostrar indicador de carga
  const submitBtn = event.target.querySelector('button[type="submit"]')
  const originalBtnText = submitBtn.innerHTML
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...'
  submitBtn.disabled = true

  try {
    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellidos,
        },
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario")
    }

    // Crear entrada en la tabla Usuarios
    const { error: userError } = await supabase.from("Usuarios").insert({
      Id: authData.user.id,
      Email: email,
      Nombre: nombre,
      Apellidos: apellidos,
    })

    if (userError) {
      console.error("Error al crear entrada en Usuarios:", userError)
      // No interrumpimos el flujo por este error
    }

    // Guardar token y marcar como primer acceso
    localStorage.setItem("token", authData.session.access_token)
    localStorage.setItem("primerAcceso", "true")

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false

    // Cerrar modal
    const registerModalElement = document.getElementById("registerModal")
    if (registerModalElement) {
      const registerModal = bootstrap.Modal.getInstance(registerModalElement)
      if (registerModal) {
        registerModal.hide()
      }
    }

    // Mostrar mensaje de éxito
    mostrarNotificacion("¡Registro exitoso! Completa tu perfil para continuar.", "success")

    // Redirigir a la página de primer acceso
    setTimeout(() => {
      window.location.href = "/HTML/usuario/primerAcceso.html"
    }, 1500)
  } catch (error) {
    console.error("Error:", error)
    mostrarNotificacion(`Error al registrar: ${error.message}`, "error")

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
    alert(mensaje) // También mostramos alertas para éxitos importantes como el registro
  }
}
