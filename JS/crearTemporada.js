document.addEventListener("DOMContentLoaded", async () => {
    // Elementos del DOM
    const formAlert = document.getElementById("formAlert")
    const loadingContainer = document.getElementById("loading-container")
    const formContainer = document.getElementById("form-container")
  
    // Elementos de pasos
    const step1 = document.getElementById("step1")
    const step2 = document.getElementById("step2")
    const step3 = document.getElementById("step3")
    const step4 = document.getElementById("step4")
  
    const step1Content = document.getElementById("step1-content")
    const step2Content = document.getElementById("step2-content")
    const step3Content = document.getElementById("step3-content")
    const step4Content = document.getElementById("step4-content")
  
    const step1Next = document.getElementById("step1-next")
    const step2Prev = document.getElementById("step2-prev")
    const step2Next = document.getElementById("step2-next")
    const step3Prev = document.getElementById("step3-prev")
    const step3Next = document.getElementById("step3-next")
    const step4Prev = document.getElementById("step4-prev")
    const saveSeason = document.getElementById("save-season")
  
    // Elementos de selección de circuitos
    const availableCircuits = document.getElementById("available-circuits")
    const selectedCircuits = document.getElementById("selected-circuits")
    const selectedCount = document.getElementById("selected-count")
    const noSelectedMessage = document.getElementById("no-selected-message")
    const circuitSearch = document.getElementById("circuit-search")
  
    // Elementos de revisión
    const reviewYear = document.getElementById("review-year")
    const reviewCategory = document.getElementById("review-category")
    const reviewUrl = document.getElementById("review-url")
    const reviewDescription = document.getElementById("review-description")
    const reviewRaces = document.getElementById("review-races")
  
    // Variables para almacenar datos
    let allCircuits = []
    let selectedCircuitsData = []
    let racesData = []
  
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
  
    // Función para cambiar entre pasos
    function goToStep(step) {
      // Ocultar todos los contenidos
      step1Content.classList.add("d-none")
      step2Content.classList.add("d-none")
      step3Content.classList.add("d-none")
      step4Content.classList.add("d-none")
  
      // Resetear clases de los pasos
      step1.className = "step"
      step2.className = "step"
      step3.className = "step"
      step4.className = "step"
  
      // Mostrar el contenido del paso actual y marcar como activo
      if (step === 1) {
        step1Content.classList.remove("d-none")
        step1.className = "step active"
      } else if (step === 2) {
        step2Content.classList.remove("d-none")
        step1.className = "step completed"
        step2.className = "step active"
      } else if (step === 3) {
        step3Content.classList.remove("d-none")
        step1.className = "step completed"
        step2.className = "step completed"
        step3.className = "step active"
      } else if (step === 4) {
        step4Content.classList.remove("d-none")
        step1.className = "step completed"
        step2.className = "step completed"
        step3.className = "step completed"
        step4.className = "step active"
      }
    }
  
    // Cargar circuitos desde la API
    async function loadCircuits() {
      try {
        loadingContainer.classList.remove("d-none")
        availableCircuits.innerHTML =
          '<div class="p-3 text-center text-muted"><i class="bi bi-arrow-clockwise"></i> Cargando circuitos...</div>'
  
        const response = await fetch("http://localhost:3000/circuitos")
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
  
        allCircuits = await response.json()
        renderAvailableCircuits(allCircuits)
  
        loadingContainer.classList.add("d-none")
      } catch (error) {
        console.error("Error al cargar circuitos:", error)
        availableCircuits.innerHTML = `
                  <div class="p-3 text-center text-danger">
                      <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar circuitos: ${error.message}
                  </div>
              `
        loadingContainer.classList.add("d-none")
      }
    }
  
    // Renderizar circuitos disponibles
    function renderAvailableCircuits(circuits) {
      if (circuits.length === 0) {
        availableCircuits.innerHTML = `
                  <div class="p-3 text-center text-muted">
                      <i class="bi bi-info-circle"></i> No hay circuitos disponibles
                  </div>
              `
        return
      }
  
      availableCircuits.innerHTML = ""
  
      circuits.forEach((circuit) => {
        // Verificar si el circuito ya está seleccionado
        const isSelected = selectedCircuitsData.some((c) => c.circuitId === circuit.circuitId)
        if (isSelected) return
  
        const circuitItem = document.createElement("div")
        circuitItem.className = "list-group-item circuit-item"
        circuitItem.dataset.id = circuit.circuitId
  
        circuitItem.innerHTML = `
                  <div class="d-flex justify-content-between align-items-center">
                      <div>
                          <h6 class="mb-0">${circuit.name}</h6>
                          <small class="text-muted">${circuit.location}, ${circuit.country}</small>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-primary select-circuit-btn">
                          <i class="bi bi-plus-circle"></i> Añadir
                      </button>
                  </div>
              `
  
        // Añadir evento para seleccionar circuito
        const selectBtn = circuitItem.querySelector(".select-circuit-btn")
        selectBtn.addEventListener("click", () => {
          addCircuitToSelection(circuit)
        })
  
        availableCircuits.appendChild(circuitItem)
      })
    }
  
    // Añadir circuito a la selección
    function addCircuitToSelection(circuit) {
      // Verificar si ya está seleccionado
      if (selectedCircuitsData.some((c) => c.circuitId === circuit.circuitId)) {
        return
      }
  
      // Añadir a la lista de seleccionados
      selectedCircuitsData.push(circuit)
  
      // Actualizar contador
      selectedCount.textContent = selectedCircuitsData.length
  
      // Ocultar mensaje de "no hay seleccionados"
      if (selectedCircuitsData.length > 0) {
        noSelectedMessage.classList.add("d-none")
      }
  
      // Crear elemento en la lista de seleccionados
      const circuitItem = document.createElement("div")
      circuitItem.className = "list-group-item circuit-item selected"
      circuitItem.dataset.id = circuit.circuitId
  
      circuitItem.innerHTML = `
              <div class="d-flex justify-content-between align-items-center">
                  <div>
                      <h6 class="mb-0">${circuit.name}</h6>
                      <small class="text-muted">${circuit.location}, ${circuit.country}</small>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-danger remove-circuit-btn">
                      <i class="bi bi-dash-circle"></i> Quitar
                  </button>
              </div>
          `
  
      // Añadir evento para quitar circuito
      const removeBtn = circuitItem.querySelector(".remove-circuit-btn")
      removeBtn.addEventListener("click", () => {
        removeCircuitFromSelection(circuit.circuitId)
      })
  
      selectedCircuits.appendChild(circuitItem)
  
      // Actualizar lista de disponibles
      renderAvailableCircuits(allCircuits)
    }
  
    // Quitar circuito de la selección
    function removeCircuitFromSelection(circuitId) {
      // Quitar de la lista de seleccionados
      selectedCircuitsData = selectedCircuitsData.filter((c) => c.circuitId !== circuitId)
  
      // Actualizar contador
      selectedCount.textContent = selectedCircuitsData.length
  
      // Mostrar mensaje de "no hay seleccionados" si es necesario
      if (selectedCircuitsData.length === 0) {
        noSelectedMessage.classList.remove("d-none")
      }
  
      // Quitar elemento de la lista
      const circuitItem = selectedCircuits.querySelector(`[data-id="${circuitId}"]`)
      if (circuitItem) {
        selectedCircuits.removeChild(circuitItem)
      }
  
      // Actualizar lista de disponibles
      renderAvailableCircuits(allCircuits)
    }
  
    // Generar formularios para configurar carreras
    function generateRacesForms() {
      const racesContainer = document.getElementById("races-container")
  
      if (selectedCircuitsData.length === 0) {
        racesContainer.innerHTML = `
                  <div class="text-center text-muted py-4">
                      <i class="bi bi-exclamation-circle"></i> Primero debes seleccionar circuitos en el paso anterior
                  </div>
              `
        return
      }
  
      racesContainer.innerHTML = ""
      racesData = []
  
      selectedCircuitsData.forEach((circuit, index) => {
        const raceData = {
          circuitId: circuit.circuitId,
          round: index + 1,
          name: `${circuit.country} Grand Prix`,
          date: new Date().toISOString().split("T")[0],
          time: "14:00:00",
        }
  
        racesData.push(raceData)
  
        const raceForm = document.createElement("div")
        raceForm.className = "race-item mb-4"
        raceForm.innerHTML = `
                  <h5 class="mb-3">Ronda ${index + 1}: ${circuit.name}</h5>
                  <div class="row">
                      <div class="col-md-6 mb-3">
                          <label for="race-name-${index}" class="form-label required-field">Nombre de la carrera</label>
                          <input type="text" class="form-control race-name" id="race-name-${index}" value="${raceData.name}" required>
                      </div>
                      <div class="col-md-6 mb-3">
                          <label for="race-round-${index}" class="form-label required-field">Número de ronda</label>
                          <input type="number" class="form-control race-round" id="race-round-${index}" value="${raceData.round}" min="1" required>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-md-6 mb-3">
                          <label for="race-date-${index}" class="form-label required-field">Fecha</label>
                          <input type="date" class="form-control race-date" id="race-date-${index}" value="${raceData.date}" required>
                      </div>
                      <div class="col-md-6 mb-3">
                          <label for="race-time-${index}" class="form-label required-field">Hora</label>
                          <input type="time" class="form-control race-time" id="race-time-${index}" value="${raceData.time.substring(0, 5)}" required>
                      </div>
                  </div>
                  <hr>
              `
  
        // Añadir eventos para actualizar datos
        racesContainer.appendChild(raceForm)
  
        // Añadir listeners para actualizar los datos
        const nameInput = raceForm.querySelector(`#race-name-${index}`)
        const roundInput = raceForm.querySelector(`#race-round-${index}`)
        const dateInput = raceForm.querySelector(`#race-date-${index}`)
        const timeInput = raceForm.querySelector(`#race-time-${index}`)
  
        nameInput.addEventListener("change", () => {
          racesData[index].name = nameInput.value
        })
  
        roundInput.addEventListener("change", () => {
          racesData[index].round = Number.parseInt(roundInput.value)
        })
  
        dateInput.addEventListener("change", () => {
          racesData[index].date = dateInput.value
        })
  
        timeInput.addEventListener("change", () => {
          racesData[index].time = timeInput.value + ":00"
        })
      })
    }
  
    // Preparar la revisión final
    function prepareReview() {
      // Información básica
      const year = document.getElementById("year").value
      const url = document.getElementById("url").value
      const category = document.getElementById("category").value
      const description = document.getElementById("description").value
  
      // Mostrar información en la revisión
      reviewYear.textContent = year
      reviewCategory.textContent =
        document.getElementById("category").options[document.getElementById("category").selectedIndex].text
      reviewUrl.textContent = url || "No especificada"
      reviewDescription.textContent = description || "No especificada"
  
      // Ordenar carreras por ronda
      racesData.sort((a, b) => a.round - b.round)
  
      // Mostrar carreras en la tabla
      reviewRaces.innerHTML = ""
  
      racesData.forEach((race) => {
        const circuit = selectedCircuitsData.find((c) => c.circuitId === race.circuitId)
  
        const row = document.createElement("tr")
        row.innerHTML = `
                  <td>${race.round}</td>
                  <td>${race.name}</td>
                  <td>${circuit.name}, ${circuit.country}</td>
                  <td>${formatDate(race.date)}</td>
              `
  
        reviewRaces.appendChild(row)
      })
    }
  
    // Formatear fecha para mostrar
    function formatDate(dateString) {
      const options = { day: "numeric", month: "long", year: "numeric" }
      return new Date(dateString).toLocaleDateString("es-ES", options)
    }
  
    // Guardar temporada
    async function saveSeasonData() {
      try {
        // Mostrar indicador de carga
        loadingContainer.classList.remove("d-none")
        saveSeason.disabled = true
        saveSeason.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
  
        // Recopilar datos de la temporada
        const seasonData = {
          year: Number.parseInt(document.getElementById("year").value),
          url: document.getElementById("url").value,
          category: document.getElementById("category").value,
          description: document.getElementById("description").value,
        }
  
        // Crear la temporada
        const seasonResponse = await fetch("http://localhost:3000/seasons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(seasonData),
        })
  
        if (!seasonResponse.ok) {
          throw new Error(`Error al crear temporada: ${seasonResponse.status}`)
        }
  
        const season = await seasonResponse.json()
  
        // Crear las carreras
        const racesPromises = racesData.map((race) => {
          const raceData = {
            year: seasonData.year,
            round: race.round,
            circuitId: race.circuitId,
            name: race.name,
            date: race.date,
            time: race.time,
          }
  
          return fetch("http://localhost:3000/races", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(raceData),
          })
        })
  
        const racesResponses = await Promise.all(racesPromises)
  
        // Verificar si todas las carreras se crearon correctamente
        const hasErrors = racesResponses.some((response) => !response.ok)
  
        if (hasErrors) {
          throw new Error("Algunas carreras no pudieron ser creadas")
        }
  
        // Mostrar mensaje de éxito
        showAlert("¡Temporada creada con éxito!", "success")
  
        // Redirigir a la página principal después de 2 segundos
        setTimeout(() => {
          window.location.href = "/index.html"
        }, 2000)
      } catch (error) {
        console.error("Error:", error)
        showAlert(`Error al guardar la temporada: ${error.message}`, "danger")
  
        // Restaurar botón
        saveSeason.disabled = false
        saveSeason.innerHTML = '<i class="bi bi-save"></i> Guardar Temporada'
      } finally {
        loadingContainer.classList.add("d-none")
      }
    }
  
    // Validar paso 1
    function validateStep1() {
      const year = document.getElementById("year")
      const category = document.getElementById("category")
  
      if (!year.value) {
        showAlert("Por favor, introduce el año de la temporada", "danger")
        year.focus()
        return false
      }
  
      if (!category.value) {
        showAlert("Por favor, selecciona una categoría", "danger")
        category.focus()
        return false
      }
  
      return true
    }
  
    // Validar paso 2
    function validateStep2() {
      if (selectedCircuitsData.length === 0) {
        showAlert("Por favor, selecciona al menos un circuito", "danger")
        return false
      }
  
      return true
    }
  
    // Validar paso 3
    function validateStep3() {
      // Verificar que todas las carreras tengan nombre, ronda, fecha y hora
      const invalidRaces = racesData.filter((race) => !race.name || !race.round || !race.date || !race.time)
  
      if (invalidRaces.length > 0) {
        showAlert("Por favor, completa todos los campos de las carreras", "danger")
        return false
      }
  
      // Verificar que no haya rondas duplicadas
      const rounds = racesData.map((race) => race.round)
      const uniqueRounds = [...new Set(rounds)]
  
      if (rounds.length !== uniqueRounds.length) {
        showAlert("No puede haber dos carreras con el mismo número de ronda", "danger")
        return false
      }
  
      return true
    }
  
    // Eventos de navegación entre pasos
    step1Next.addEventListener("click", () => {
      if (validateStep1()) {
        goToStep(2)
        if (allCircuits.length === 0) {
          loadCircuits()
        }
      }
    })
  
    step2Prev.addEventListener("click", () => {
      goToStep(1)
    })
  
    step2Next.addEventListener("click", () => {
      if (validateStep2()) {
        goToStep(3)
        generateRacesForms()
      }
    })
  
    step3Prev.addEventListener("click", () => {
      goToStep(2)
    })
  
    step3Next.addEventListener("click", () => {
      if (validateStep3()) {
        goToStep(4)
        prepareReview()
      }
    })
  
    step4Prev.addEventListener("click", () => {
      goToStep(3)
    })
  
    saveSeason.addEventListener("click", saveSeasonData)
  
    // Evento para buscar circuitos
    circuitSearch.addEventListener("input", () => {
      const searchTerm = circuitSearch.value.toLowerCase()
  
      if (searchTerm === "") {
        renderAvailableCircuits(allCircuits)
        return
      }
  
      const filteredCircuits = allCircuits.filter(
        (circuit) =>
          circuit.name.toLowerCase().includes(searchTerm) ||
          circuit.location.toLowerCase().includes(searchTerm) ||
          circuit.country.toLowerCase().includes(searchTerm),
      )
  
      renderAvailableCircuits(filteredCircuits)
    })
  
    // Inicializar
    goToStep(1)
  })
  
  