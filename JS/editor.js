import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips and popovers
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Load editor data
  loadEditorData()

  // Initialize charts
  initializeCharts()

  // Setup event listeners
  setupEventListeners()

  // Smooth scrolling for anchor links
  setupSmoothScrolling()
})

// Load editor data from API or localStorage for demo
function loadEditorData() {
  // For demo purposes, we'll use mock data
  // In a real application, you would fetch this from your API
  const editorData = {
    id: 1,
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@motorsportlive.com",
    phone: "+34 612 345 678",
    bio: "Periodista especializado en Fórmula 1 con más de 5 años de experiencia cubriendo grandes premios y entrevistando a pilotos y equipos.",
    specialty: "f1",
    joinDate: "2022-03-15",
    twitter: "carlosf1news",
    instagram: "carlos_f1_reporter",
    accessLevel: "Editor",
    lastLogin: {
      date: "10/04/2024 - 15:30",
      location: "Madrid, España",
      device: "Chrome en Windows 11",
    },
    stats: {
      totalArticles: 42,
      totalViews: "128.5K",
      avgRating: 4.8,
      categories: {
        f1: 25,
        motogp: 8,
        wrc: 3,
        wec: 4,
        formulaE: 2,
      },
      recentArticles: [
        {
          title: "Hamilton domina en Silverstone",
          category: "f1",
          date: "10/04/2024",
          views: "12.3K",
          status: "published",
        },
        {
          title: "Márquez vuelve a lo más alto en Jerez",
          category: "motogp",
          date: "05/04/2024",
          views: "8.7K",
          status: "published",
        },
        {
          title: "Análisis: El nuevo motor de Ferrari",
          category: "f1",
          date: "01/04/2024",
          views: "15.2K",
          status: "published",
        },
        {
          title: "Previa: 24 Horas de Le Mans",
          category: "wec",
          date: "28/03/2024",
          views: "5.8K",
          status: "draft",
        },
        {
          title: "Entrevista exclusiva: Carlos Sainz",
          category: "f1",
          date: "25/03/2024",
          views: "18.9K",
          status: "published",
        },
      ],
    },
    preferences: {
      notifications: {
        email: true,
        comments: true,
        approval: true,
        newsletter: false,
      },
      interface: {
        darkMode: false,
        editorTheme: "default",
        language: "es",
      },
      privacy: {
        showProfile: true,
        showSocialMedia: true,
        analyticsConsent: true,
      },
    },
  }

  // Populate the UI with the editor data
  populateEditorData(editorData)
}

// Populate the UI with editor data
function populateEditorData(data) {
  // Header and sidebar
  document.getElementById("editorName").textContent = `${data.firstName} ${data.lastName}`
  document.getElementById("sidebarEditorName").textContent = `${data.firstName} ${data.lastName}`
  document.getElementById("sidebarEditorRole").textContent = data.accessLevel

  // Profile section
  document.getElementById("firstName").value = data.firstName
  document.getElementById("lastName").value = data.lastName
  document.getElementById("email").value = data.email
  document.getElementById("phone").value = data.phone
  document.getElementById("bio").value = data.bio
  document.getElementById("specialty").value = data.specialty
  document.getElementById("joinDate").value = data.joinDate
  document.getElementById("twitter").value = data.twitter
  document.getElementById("instagram").value = data.instagram

  // Credentials section
  document.getElementById("accessLevelBadge").textContent = data.accessLevel
  document.getElementById("lastLoginDate").textContent = data.lastLogin.date
  document.getElementById("lastLoginLocation").textContent = data.lastLogin.location
  document.getElementById("lastLoginDevice").textContent = data.lastLogin.device

  // Set access level progress bar
  let accessLevelPercentage = 75 // Default for Editor
  if (data.accessLevel === "Admin") {
    accessLevelPercentage = 100
    document.getElementById("accessLevelDescription").textContent =
      "Como Administrador, tienes acceso completo a todas las funciones del sistema."
  } else if (data.accessLevel === "Senior Editor") {
    accessLevelPercentage = 90
    document.getElementById("accessLevelDescription").textContent =
      "Como Editor Senior, puedes publicar sin aprobación y editar contenido de otros editores."
  } else if (data.accessLevel === "Junior Editor") {
    accessLevelPercentage = 50
    document.getElementById("accessLevelDescription").textContent =
      "Como Editor Junior, puedes crear contenido pero necesitas aprobación para todas las publicaciones."
  }
  document.getElementById("accessLevelBar").style.width = `${accessLevelPercentage}%`
  document.getElementById("accessLevelBar").setAttribute("aria-valuenow", accessLevelPercentage)

  // Stats section
  document.getElementById("totalArticles").textContent = data.stats.totalArticles
  document.getElementById("totalViews").textContent = data.stats.totalViews
  document.getElementById("avgRating").textContent = data.stats.avgRating

  // Preferences section
  document.getElementById("emailNotifications").checked = data.preferences.notifications.email
  document.getElementById("commentNotifications").checked = data.preferences.notifications.comments
  document.getElementById("approvalNotifications").checked = data.preferences.notifications.approval
  document.getElementById("newsletterSubscription").checked = data.preferences.notifications.newsletter
  document.getElementById("darkMode").checked = data.preferences.interface.darkMode
  document.getElementById("editorTheme").value = data.preferences.interface.editorTheme
  document.getElementById("language").value = data.preferences.interface.language
  document.getElementById("showProfile").checked = data.preferences.privacy.showProfile
  document.getElementById("showSocialMedia").checked = data.preferences.privacy.showSocialMedia
  document.getElementById("analyticsConsent").checked = data.preferences.privacy.analyticsConsent
}

