document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")

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
    console.log("Iniciando registro de usuario...")

    // Paso 1: Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellidos,
          tipoUsuario: "Invitado",
        },
      },
    })

    console.log("Respuesta de signUp:", { authData, authError })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario en Authentication")
    }

    console.log("Usuario registrado en Auth:", authData.user.id)

    // Paso 2: Esperar un momento para asegurar que el usuario esté completamente creado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Paso 3: Crear entrada en la tabla Usuarios
    console.log("Insertando datos en tabla Usuarios...")

    const { data: userData, error: userError } = await window.supabaseClient
      .from("Usuarios")
      .insert([
        {
          id: authData.user.id,
          email: email,
          nombre: nombre,
          apellidos: apellidos,
          tipoUsuario: "Invitado",
        },
      ])
      .select()

    console.log("Respuesta de inserción en Usuarios:", { userData, userError })

    if (userError) {
      console.error("Error detallado al crear entrada en Usuarios:", userError)

      // Si hay error, intentar verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await window.supabaseClient
        .from("Usuarios")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      console.log("Verificación de usuario existente:", { existingUser, checkError })

      if (!existingUser) {
        // Si no existe y hay error, mostrar el error específico
        throw new Error(`Error al guardar datos del usuario: ${userError.message}`)
      }
    }

    // Paso 4: Verificar que los datos se guardaron correctamente
    const { data: verificationData, error: verificationError } = await window.supabaseClient
      .from("Usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    console.log("Verificación final:", { verificationData, verificationError })

    if (verificationError || !verificationData) {
      throw new Error("Los datos del usuario no se guardaron correctamente en la base de datos")
    }

    console.log("✅ Usuario guardado exitosamente en ambas tablas")

    // Paso 5: Guardar datos en localStorage
    if (authData.session) {
      localStorage.setItem("token", authData.session.access_token)
    }
    localStorage.setItem("primerAcceso", "true")

    // Guardar datos básicos del usuario
    localStorage.setItem(
      "userData",
      JSON.stringify({
        id: authData.user.id,
        email: email,
        nombre: nombre,
        apellidos: apellidos,
        tipoUsuario: "Invitado",
      }),
    )

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

    // Actualizar la interfaz para mostrar el nombre del usuario
    if (typeof checkUserSession === "function") {
      checkUserSession()
    }

    // Mostrar mensaje de éxito
    mostrarNotificacion("¡Registro exitoso! Usuario guardado correctamente.", "success")

    // Redirigir a la página de primer acceso
    setTimeout(() => {
      window.location.href = "/HTML/usuario/primerAcceso.html"
    }, 2000)
  } catch (error) {
    console.error("❌ Error completo:", error)
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
