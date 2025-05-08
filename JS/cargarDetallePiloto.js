document.addEventListener("DOMContentLoaded", async function() {
    // Obtener el ID del piloto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const driverId = urlParams.get('id');
    
    if (!driverId) {
        window.location.href = "/HTML/pilotos/todosPilotos.html";
        return;
    }
    
    // Elementos del DOM
    const driverName = document.getElementById("driver-name");
    const driverTeam = document.getElementById("driver-team");
    const driverNationality = document.getElementById("driver-nationality");
    const driverFlag = document.getElementById("driver-flag");
    const driverNumber = document.getElementById("driver-number");
    const driverHeader = document.getElementById("driver-header");
    const driverStats = document.getElementById("driver-stats");
    const driverInfo = document.getElementById("driver-info");
    const recentResults = document.getElementById("recent-results");
    const editDriverBtn = document.getElementById("edit-driver-btn");
    const editStatsBtn = document.getElementById("edit-stats-btn");
    
    // Función para obtener la bandera según la nacionalidad
    function getFlagEmoji(nationality) {
        const countryMap = {
            "British": "gb",
            "German": "de",
            "Spanish": "es",
            "Finnish": "fi",
            "Australian": "au",
            "Dutch": "nl",
            "French": "fr",
            "Italian": "it",
            "Brazilian": "br",
            "Canadian": "ca",
            "Mexican": "mx",
            "Japanese": "jp",
            "Danish": "dk",
            "Thai": "th",
            "Chinese": "cn",
            "American": "us",
            "Russian": "ru",
            "Polish": "pl",
            "Swiss": "ch",
            "Belgian": "be",
            "Austrian": "at",
            "Swedish": "se",
            "Portuguese": "pt",
            "Monegasque": "mc",
            "New Zealander": "nz",
            "Argentine": "ar",
            "Colombian": "co",
            "Indian": "in",
            "Venezuelan": "ve",
            "Hungarian": "hu"
        };
        
        const countryCode = countryMap[nationality] || "unknown";
        return `https://flagcdn.com/24x18/${countryCode}.png`;
    }
    
    // Función para formatear la fecha
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    try {
        // Realizar múltiples peticiones en paralelo
        const [driverResponse, statsResponse, resultsResponse, constructorsResponse] = await Promise.all([
            fetch(`http://localhost:3000/drivers/${driverId}`),
            fetch(`http://localhost:3000/drivers/${driverId}/stats`),
            fetch(`http://localhost:3000/drivers/${driverId}/results`),
            fetch(`http://localhost:3000/constructors`)
        ]);
        
        // Verificar si alguna petición falló
        if (!driverResponse.ok || !statsResponse.ok || !resultsResponse.ok || !constructorsResponse.ok) {
            throw new Error(`Error al obtener datos: ${driverResponse.status}`);
        }
        
        // Obtener los datos
        const driver = await driverResponse.json();
        const stats = await statsResponse.json();
        const results = await resultsResponse.json();
        const constructors = await constructorsResponse.json();
        
        // Encontrar el constructor actual del piloto (si existe)
        let currentConstructor = null;
        if (results.length > 0) {
            const latestResult = results[0]; // El primer resultado es el más reciente
            currentConstructor = constructors.find(c => c.constructorId === latestResult.constructorId);
        }
        
        // Actualizar la información del piloto
        document.title = `${driver.forename} ${driver.surname} - MotorsportLIVE`;
        driverName.textContent = `${driver.forename} ${driver.surname}`;
        driverTeam.textContent = currentConstructor ? currentConstructor.name : "Sin equipo";
        driverNationality.textContent = driver.nationality;
        driverFlag.src = getFlagEmoji(driver.nationality);
        driverFlag.alt = driver.nationality;
        
        // Mostrar el número del piloto
        if (driver.number && driver.number !== "\\N") {
            driverNumber.textContent = `#${driver.number}`;
        } else {
            driverNumber.textContent = "";
        }
        
        // Establecer la imagen de fondo
        driverHeader.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?formula1,${driver.forename.toLowerCase()}-${driver.surname.toLowerCase()}')`;
        
        // Actualizar las estadísticas
        driverStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Carreras</div>
                <div class="stat-value">${stats.totalRaces}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Victorias</div>
                <div class="stat-value">${stats.wins}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Podios</div>
                <div class="stat-value">${stats.podiums}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Puntos</div>
                <div class="stat-value">${stats.points.toFixed(0)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Pole Positions</div>
                <div class="stat-value">${stats.polePositions}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Mejor posición en campeonato</div>
                <div class="stat-value">${stats.bestChampionshipPosition}</div>
            </div>
        `;
        
        // Actualizar la información personal
        driverInfo.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Fecha de nacimiento</div>
                <div class="stat-value">${formatDate(driver.dob)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Nacionalidad</div>
                <div class="stat-value">${driver.nationality}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Código</div>
                <div class="stat-value">${driver.code}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Número</div>
                <div class="stat-value">${driver.number !== "\\N" ? driver.number : "N/A"}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Wikipedia</div>
                <div class="stat-value">
                    <a href="${driver.url}" target="_blank" class="text-motorsport">
                        <i class="bi bi-box-arrow-up-right"></i> Ver perfil
                    </a>
                </div>
            </div>
        `;
        
        // Mostrar resultados recientes
        if (results.length > 0) {
            recentResults.innerHTML = '';
            
            // Mostrar solo los 5 resultados más recientes
            const recentRaces = results.slice(0, 5);
            
            recentRaces.forEach(result => {
                // Determinar la clase para el indicador de posición
                let positionClass = 'position-other';
                if (result.position === "1") {
                    positionClass = 'position-1';
                } else if (result.position === "2") {
                    positionClass = 'position-2';
                } else if (result.position === "3") {
                    positionClass = 'position-3';
                }
                
                const raceCard = document.createElement('div');
                raceCard.className = 'race-card';
                raceCard.innerHTML = `
                    <div class="race-card-header">
                        <div>${result.raceName}</div>
                        <div>${result.year}</div>
                    </div>
                    <div class="race-card-body">
                        <div class="race-result">
                            <div class="position-indicator ${positionClass}">${result.position}</div>
                            <div>
                                <div class="fw-bold">${formatDate(result.date)}</div>
                                <div class="text-muted">Posición final: ${result.position}</div>
                            </div>
                        </div>
                        <div class="race-details">
                            <div class="race-detail-item">
                                <div class="detail-label">Posición de salida</div>
                                <div class="detail-value">${result.grid}</div>
                            </div>
                            <div class="race-detail-item">
                                <div class="detail-label">Puntos</div>
                                <div class="detail-value">${result.points}</div>
                            </div>
                            <div class="race-detail-item">
                                <div class="detail-label">Vueltas</div>
                                <div class="detail-value">${result.laps}</div>
                            </div>
                            <div class="race-detail-item">
                                <div class="detail-label">Vuelta rápida</div>
                                <div class="detail-value">${result.fastestLapTime || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                recentResults.appendChild(raceCard);
            });
        } else {
            recentResults.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle"></i> No hay resultados disponibles para este piloto.
                </div>
            `;
        }
        
        // Configurar los botones de edición
        editDriverBtn.href = `/HTML/pilotos/editarPiloto.html?id=${driverId}`;
        editStatsBtn.href = `/HTML/pilotos/editarEstadisticasPiloto.html?id=${driverId}`;
        
    } catch (error) {
        console.error("Error al cargar los datos del piloto:", error);
        
        // Mostrar mensaje de error
        driverName.textContent = "Error al cargar datos";
        driverTeam.textContent = "Intente nuevamente más tarde";
        driverStats.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar las estadísticas: ${error.message}
                <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
            </div>
        `;
        driverInfo.innerHTML = driverStats.innerHTML;
        recentResults.innerHTML = driverStats.innerHTML;
    }
});