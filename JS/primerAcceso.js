import supabase from "./services/supabase.js"

document.addEventListener("DOMContentLoaded", async () => {
  // Comprobar si el usuario está autenticado
  const token = localStorage.getItem("token")
  if (!token) {
    window.location.href = "../auth/login.html"
    return
  }

  // Verificar si es el primer acceso
  const primerAcceso = localStorage.getItem("primerAcceso") === "true"
  if (!primerAcceso) {
    window.location.href = "../../index.html"
    return
  }

  // Event listeners para los botones de navegación
  const nextButtons = document.querySelectorAll(".next-step")
  const prevButtons = document.querySelectorAll(".prev-step")

  nextButtons.forEach((button) => {
    button.addEventListener("click", nextStep)
  })

  prevButtons.forEach((button) => {
    button.addEventListener("click", prevStep)
  })

  // Event listener para el formulario
  document.getElementById("setupProfileForm").addEventListener("submit", saveProfile)

  // Event listeners para la foto de perfil
  document.getElementById("uploadPhotoBtn").addEventListener("click", () => {
    document.getElementById("profileImageUpload").click()
  })

  document.getElementById("profileImageUpload").addEventListener("change", handleProfileImagePreview)
  document.getElementById("removePhotoBtn").addEventListener("click", removeProfileImage)

  // Event listener para mostrar campo de otro motivo
  document.getElementById("razon5").addEventListener("change", function () {
    document.getElementById("otro-motivo-container").classList.toggle("d-none", !this.checked)
  })

  // Cargar datos del usuario si existen
  await loadUserData()
})

// Función para cargar datos del usuario desde Supabase
async function loadUserData() {
  try {
    const token = localStorage.getItem("token")

    // Obtener el usuario actual de Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError) {
      throw new Error("Error al obtener el usuario: " + userError.message)
    }

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Obtener el perfil del usuario desde la tabla Usuarios
    const { data: userData, error: profileError } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 es "no se encontraron resultados"
      throw new Error("Error al cargar los datos del usuario: " + profileError.message)
    }

    // Rellenar el formulario con los datos disponibles
    if (user.email) {
      document.getElementById("email").value = user.email
      document.getElementById("email").readOnly = true // No permitir cambiar el email
    }

    // Si hay datos adicionales del perfil, rellenarlos
    if (userData) {
      if (userData.nombre) document.getElementById("nombre").value = userData.nombre
      if (userData.apellidos) document.getElementById("apellidos").value = userData.apellidos

      // Rellenar otros campos si existen
      const camposAdicionales = ["telefono", "direccion", "ciudad", "codigo_postal", "pais", "fecha_nacimiento"]

      camposAdicionales.forEach((campo) => {
        const elemento = document.getElementById(campo)
        if (elemento && userData[campo]) {
          elemento.value = userData[campo]
        }
      })
    }
  } catch (error) {
    console.error("Error:", error)
    mostrarNotificacion("Error al cargar los datos del usuario", "error")
  }
}

// Función para avanzar al siguiente paso
function nextStep(event) {
  const currentStep = event.target.closest(".setup-step")
  const currentStepIndex = Number.parseInt(currentStep.id.replace("step", ""))

  // Validar campos del paso actual
  if (!validateStep(currentStepIndex)) {
    return
  }

  const nextStepIndex = currentStepIndex + 1
  const nextStep = document.getElementById(`step${nextStepIndex}`)

  if (nextStep) {
    currentStep.classList.add("d-none")
    nextStep.classList.remove("d-none")

    // Actualizar barra de progreso
    updateProgressBar(nextStepIndex)
  }
}

// Función para volver al paso anterior
function prevStep(event) {
  const currentStep = event.target.closest(".setup-step")
  const currentStepIndex = Number.parseInt(currentStep.id.replace("step", ""))
  const prevStepIndex = currentStepIndex - 1
  const prevStep = document.getElementById(`step${prevStepIndex}`)

  if (prevStep) {
    currentStep.classList.add("d-none")
    prevStep.classList.remove("d-none")

    // Actualizar barra de progreso
    updateProgressBar(prevStepIndex)
  }
}

// Función para actualizar la barra de progreso
function updateProgressBar(stepIndex) {
  const totalSteps = 4 // Total de pasos en el formulario
  const progressPercentage = ((stepIndex - 1) / (totalSteps - 1)) * 100

  const progressBar = document.getElementById("progressBar")
  progressBar.style.width = `${progressPercentage}%`
  progressBar.setAttribute("aria-valuenow", progressPercentage)
  progressBar.textContent = `${Math.round(progressPercentage)}%`
}

