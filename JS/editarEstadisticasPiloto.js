document.addEventListener("DOMContentLoaded", async () => {
    // Obtener el ID del piloto de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const driverId = urlParams.get("id")
  
    if (!driverId) {
      window.location.href = "/HTML/pilotos/todosPilotos.html"
      return
    }
  
    // Elementos del DOM
    const form = document.getElementById("editStatsForm")
    const formAlert = document.getElementById("formAlert")
    const loadingContainer = document.getElementById("loading-container")
    const formContainer = document.getElementById("form-container")
    const backButton = document.getElementById("back-button")
    const driverNameElement = document.getElementById("driver-name")
    const driverTeamElement = document.getElementById("driver-team")
    const driverAvatarElement = document.getElementById("driver-avatar")
    const constructorSelect = document.getElementById("constructorId")
  
    // Función para mostrar alertas
    function showAlert(message, type) {
      formAlert.textContent = message
      formAlert.className = `alert mt-3 alert-${type}`
      formAlert.classList.remove("d-none")
  
      // Hacer scroll hasta la alerta
      formAlert.scrollIntoView({ behavior: "smooth", block: "center" })
  
      // Ocultar la alerta después de 5 segundos
      setTimeout(() => {
        formAlert.classList.add("d-none")
      }, 5000)
    }
  
    // Configurar el botón de volver
    backButton.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = `/HTML/pilotos/detallePiloto.html?id=${driverId}`
    })
  
    try {
      console.log("Iniciando carga de datos para el piloto ID:", driverId)
  
      // Realizar peticiones individuales con mejor manejo de errores
      let driver, stats, constructors, results, driverStandings
  
      try {
        const driverResponse = await fetch(`http://localhost:3000/drivers/${driverId}`)
        if (!driverResponse.ok) {
          throw new Error(`Error al obtener datos del piloto: ${driverResponse.status}`)
        }
        driver = await driverResponse.json()
        console.log("Datos del piloto cargados:", driver)
      } catch (error) {
        console.error("Error al cargar datos del piloto:", error)
        throw new Error(`Error al cargar datos del piloto: ${error.message}`)
      }
  
      try {
        const statsResponse = await fetch(`http://localhost:3000/drivers/${driverId}/stats`)
        if (!statsResponse.ok) {
          throw new Error(`Error al obtener estadísticas: ${statsResponse.status}`)
        }
        stats = await statsResponse.json()
        console.log("Estadísticas cargadas:", stats)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
        // No lanzamos error aquí, usamos estadísticas por defecto
        stats = {
          wins: 0,
          podiums: 0,
          points: 0,
          polePositions: 0,
          fastestLaps: 0,
          totalRaces: 0,
          bestChampionshipPosition: "N/A",
        }
      }
  
      try {
        const constructorsResponse = await fetch(`http://localhost:3000/constructors`)
        if (!constructorsResponse.ok) {
          throw new Error(`Error al obtener constructores: ${constructorsResponse.status}`)
        }
        constructors = await constructorsResponse.json()
        console.log("Constructores cargados:", constructors.length)
      } catch (error) {
        console.error("Error al cargar constructores:", error)
        throw new Error(`Error al cargar constructores: ${error.message}`)
      }
  
      try {
        const resultsResponse = await fetch(`http://localhost:3000/results?driverId=${driverId}`)
        if (!resultsResponse.ok) {
          throw new Error(`Error al obtener resultados: ${resultsResponse.status}`)
        }
        results = await resultsResponse.json()
        console.log("Resultados cargados:", results.length)
      } catch (error) {
        console.error("Error al cargar resultados:", error)
        // No lanzamos error aquí, usamos un array vacío
        results = []
      }
  
      try {
        const driverStandingsResponse = await fetch(`http://localhost:3000/driverStandings?driverId=${driverId}`)
        if (!driverStandingsResponse.ok) {
          throw new Error(`Error al obtener clasificaciones: ${driverStandingsResponse.status}`)
        }
        driverStandings = await driverStandingsResponse.json()
        console.log("Clasificaciones cargadas:", driverStandings.length)
      } catch (error) {
        console.error("Error al cargar clasificaciones:", error)
        // No lanzamos error aquí, usamos un array vacío
        driverStandings = []
      }
  
      // Encontrar el constructor actual del piloto (si existe)
      let currentConstructorId = null
      if (results && results.length > 0) {
        // Ordenar resultados por fecha (más reciente primero)
        results.sort((a, b) => new Date(b.date || "2000-01-01") - new Date(a.date || "2000-01-01"))
        currentConstructorId = results[0].constructorId
        console.log("Constructor actual ID:", currentConstructorId)
      }
  
      // Encontrar la posición actual en el campeonato
      let currentPosition = null
      if (driverStandings && driverStandings.length > 0) {
        // Ordenar por raceId (más reciente primero)
        driverStandings.sort((a, b) => b.raceId - a.raceId)
        currentPosition = driverStandings[0].position
        console.log("Posición actual:", currentPosition)
      }
  
      // Actualizar la información del piloto en la interfaz
      driverNameElement.textContent = `${driver.forename} ${driver.surname}`
      driverAvatarElement.textContent = driver.code || driver.forename.charAt(0)
  
      // Llenar el selector de constructores
      constructors.forEach((constructor) => {
        const option = document.createElement("option")
        option.value = constructor.constructorId
        option.textContent = constructor.name
        constructorSelect.appendChild(option)
      })
  
      // Seleccionar el constructor actual
      if (currentConstructorId) {
        constructorSelect.value = currentConstructorId
        const currentConstructor = constructors.find((c) => c.constructorId == currentConstructorId)
        if (currentConstructor) {
          driverTeamElement.textContent = currentConstructor.name
        } else {
          driverTeamElement.textContent = "Sin equipo"
        }
      } else {
        driverTeamElement.textContent = "Sin equipo"
      }
  
      // Llenar el formulario con los datos de estadísticas
      document.getElementById("driverId").value = driver.driverId
      document.getElementById("wins").value = stats.wins || 0
      document.getElementById("podiums").value = stats.podiums || 0
      document.getElementById("points").value = stats.points || 0
      document.getElementById("polePositions").value = stats.polePositions || 0
      document.getElementById("fastestLaps").value = stats.fastestLaps || 0
      document.getElementById("totalRaces").value = stats.totalRaces || 0
      document.getElementById("position").value = currentPosition || 0
      document.getElementById("bestChampionshipPosition").value =
        stats.bestChampionshipPosition !== "N/A" ? stats.bestChampionshipPosition : 0
  
      // Actualizar el título de la página
      document.title = `Editar Estadísticas de ${driver.forename} ${driver.surname} - MotorsportLIVE`
  
      // Mostrar el formulario y ocultar el spinner
      loadingContainer.style.display = "none"
      formContainer.style.display = "block"
  
      console.log("Formulario cargado correctamente")
    } catch (error) {
      console.error("Error al cargar los datos:", error)
      showAlert(`Error al cargar los datos: ${error.message}`, "danger")
      loadingContainer.innerHTML = `
              <div class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los datos: ${error.message}
                  <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                  <button class="btn btn-outline-danger mt-2" onclick="window.location.href='/HTML/pilotos/todosPilotos.html'">
                      <i class="bi bi-arrow-left"></i> Volver a la lista de pilotos
                  </button>
              </div>
          `
    }
  
    // Manejar el envío del formulario
    form.addEventListener("submit", async (event) => {
      event.preventDefault()
  
      // Mostrar indicador de carga
      const submitButton = form.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
      submitButton.disabled = true
  
      try {
        // Recopilar datos del formulario
        const statsData = {
          driverId: Number.parseInt(document.getElementById("driverId").value),
          wins: Number.parseInt(document.getElementById("wins").value) || 0,
          podiums: Number.parseInt(document.getElementById("podiums").value) || 0,
          points: Number.parseFloat(document.getElementById("points").value) || 0,
          polePositions: Number.parseInt(document.getElementById("polePositions").value) || 0,
          fastestLaps: Number.parseInt(document.getElementById("fastestLaps").value) || 0,
          totalRaces: Number.parseInt(document.getElementById("totalRaces").value) || 0,
          position: Number.parseInt(document.getElementById("position").value) || 0,
          bestChampionshipPosition: Number.parseInt(document.getElementById("bestChampionshipPosition").value) || 0,
          constructorId: Number.parseInt(document.getElementById("constructorId").value) || null,
        }
  
        console.log("Enviando datos:", statsData)
  
        // Enviar datos a la API
        const response = await fetch(`http://localhost:3000/drivers/${driverId}/stats`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(statsData),
        })
  
        console.log("Respuesta del servidor:", response.status)
  
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error del servidor:", errorText)
          throw new Error(`Error al actualizar estadísticas: ${response.status} - ${errorText}`)
        }
  
        // Intentar parsear la respuesta como JSON
        let responseData
        try {
          responseData = await response.json()
          console.log("Datos de respuesta:", responseData)
        } catch (e) {
          console.log("La respuesta no es JSON válido:", e)
          // No es un error crítico, continuamos
        }
  
        // Mostrar mensaje de éxito
        showAlert("¡Estadísticas actualizadas con éxito!", "success")
  
        // Redirigir a la página de detalle después de 2 segundos
        setTimeout(() => {
          window.location.href = `/HTML/pilotos/detallePiloto.html?id=${driverId}`
        }, 2000)
      } catch (error) {
        console.error("Error:", error)
        showAlert(`Error al actualizar las estadísticas: ${error.message}`, "danger")
      } finally {
        // Restaurar el botón
        submitButton.innerHTML = originalButtonText
        submitButton.disabled = false
      }
    })
  })
  
  