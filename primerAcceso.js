const supabase = window.supabase;

document.addEventListener("DOMContentLoaded", () => {
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
  loadUserData()
})

// Función para cargar datos del usuario
async function loadUserData() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new Error("Error al obtener usuario autenticado")
    }

    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    // Obtener datos del usuario desde la tabla Usuarios
    const { data: userData, error: userError } = await supabase.from("Usuarios").select("*").eq("id", user.id).single()

    if (userError) {
      console.warn("No se encontraron datos adicionales del usuario:", userError)
    }

    // Rellenar el formulario con los datos disponibles
    if (userData) {
      if (userData.email) {
        document.getElementById("email").value = userData.email
        document.getElementById("email").readOnly = true // No permitir cambiar el email
      }

      if (userData.nombre) {
        document.getElementById("nombre").value = userData.nombre
      }

      if (userData.apellidos) {
        document.getElementById("apellidos").value = userData.apellidos
      }
    } else if (user.email) {
      document.getElementById("email").value = user.email
      document.getElementById("email").readOnly = true
    }
  } catch (error) {
    console.error("Error:", error)
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
        alert("Por favor, completa todos los campos obligatorios.")
        isValid = false
      }
      break

    case 2:
      // Validar información de contacto
      const email = document.getElementById("email").value

      if (!email) {
        alert("Por favor, ingresa tu correo electrónico.")
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
        alert("Debes aceptar los términos y condiciones para continuar.")
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
    document.getElementById("profileImagePreview").src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Función para eliminar la imagen de perfil
function removeProfileImage() {
  document.getElementById("profileImagePreview").src = "../../assets/default-avatar.png"
  document.getElementById("profileImageUpload").value = ""
}

// Función para guardar el perfil
async function saveProfile(event) {
  event.preventDefault()

  // Validar aceptación de términos
  if (!document.getElementById("terminos").checked) {
    alert("Debes aceptar los términos y condiciones para continuar.")
    return
  }

  // Mostrar indicador de carga
  const submitBtn = document.getElementById("completeSetupBtn")
  const originalBtnText = submitBtn.innerHTML
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
  submitBtn.disabled = true

  try {
    // Obtener usuario actual
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      throw new Error("Error al obtener usuario autenticado")
    }

    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    // Recopilar datos del formulario
    const nombre = document.getElementById("nombre").value
    const apellidos = document.getElementById("apellidos").value
    const fechaNacimiento = document.getElementById("fecha_nacimiento").value
    const email = document.getElementById("email").value
    const telefono = document.getElementById("telefono").value

    // Recopilar preferencias
    const categorias = []
    document.querySelectorAll('input[name="categorias"]:checked').forEach((cat) => {
      categorias.push(cat.value)
    })

    const notificaciones = []
    document.querySelectorAll('input[name="notificaciones"]:checked').forEach((notif) => {
      notificaciones.push(notif.value)
    })

    // Actualizar datos en la tabla Usuarios
    const { error: updateError } = await supabase
      .from("Usuarios")
      .update({
        nombre,
        apellidos,
        fecha_nacimiento: fechaNacimiento,
        telefono,
        categorias_interes: categorias,
        preferencias_notificacion: notificaciones,
        perfil_completado: true,
      })
      .eq("id", user.id)

    if (updateError) {
      throw new Error(`Error al actualizar perfil: ${updateError.message}`)
    }

    // Subir imagen de perfil si existe
    const fileInput = document.getElementById("profileImageUpload")
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("perfiles").upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError)
        // No interrumpimos el flujo por este error
      } else {
        // Obtener URL pública de la imagen
        const { data: urlData } = supabase.storage.from("perfiles").getPublicUrl(filePath)

        // Actualizar URL de avatar en la tabla Usuarios
        if (urlData) {
          await supabase
            .from("Usuarios")
            .update({
              avatar_url: urlData.publicUrl,
            })
            .eq("id", user.id)
        }
      }
    }

    // Marcar primer acceso como completado
    localStorage.removeItem("primerAcceso")

    // Actualizar datos en localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    localStorage.setItem(
      "userData",
      JSON.stringify({
        ...userData,
        nombre,
        apellidos,
        perfil_completado: true,
      }),
    )

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false

    // Mostrar mensaje de éxito
    alert("¡Perfil completado con éxito!")

    // Redirigir al inicio
    window.location.href = "../../index.html"
  } catch (error) {
    console.error("Error:", error)
    alert("Error al guardar el perfil: " + error.message)

    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false
  }
}