// Initialize charts
function initializeCharts() {
  // Categories chart
  const categoriesCtx = document.getElementById("categoriesChart").getContext("2d")
  const categoriesChart = new Chart(categoriesCtx, {
    type: "bar",
    data: {
      labels: ["Fórmula 1", "MotoGP", "WRC", "WEC", "Fórmula E"],
      datasets: [
        {
          label: "Artículos por Categoría",
          data: [25, 8, 3, 4, 2],
          backgroundColor: [
            "rgba(225, 6, 0, 0.7)",
            "rgba(13, 44, 84, 0.7)",
            "rgba(255, 102, 0, 0.7)",
            "rgba(138, 43, 226, 0.7)",
            "rgba(20, 176, 191, 0.7)",
          ],
          borderColor: [
            "rgba(225, 6, 0, 1)",
            "rgba(13, 44, 84, 1)",
            "rgba(255, 102, 0, 1)",
            "rgba(138, 43, 226, 1)",
            "rgba(20, 176, 191, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

// Setup event listeners
function setupEventListeners() {
  // Profile edit button
  const editProfileBtn = document.getElementById("editProfileBtn")
  const cancelProfileBtn = document.getElementById("cancelProfileBtn")
  const profileForm = document.getElementById("profileForm")
  const profileActionButtons = document.getElementById("profileActionButtons")

  editProfileBtn.addEventListener("click", () => {
    // Enable form fields
    const formElements = profileForm.querySelectorAll("input, textarea, select")
    formElements.forEach((element) => {
      element.disabled = false
    })

    // Show action buttons
    profileActionButtons.style.display = "block"
    editProfileBtn.style.display = "none"
  })

  cancelProfileBtn.addEventListener("click", () => {
    // Disable form fields
    const formElements = profileForm.querySelectorAll("input, textarea, select")
    formElements.forEach((element) => {
      element.disabled = true
    })

    // Hide action buttons
    profileActionButtons.style.display = "none"
    editProfileBtn.style.display = "block"

    // Reset form to original values
    loadEditorData()
  })

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Simulate saving data
    const successToast = new bootstrap.Toast(document.getElementById("successToast"))
    document.getElementById("successToastMessage").textContent = "Perfil actualizado correctamente."
    successToast.show()

    // Disable form fields
    const formElements = profileForm.querySelectorAll("input, textarea, select")
    formElements.forEach((element) => {
      element.disabled = true
    })

    // Hide action buttons
    profileActionButtons.style.display = "none"
    editProfileBtn.style.display = "block"
  })

  // Preferences edit button
  const editPreferencesBtn = document.getElementById("editPreferencesBtn")
  const cancelPreferencesBtn = document.getElementById("cancelPreferencesBtn")
  const preferencesForm = document.getElementById("preferencesForm")
  const preferencesActionButtons = document.getElementById("preferencesActionButtons")

  editPreferencesBtn.addEventListener("click", () => {
    // Enable form fields
    const formElements = preferencesForm.querySelectorAll("input, select")
    formElements.forEach((element) => {
      element.disabled = false
    })

    // Show action buttons
    preferencesActionButtons.style.display = "block"
    editPreferencesBtn.style.display = "none"
  })

  cancelPreferencesBtn.addEventListener("click", () => {
    // Disable form fields
    const formElements = preferencesForm.querySelectorAll("input, select")
    formElements.forEach((element) => {
      element.disabled = true
    })

    // Hide action buttons
    preferencesActionButtons.style.display = "none"
    editPreferencesBtn.style.display = "block"

    // Reset form to original values
    loadEditorData()
  })

  preferencesForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Simulate saving data
    const successToast = new bootstrap.Toast(document.getElementById("successToast"))
    document.getElementById("successToastMessage").textContent = "Preferencias actualizadas correctamente."
    successToast.show()

    // Disable form fields
    const formElements = preferencesForm.querySelectorAll("input, select")
    formElements.forEach((element) => {
      element.disabled = true
    })

    // Hide action buttons
    preferencesActionButtons.style.display = "none"
    editPreferencesBtn.style.display = "block"
  })

  // Password change
  const passwordForm = document.getElementById("passwordForm")
  const savePasswordBtn = document.getElementById("savePasswordBtn")

  savePasswordBtn.addEventListener("click", () => {
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
      document.getElementById("errorToastMessage").textContent = "Por favor, completa todos los campos."
      errorToast.show()
      return
    }

    if (newPassword !== confirmPassword) {
      const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
      document.getElementById("errorToastMessage").textContent = "Las contraseñas no coinciden."
      errorToast.show()
      return
    }

    // Password strength check (simple example)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
    if (!passwordRegex.test(newPassword)) {
      const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
      document.getElementById("errorToastMessage").textContent =
        "La contraseña no cumple con los requisitos de seguridad."
      errorToast.show()
      return
    }

    // Simulate password change
    const successToast = new bootstrap.Toast(document.getElementById("successToast"))
    document.getElementById("successToastMessage").textContent = "Contraseña actualizada correctamente."
    successToast.show()

    // Close modal and reset form
    const passwordModal = bootstrap.Modal.getInstance(document.getElementById("passwordModal"))
    passwordModal.hide()
    passwordForm.reset()
  })

  // Avatar upload
  const avatarUpload = document.getElementById("avatarUpload")
  const avatarPreview = document.getElementById("avatarPreview")
  const saveAvatarBtn = document.getElementById("saveAvatarBtn")
  const editorAvatar = document.getElementById("editorAvatar")

  avatarUpload.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
        document.getElementById("errorToastMessage").textContent = "La imagen es demasiado grande. Tamaño máximo: 2MB."
        errorToast.show()
        return
      }

      // Check file type
      if (!file.type.match("image.*")) {
        const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
        document.getElementById("errorToastMessage").textContent = "El archivo seleccionado no es una imagen válida."
        errorToast.show()
        return
      }

      // Preview image
      const reader = new FileReader()
      reader.onload = (e) => {
        avatarPreview.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  })

  saveAvatarBtn.addEventListener("click", () => {
    // Check if a file was selected
    if (avatarUpload.files.length === 0) {
      const errorToast = new bootstrap.Toast(document.getElementById("errorToast"))
      document.getElementById("errorToastMessage").textContent = "Por favor, selecciona una imagen."
      errorToast.show()
      return
    }

    // Simulate avatar update
    editorAvatar.src = avatarPreview.src

    // Show success message
    const successToast = new bootstrap.Toast(document.getElementById("successToast"))
    document.getElementById("successToastMessage").textContent = "Foto de perfil actualizada correctamente."
    successToast.show()

    // Close modal and reset form
    const avatarModal = bootstrap.Modal.getInstance(document.getElementById("avatarModal"))
    avatarModal.hide()
  })

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn")
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    // Simulate logout
    alert("Sesión cerrada. Redirigiendo al inicio de sesión...")
    // In a real application, you would redirect to the login page
    // window.location.href = 'login.html';
  })
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      // Update active state in sidebar
      document.querySelectorAll(".list-group-item").forEach((item) => {
        item.classList.remove("active")
      })
      this.classList.add("active")

      // Scroll to section
      const targetId = this.getAttribute("href")
      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Handle scroll events to update active section in sidebar
  window.addEventListener("scroll", () => {
    const sections = ["profileSection", "credentialsSection", "statsSection", "preferencesSection"]
    let currentSection = ""

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId)
      const rect = section.getBoundingClientRect()

      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = sectionId
      }
    })

    if (currentSection) {
      document.querySelectorAll(".list-group-item").forEach((item) => {
        item.classList.remove("active")
        if (item.getAttribute("href") === `#${currentSection}`) {
          item.classList.add("active")
        }
      })
    }
  })
}
