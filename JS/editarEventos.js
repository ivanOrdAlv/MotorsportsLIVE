document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM
  const loadingContainer = document.getElementById("loading-container")
  const formContainer = document.getElementById("form-container")
  const formAlert = document.getElementById("formAlert")
  const eventDetails = document.getElementById("event-details")
  const raceForm = document.getElementById("race-form")
  const resultsBody = document.getElementById("results-body")
  const qualifyingBody = document.getElementById("qualifying-body")
  const addResultBtn = document.getElementById("add-result-btn")
  const saveResultsBtn = document.getElementById("save-results-btn")
  const saveQualifyingBtn = document.getElementById("save-qualifying-btn")
  const viewResultsLink = document.getElementById("view-results-link")

  // Elementos del modal de edición de resultados
  const editResultForm = document.getElementById("edit-result-form")
  const editResultId = document.getElementById("edit-result-id")
  const editDriver = document.getElementById("edit-driver")
  const editConstructor = document.getElementById("edit-constructor")
  const editPosition = document.getElementById("edit-position")
  const editGrid = document.getElementById("edit-grid")
  const editPoints = document.getElementById("edit-points")
  const editLaps = document.getElementById("edit-laps")
  const editTime = document.getElementById("edit-time")
  const editStatus = document.getElementById("edit-status")
  const editFastestLap = document.getElementById("edit-fastest-lap")
  const editFastestLapSpeed = document.getElementById("edit-fastest-lap-speed")
  const editFastestLapRank = document.getElementById("edit-fastest-lap-rank")
  const saveResultBtn = document.getElementById("save-result-btn")

  // Variables para almacenar datos
  let raceId = null
  let circuitId = null
  let race = null
  let circuit = null
  let results = []
  let qualifying = []
  let drivers = []
  let allDrivers = [] // Nueva variable para almacenar todos los pilotos cuando sea necesario
  let constructors = []
  let status = []
  let editingResultIndex = -1

  // Obtener el ID de la carrera de la URL
  const urlParams = new URLSearchParams(window.location.search)
  raceId = urlParams.get("id")

  if (!raceId) {
    showAlert("No se especificó un ID de carrera válido", "danger")
    loadingContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> No se especificó un ID de carrera válido.
        <p class="mt-2">
          <a href="/HTML/eventos/todosEventos.html" class="btn btn-outline-dark">
            <i class="bi bi-arrow-left"></i> Volver a Eventos
          </a>
        </p>
      </div>
    `
    return
  }

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

  // Función para formatear la fecha
  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Función para obtener los resultados de una carrera específica
  function getRaceResults(raceId, allResults) {
    return allResults.filter((result) => result.raceId === Number.parseInt(raceId))
  }

  // Función para obtener los datos de clasificación de una carrera específica
  function getRaceQualifying(raceId, allQualifying) {
    return allQualifying.filter((quali) => quali.raceId === Number.parseInt(raceId))
  }

  // Función para obtener el nombre del piloto
  function getDriverName(driverId) {
    const driver = drivers.find((d) => d.driverId === driverId)
    return driver ? `${driver.forename} ${driver.surname}` : "Desconocido"
  }

  // Función para obtener el nombre del constructor
  function getConstructorName(constructorId) {
    const constructor = constructors.find((c) => c.constructorId === constructorId)
    return constructor ? constructor.name : "Desconocido"
  }

  // Función para cargar los datos de la carrera y sus resultados
  async function loadRaceData() {
    try {
      // Mostrar spinner de carga
      loadingContainer.classList.remove("d-none")

      // Realizar peticiones en paralelo para obtener todos los datos necesarios
      const [
        raceResponse,
        circuitResponse,
        allResultsResponse,
        constructorsResponse,
        statusResponse,
        allQualifyingResponse,
        allDriversResponse,
      ] = await Promise.all([
        fetch(`http://localhost:3000/races/${raceId}`),
        fetch(`http://localhost:3000/circuitos/${circuitId || 1}`),
        fetch(`http://localhost:3000/results`),
        fetch("http://localhost:3000/constructors"),
        fetch("http://localhost:3000/status"),
        fetch(`http://localhost:3000/qualifying`),
        fetch("http://localhost:3000/drivers"),
      ])

      // Verificar si alguna petición falló
      if (!raceResponse.ok) {
        throw new Error(`Error al obtener datos de la carrera: ${raceResponse.status}`)
      }

      // Obtener los datos
      race = await raceResponse.json()
      circuitId = race.circuitId

      // Obtener datos del circuito
      if (circuitResponse.ok) {
        circuit = await circuitResponse.json()
      }

      // Obtener todos los resultados
      const allResults = await allResultsResponse.json()

      // Filtrar solo los resultados de esta carrera específica
      results = getRaceResults(raceId, allResults)
      console.log(`Filtrados ${results.length} resultados para la carrera ID: ${raceId}`)

      // Obtener constructores
      if (constructorsResponse.ok) {
        constructors = await constructorsResponse.json()
      } else {
        constructors = []
      }

      // Obtener estados
      if (statusResponse.ok) {
        status = await statusResponse.json()
      } else {
        status = []
      }

      // Obtener todos los datos de clasificación
      const allQualifying = await allQualifyingResponse.json()

      // Filtrar solo las clasificaciones de esta carrera específica
      qualifying = getRaceQualifying(raceId, allQualifying)
      console.log(`Filtradas ${qualifying.length} clasificaciones para la carrera ID: ${raceId}`)

      // Guardar todos los pilotos para usarlos cuando sea necesario
      if (allDriversResponse.ok) {
        allDrivers = await allDriversResponse.json()
      } else {
        allDrivers = []
      }

      // Si hay resultados, cargar solo los pilotos que participaron en esta carrera
      if (results.length > 0) {
        const driverIds = [...new Set(results.map((result) => result.driverId))]

        // Filtrar los pilotos que participaron de la lista completa
        drivers = allDrivers.filter((driver) => driverIds.includes(driver.driverId))
        console.log(`Cargados ${drivers.length} pilotos que participaron en esta carrera`)
      } else {
        // Si no hay resultados, no cargar ningún piloto inicialmente
        drivers = []
        console.log("No hay resultados para esta carrera, no se cargan pilotos inicialmente")
      }

      // Actualizar la interfaz con los datos obtenidos
      updateUI()

      // Ocultar spinner de carga y mostrar formulario
      loadingContainer.classList.add("d-none")
      formContainer.classList.remove("d-none")
    } catch (error) {
      console.error("Error al cargar los datos:", error)
      loadingContainer.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los datos: ${error.message}
      <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
      <p class="mt-2">
        <a href="/HTML/eventos/todosEventos.html" class="btn btn-outline-dark">
          <i class="bi bi-arrow-left"></i> Volver a Eventos
        </a>
      </p>
    </div>
  `
    }
  }

  // Función para actualizar la interfaz con los datos obtenidos
  function updateUI() {
    // Actualizar detalles del evento
    if (race && circuit) {
      document.title = `Editar ${race.name} - MotorsportLIVE`

      eventDetails.innerHTML = `
        <div class="circuit-info">
          <div class="circuit-name">${circuit.name}</div>
          <div class="circuit-location">${circuit.location}, ${circuit.country}</div>
        </div>
        <div class="race-info">
          <h3>${race.name}</h3>
          <div class="race-date">
            <i class="bi bi-calendar3"></i> ${formatDate(race.date)}
            <span class="ms-2"><i class="bi bi-clock"></i> ${race.time.substring(0, 5)}</span>
          </div>
        </div>
      `

      // Actualizar formulario de carrera
      document.getElementById("race-name").value = race.name
      document.getElementById("race-round").value = race.round
      document.getElementById("race-date").value = race.date
      document.getElementById("race-time").value = race.time.substring(0, 5)
      document.getElementById("race-year").value = race.year
      document.getElementById("race-url").value = race.url

      // Actualizar enlace para ver resultados
      viewResultsLink.href = `/HTML/resultados/resultados.html?id=${circuitId}&race=${raceId}`
    }

    // Actualizar tabla de resultados
    updateResultsTable()

    // Actualizar tabla de clasificación
    updateQualifyingTable()
  }

  // Función para actualizar la tabla de resultados
  function updateResultsTable() {
    resultsBody.innerHTML = ""

    if (results.length === 0) {
      resultsBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-3">
            <i class="bi bi-info-circle text-muted"></i> No hay resultados disponibles para esta carrera.
          </td>
        </tr>
      `
      return
    }

    // Ordenar resultados por posición
    results.sort((a, b) => {
      const posA = Number.parseInt(a.position) || 999
      const posB = Number.parseInt(b.position) || 999
      return posA - posB
    })

    // Generar filas de la tabla
    results.forEach((result, index) => {
      const driver = drivers.find((d) => d.driverId === result.driverId) || {
        forename: "Desconocido",
        surname: "",
        code: "???",
      }
      const constructor = constructors.find((c) => c.constructorId === result.constructorId) || { name: "Desconocido" }

      const row = document.createElement("tr")
      row.className = "result-row"
      row.innerHTML = `
        <td>
          <div class="position-badge ${Number.parseInt(result.position) <= 3 ? "position-" + result.position : ""}">${result.position}</div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="driver-avatar me-2">${driver.code || driver.forename.charAt(0)}</div>
            <div>${driver.forename} ${driver.surname}</div>
          </div>
        </td>
        <td>${constructor.name}</td>
        <td>${result.points}</td>
        <td>${result.grid}</td>
        <td>${result.laps}</td>
        <td>${result.time || "N/A"}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary edit-result-btn" data-index="${index}">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-result-btn" data-index="${index}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `

      resultsBody.appendChild(row)
    })

    // Añadir eventos a los botones de editar y eliminar
    document.querySelectorAll(".edit-result-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number.parseInt(btn.dataset.index)
        openEditResultModal(index)
      })
    })

    document.querySelectorAll(".delete-result-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number.parseInt(btn.dataset.index)
        if (confirm("¿Estás seguro de que deseas eliminar este resultado?")) {
          deleteResult(index)
        }
      })
    })
  }

  // Función para actualizar la tabla de clasificación
  function updateQualifyingTable() {
    qualifyingBody.innerHTML = ""

    if (qualifying.length === 0) {
      qualifyingBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3">
          <i class="bi bi-info-circle text-muted"></i> No hay datos de clasificación disponibles para esta carrera.
        </td>
      </tr>
    `
      return
    }

    // Ordenar clasificación por posición
    qualifying.sort((a, b) => {
      const posA = Number.parseInt(a.position) || 999
      const posB = Number.parseInt(b.position) || 999
      return posA - posB
    })

    // Generar filas de la tabla
    qualifying.forEach((quali, index) => {
      // Buscar el piloto primero en drivers, luego en allDrivers si no se encuentra
      const driver = allDrivers.find((d) => d.driverId === quali.driverId) || {
        forename: "Desconocido",
        surname: "",
        code: "???",
      }

      const constructor = constructors.find((c) => c.constructorId === quali.constructorId) || { name: "Desconocido" }

      const row = document.createElement("tr")
      row.className = "result-row"
      row.innerHTML = `
      <td>
        <div class="position-badge ${Number.parseInt(quali.position) <= 3 ? "position-" + quali.position : ""}">${quali.position}</div>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <div class="driver-avatar me-2">${driver.code || driver.forename.charAt(0)}</div>
          <div>${driver.forename} ${driver.surname}</div>
        </div>
      </td>
      <td>${constructor.name}</td>
      <td>${quali.q1 || "N/A"}</td>
      <td>${quali.q2 || "N/A"}</td>
      <td>${quali.q3 || "N/A"}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-primary edit-qualifying-btn" data-index="${index}">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger delete-qualifying-btn" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `

      qualifyingBody.appendChild(row)
    })

    // Añadir eventos a los botones de editar y eliminar
    document.querySelectorAll(".edit-qualifying-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number.parseInt(btn.dataset.index)
        openEditQualifyingModal(index)
      })
    })

    document.querySelectorAll(".delete-qualifying-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number.parseInt(btn.dataset.index)
        if (confirm("¿Estás seguro de que deseas eliminar esta clasificación?")) {
          deleteQualifying(index)
        }
      })
    })
  }

  // Función para abrir el modal de edición de resultados
  function openEditResultModal(index) {
    editingResultIndex = index
    const result = results[index]

    // Llenar el formulario con los datos del resultado
    editResultId.value = result.resultId

    // Llenar el selector de pilotos con todos los pilotos disponibles
    editDriver.innerHTML = ""
    allDrivers.forEach((driver) => {
      const option = document.createElement("option")
      option.value = driver.driverId
      option.textContent = `${driver.forename} ${driver.surname}`
      editDriver.appendChild(option)
    })
    editDriver.value = result.driverId

    // Llenar el selector de constructores
    editConstructor.innerHTML = ""
    constructors.forEach((constructor) => {
      const option = document.createElement("option")
      option.value = constructor.constructorId
      option.textContent = constructor.name
      editConstructor.appendChild(option)
    })
    editConstructor.value = result.constructorId

    // Llenar el selector de estados
    editStatus.innerHTML = ""
    status.forEach((s) => {
      const option = document.createElement("option")
      option.value = s.statusId
      option.textContent = s.status
      editStatus.appendChild(option)
    })
    editStatus.value = result.statusId

    // Llenar el resto de campos
    editPosition.value = result.position
    editGrid.value = result.grid
    editPoints.value = result.points
    editLaps.value = result.laps
    editTime.value = result.time || ""
    editFastestLap.value = result.fastestLapTime || ""
    editFastestLapSpeed.value = result.fastestLapSpeed || ""
    editFastestLapRank.checked = result.rank === 1 || result.rank === "1"

    // Abrir el modal
    try {
      // Asegurarnos de que bootstrap está disponible
      let bootstrap
      if (typeof window !== "undefined" && window.bootstrap) {
        bootstrap = window.bootstrap
      }
      if (typeof bootstrap !== "undefined") {
        const editResultModal = new bootstrap.Modal(document.getElementById("editResultModal"))
        if (editResultModal) {
          editResultModal.show()
        } else {
          console.error("No se pudo inicializar el modal. El elemento #editResultModal no existe o no es válido.")
        }
      } else {
        console.error("Bootstrap no está definido. Asegúrate de que se ha cargado correctamente.")
      }
    } catch (error) {
      console.error("Error al abrir el modal:", error)
    }
  }

  // Función para guardar los cambios en un resultado
  function saveResult() {
    const result = results[editingResultIndex]

    // Actualizar los datos del resultado
    result.driverId = Number.parseInt(editDriver.value)
    result.constructorId = Number.parseInt(editConstructor.value)
    result.position = editPosition.value
    result.positionText = editPosition.value.toString()
    result.positionOrder = Number.parseInt(editPosition.value)
    result.grid = editGrid.value
    result.points = Number.parseFloat(editPoints.value)
    result.laps = Number.parseInt(editLaps.value)
    result.time = editTime.value
    result.statusId = Number.parseInt(editStatus.value)
    result.fastestLapTime = editFastestLap.value
    result.fastestLapSpeed = editFastestLapSpeed.value ? Number.parseFloat(editFastestLapSpeed.value) : null
    result.rank = editFastestLapRank.checked ? 1 : null

    // Verificar si necesitamos añadir un nuevo piloto a la lista de drivers
    const driverId = Number.parseInt(editDriver.value)
    if (!drivers.some((d) => d.driverId === driverId)) {
      const newDriver = allDrivers.find((d) => d.driverId === driverId)
      if (newDriver) {
        drivers.push(newDriver)
      }
    }

    // Actualizar la tabla de resultados
    updateResultsTable()

    // Cerrar el modal
    const editResultModalEl = document.getElementById("editResultModal")
    let modal
    try {
      modal = bootstrap.Modal.getInstance(editResultModalEl)
    } catch (e) {
      console.warn("Bootstrap modal not properly initialized:", e)
    }
    if (modal) {
      modal.hide()
    }

    showAlert("Resultado actualizado correctamente. No olvides guardar todos los cambios.", "success")
  }

  // Función para eliminar un resultado
  function deleteResult(index) {
    results.splice(index, 1)
    updateResultsTable()
    showAlert("Resultado eliminado correctamente. No olvides guardar todos los cambios.", "success")
  }

  // Función para guardar todos los resultados
  async function saveAllResults() {
    try {
      // Deshabilitar botón mientras se guardan los cambios
      saveResultsBtn.disabled = true
      saveResultsBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'

      // Guardar cada resultado individualmente
      const savePromises = results.map((result) =>
        fetch(`http://localhost:3000/results/${result.resultId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result),
        }),
      )

      // Esperar a que todas las peticiones se completen
      const responses = await Promise.all(savePromises)

      // Verificar si todas las peticiones fueron exitosas
      const allSuccessful = responses.every((response) => response.ok)

      if (allSuccessful) {
        showAlert("Todos los resultados se han guardado correctamente", "success")
      } else {
        showAlert("Hubo errores al guardar algunos resultados", "warning")
      }
    } catch (error) {
      console.error("Error al guardar los resultados:", error)
      showAlert(`Error al guardar los resultados: ${error.message}`, "danger")
    } finally {
      // Restaurar el botón
      saveResultsBtn.disabled = false
      saveResultsBtn.innerHTML = '<i class="bi bi-save"></i> Guardar Todos los Resultados'
    }
  }

  // Función para abrir el modal de edición de clasificación
  function openEditQualifyingModal(index) {
    try {
      const quali = qualifying[index]

      // Llenar el formulario con los datos de la clasificación
      document.getElementById("edit-qualifying-id").value = quali.qualifyingId

      // Llenar el selector de pilotos con todos los pilotos disponibles
      const driverSelect = document.getElementById("edit-qualifying-driver")
      driverSelect.innerHTML = ""
      allDrivers.forEach((driver) => {
        const option = document.createElement("option")
        option.value = driver.driverId
        option.textContent = `${driver.forename} ${driver.surname}`
        driverSelect.appendChild(option)
      })
      driverSelect.value = quali.driverId

      // Llenar el selector de constructores
      const constructorSelect = document.getElementById("edit-qualifying-constructor")
      constructorSelect.innerHTML = ""
      constructors.forEach((constructor) => {
        const option = document.createElement("option")
        option.value = constructor.constructorId
        option.textContent = constructor.name
        constructorSelect.appendChild(option)
      })
      constructorSelect.value = quali.constructorId

      // Llenar el resto de campos
      document.getElementById("edit-qualifying-position").value = quali.position
      document.getElementById("edit-qualifying-q1").value = quali.q1 || ""
      document.getElementById("edit-qualifying-q2").value = quali.q2 || ""
      document.getElementById("edit-qualifying-q3").value = quali.q3 || ""

      // Abrir el modal
      let bootstrap
      if (typeof window !== "undefined" && window.bootstrap) {
        bootstrap = window.bootstrap
      }
      if (typeof bootstrap !== "undefined") {
        const editQualifyingModal = new bootstrap.Modal(document.getElementById("editQualifyingModal"))
        if (editQualifyingModal) {
          editQualifyingModal.show()
        } else {
          console.error("No se pudo inicializar el modal de clasificación.")
        }
      } else {
        console.error("Bootstrap no está definido. Asegúrate de que se ha cargado correctamente.")
      }
    } catch (error) {
      console.error("Error al abrir el modal de clasificación:", error)
      showAlert("Error al abrir el modal de clasificación: " + error.message, "danger")
    }
  }

 // Función para guardar los cambios en una clasificación