// Función para validar los campos de cada paso
function validateStep(stepIndex) {
  let isValid = true

  switch (stepIndex) {
    case 1:
      // Validar información personal
      const nombre = document.getElementById("nombre").value
      const apellidos = document.getElementById("apellidos").value
      const fechaNacimiento = document.getElementById("fecha_nacimiento").value

      if (!nombre || !apellidos || !fechaNacimiento) {
        mostrarNotificacion("Por favor, completa todos los campos obligatorios.", "error")
        isValid = false
      }
      break

    case 2:
      // Validar información de contacto
      const email = document.getElementById("email").value

      if (!email) {
        mostrarNotificacion("Por favor, ingresa tu correo electrónico.", "error")
        isValid = false
      }
      break

    case 3:
      // No hay validaciones obligatorias en preferencias
      break

    case 4:
      // Validar aceptación de términos
      const terminos = document.getElementById("terminos").checked

      if (!terminos) {
        mostrarNotificacion("Debes aceptar los términos y condiciones para continuar.", "error")
        isValid = false
      }
      break
  }

  return isValid
}

// Función para manejar la vista previa de la imagen de perfil
function handleProfileImagePreview(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validar que sea una imagen
  if (!file.type.match("image.*")) {
    mostrarNotificacion("Por favor, selecciona un archivo de imagen válido.", "error")
    return
  }

  // Validar tamaño (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    mostrarNotificacion("La imagen es demasiado grande. El tamaño máximo permitido es 2MB.", "error")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    document.getElementById("profileImagePreview").src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Función para eliminar la imagen de perfil
function removeProfileImage() {
  document.getElementById("profileImagePreview").src = "../../assets/default-avatar.png"
  document.getElementById("profileImageUpload").value = ""
}

// Función para guardar el perfil en Supabase
async function saveProfile(event) {
  event.preventDefault()

  // Validar aceptación de términos
  if (!document.getElementById("terminos").checked) {
    mostrarNotificacion("Debes aceptar los términos y condiciones para continuar.", "error")
    return
  }

  try {
    // Mostrar indicador de carga
    const submitBtn = document.getElementById("completeSetupBtn")
    const originalBtnText = submitBtn.innerHTML
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
    submitBtn.disabled = true

    const token = localStorage.getItem("token")

    // Obtener el usuario actual de Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError) {
      throw new Error("Error al obtener el usuario: " + userError.message)
    }

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Recopilar datos del formulario
    const userData = {
      id: user.id,
      email: document.getElementById("email").value,
      nombre: document.getElementById("nombre").value,
      apellidos: document.getElementById("apellidos").value,
      fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
      telefono: document.getElementById("telefono").value || null,
      tipo: "invitado", // Por defecto, los nuevos usuarios son invitados
      updated_at: new Date(),
    }

    // Campos opcionales
    const camposOpcionales = ["direccion", "ciudad", "codigo_postal", "pais"]
    camposOpcionales.forEach((campo) => {
      const elemento = document.getElementById(campo)
      if (elemento && elemento.value) {
        userData[campo] = elemento.value
      }
    })

    // Guardar datos en la tabla Usuarios
    const { error: updateError } = await supabase.from("Usuarios").upsert(userData, { onConflict: "id" })

    if (updateError) {
      throw new Error("Error al guardar los datos del usuario: " + updateError.message)
    }

    // Crear entrada en la tabla Invitados
    const invitadoData = {
      idUsuario: user.id,
      nombre: userData.nombre,
      correo_electronico: userData.email,
      activo: true,
    }

    const { error: invitadoError } = await supabase.from("Invitados").upsert(invitadoData, { onConflict: "idUsuario" })

    if (invitadoError) {
      throw new Error("Error al crear el perfil de invitado: " + invitadoError.message)
    }

    // Guardar preferencias
    const categorias = Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(
      (checkbox) => checkbox.value,
    )

    const notificaciones = Array.from(document.querySelectorAll('input[name="notificaciones"]:checked')).map(
      (checkbox) => checkbox.value,
    )

    if (categorias.length > 0 || notificaciones.length > 0) {
      const { error: prefError } = await supabase.from("Preferencias").upsert(
        {
          idUsuario: user.id,
          categorias: categorias,
          notificaciones: notificaciones,
        },
        { onConflict: "idUsuario" },
      )

      if (prefError) {
        console.error("Error al guardar preferencias:", prefError)
        // No interrumpimos el flujo por un error en preferencias
      }
    }

    // Subir imagen de perfil si existe
    const fileInput = document.getElementById("profileImageUpload")
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

      if (uploadError) {
        console.error("Error al subir la imagen de perfil:", uploadError)
        // No interrumpimos el flujo por un error en la subida de imagen
      } else {
        // Actualizar URL de la imagen en el perfil
        const {
          data: { publicUrl },
        } = supabase.storage.from("profiles").getPublicUrl(filePath)

        await supabase.from("Usuarios").update({ avatar_url: publicUrl }).eq("id", user.id)
      }
    }

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false

    // Marcar primer acceso como completado
    localStorage.removeItem("primerAcceso")

    // Mostrar notificación de éxito
    mostrarNotificacion("¡Perfil completado con éxito!", "success")

    // Redirigir al inicio después de un breve retraso
    setTimeout(() => {
      window.location.href = "../../index.html"
    }, 1500)
  } catch (error) {
    console.error("Error:", error)
    mostrarNotificacion("Error al guardar el perfil: " + error.message, "error")

    // Restaurar botón en caso de error
    const submitBtn = document.getElementById("completeSetupBtn")
    submitBtn.innerHTML = "Completar Perfil"
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