function saveQualifyingItem() {
  try {
    const qualifyingId = Number.parseInt(document.getElementById("edit-qualifying-id").value)
    
    // Determinar si estamos editando una clasificación existente o creando una nueva
    let quali
    let isNew = false
    
    // Buscar la clasificación existente por ID
    const index = qualifying.findIndex((q) => q.qualifyId === qualifyingId)
    
    if (index === -1) {
      // Es una nueva clasificación
      isNew = true
      
      // Crear un nuevo objeto de clasificación
      quali = {
        qualifyId: Math.max(...qualifying.map((q) => q.qualifyId || 0), 0) + 1,
        raceId: Number.parseInt(raceId),
        driverId: Number.parseInt(document.getElementById("edit-qualifying-driver").value),
        constructorId: Number.parseInt(document.getElementById("edit-qualifying-constructor").value),
        number: null,
        position: document.getElementById("edit-qualifying-position").value,
        q1: document.getElementById("edit-qualifying-q1").value || null,
        q2: document.getElementById("edit-qualifying-q2").value || null,
        q3: document.getElementById("edit-qualifying-q3").value || null
      }
      
      // Añadir a la lista de clasificaciones
      qualifying.push(quali)
    } else {
      // Es una clasificación existente
      quali = qualifying[index]
      
      // Actualizar los datos de la clasificación
      quali.driverId = Number.parseInt(document.getElementById("edit-qualifying-driver").value)
      quali.constructorId = Number.parseInt(document.getElementById("edit-qualifying-constructor").value)
      quali.position = document.getElementById("edit-qualifying-position").value
      quali.q1 = document.getElementById("edit-qualifying-q1").value || null
      quali.q2 = document.getElementById("edit-qualifying-q2").value || null
      quali.q3 = document.getElementById("edit-qualifying-q3").value || null
    }

    // Actualizar la tabla de clasificaciones
    updateQualifyingTable()

    // Cerrar el modal
    const editQualifyingModalEl = document.getElementById("editQualifyingModal")
    let bootstrap
    if (typeof window !== "undefined" && window.bootstrap) {
      bootstrap = window.bootstrap
    }
    const modal = bootstrap.Modal.getInstance(editQualifyingModalEl)
    if (modal) {
      modal.hide()
    }

    showAlert(
      isNew 
        ? "Clasificación creada correctamente. No olvides guardar todos los cambios." 
        : "Clasificación actualizada correctamente. No olvides guardar todos los cambios.", 
      "success"
    )
  } catch (error) {
    console.error("Error al guardar la clasificación:", error)
    showAlert("Error al guardar la clasificación: " + error.message, "danger")
  }
}


  // Añadir event listener para el botón de guardar clasificación en el modal
  document.getElementById("save-qualifying-item-btn")?.addEventListener("click", saveQualifyingItem)

  // Función para eliminar una clasificación
  function deleteQualifying(index) {
    qualifying.splice(index, 1)
    updateQualifyingTable()
    showAlert("Clasificación eliminada correctamente. No olvides guardar todos los cambios.", "success")
  }

  // Función para guardar los datos de la carrera
  async function saveRaceData(event) {
    event.preventDefault()

    try {
      // Obtener datos del formulario
      const formData = new FormData(raceForm)
      const raceData = {
        ...race,
        name: formData.get("name"),
        round: Number.parseInt(formData.get("round")),
        date: formData.get("date"),
        time: formData.get("time") + ":00",
        year: Number.parseInt(formData.get("year")),
        url: formData.get("url"),
      }

      // Enviar datos a la API
      const response = await fetch(`http://localhost:3000/races/${raceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(raceData),
      })

      if (!response.ok) {
        throw new Error(`Error al guardar los datos: ${response.status}`)
      }

      // Actualizar datos locales
      race = await response.json()

      showAlert("Datos de la carrera actualizados correctamente", "success")
    } catch (error) {
      console.error("Error al guardar los datos:", error)
      showAlert(`Error al guardar los datos: ${error.message}`, "danger")
    }
  }

  // Event listeners
  raceForm.addEventListener("submit", saveRaceData)
  saveResultsBtn.addEventListener("click", saveAllResults)
  saveResultBtn.addEventListener("click", saveResult)

  // Event listener para el botón de añadir resultado
  addResultBtn.addEventListener("click", async () => {
    try {
      // Mostrar un indicador de carga
      addResultBtn.disabled = true
      addResultBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparando nuevo resultado...'

      // Crear un nuevo resultado
      const newResult = {
        resultId: Math.max(...results.map((r) => r.resultId || 0), 0) + 1,
        raceId: Number.parseInt(raceId),
        driverId: allDrivers[0]?.driverId || 1,
        constructorId: constructors[0]?.constructorId || 1,
        number: null,
        grid: results.length + 1,
        position: results.length + 1,
        positionText: (results.length + 1).toString(),
        positionOrder: results.length + 1,
        points: 0,
        laps: 0,
        time: null,
        milliseconds: null,
        fastestLap: null,
        rank: null,
        fastestLapTime: null,
        fastestLapSpeed: null,
        statusId: 1,
      }

      // Añadir a la lista de resultados
      results.push(newResult)

      // Actualizar la tabla
      updateResultsTable()

      // Abrir el modal para editar el nuevo resultado
      // Asegurarnos de que bootstrap está disponible
      let bootstrap
      if (typeof window !== "undefined" && window.bootstrap) {
        bootstrap = window.bootstrap
      }
      if (typeof bootstrap === "undefined") {
        // Si bootstrap no está definido, intentamos obtenerlo de window
        bootstrap = window.bootstrap
        if (!bootstrap) {
          console.error("Bootstrap no está disponible. No se puede abrir el modal.")
          showAlert("Error: No se puede abrir el modal de edición. Bootstrap no está disponible.", "danger")
          return
        }
      }

      openEditResultModal(results.length - 1)
    } catch (error) {
      console.error("Error al añadir nuevo resultado:", error)
      showAlert("Error al añadir nuevo resultado: " + error.message, "danger")
    } finally {
      // Restaurar el botón
      addResultBtn.disabled = false
      addResultBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Añadir Resultado'
    }
  })

// Event listener para el botón de guardar clasificaciones
saveQualifyingBtn.addEventListener("click", async () => {
  try {
    // Deshabilitar botón mientras se guardan los cambios
    saveQualifyingBtn.disabled = true
    saveQualifyingBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'

    // Guardar cada clasificación individualmente
    const savePromises = qualifying.map((quali) => {
      // Determinar si es una clasificación nueva o existente
      const isNew = !quali.qualifyingId; // Si no tiene ID, es nueva
      const url = isNew 
        ? `http://localhost:3000/qualifying` 
        : `http://localhost:3000/qualifying/${quali.qualifyId}`;
      const method = isNew ? 'POST' : 'PUT';
      
      return fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quali),
      });
    });

    // Esperar a que todas las peticiones se completen
    const responses = await Promise.all(savePromises)

    // Verificar si todas las peticiones fueron exitosas
    const allSuccessful = responses.every((response) => response.ok)

    if (allSuccessful) {
      showAlert("Todas las clasificaciones se han guardado correctamente", "success")
    } else {
      showAlert("Hubo errores al guardar algunas clasificaciones", "warning")
    }
  } catch (error) {
    console.error("Error al guardar las clasificaciones:", error)
    showAlert(`Error al guardar las clasificaciones: ${error.message}`, "danger")
  } finally {
    // Restaurar el botón
    saveQualifyingBtn.disabled = false
    saveQualifyingBtn.innerHTML = '<i class="bi bi-save"></i> Guardar Clasificación'
  }
})
  // Añadir un botón para añadir clasificación
  // Primero, añade este HTML después del botón de guardar clasificación en el HTML
  // <button type="button" class="btn btn-outline-success" id="add-qualifying-btn">
  //   <i class="bi bi-plus-circle"></i> Añadir Clasificación
  // </button>

  // Luego, añade este event listener
  document.getElementById("add-qualifying-btn")?.addEventListener("click", async () => {
    try {
      // Mostrar un indicador de carga
      const addQualifyingBtn = document.getElementById("add-qualifying-btn")
      if (addQualifyingBtn) {
        addQualifyingBtn.disabled = true
        addQualifyingBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparando nueva clasificación...'
      }

      // Crear una nueva clasificación
      const newQualifying = {
        qualifyingId: Math.max(...qualifying.map((q) => q.qualifyingId || 0), 0) + 1,
        raceId: Number.parseInt(raceId),
        driverId: allDrivers[0]?.driverId || 1,
        constructorId: constructors[0]?.constructorId || 1,
        number: null,
        position: qualifying.length + 1,
        q1: null,
        q2: null,
        q3: null,
      }

      // Añadir a la lista de clasificaciones
      qualifying.push(newQualifying)

      // Actualizar la tabla
      updateQualifyingTable()

      // Abrir el modal para editar la nueva clasificación
      // Asegurarnos de que bootstrap está disponible
      let bootstrap
      if (typeof window !== "undefined" && window.bootstrap) {
        bootstrap = window.bootstrap
      }
      if (typeof bootstrap === "undefined") {
        // Si bootstrap no está definido, intentamos obtenerlo de window
        bootstrap = window.bootstrap
        if (!bootstrap) {
          console.error("Bootstrap no está disponible. No se puede abrir el modal.")
          showAlert("Error: No se puede abrir el modal de edición. Bootstrap no está disponible.", "danger")
          return
        }
      }

      openEditQualifyingModal(qualifying.length - 1)
    } catch (error) {
      console.error("Error al añadir nueva clasificación:", error)
      showAlert("Error al añadir nueva clasificación: " + error.message, "danger")
    } finally {
      // Restaurar el botón
      const addQualifyingBtn = document.getElementById("add-qualifying-btn")
      if (addQualifyingBtn) {
        addQualifyingBtn.disabled = false
        addQualifyingBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Añadir Clasificación'
      }
    }
  })

  // Cargar datos iniciales
  loadRaceData()
})

