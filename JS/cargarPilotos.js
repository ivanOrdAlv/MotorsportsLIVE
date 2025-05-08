document.addEventListener("DOMContentLoaded", async function() {
    const driversContainer = document.getElementById("driversContainer");
    const nationalityFilter = document.getElementById("nationalityFilter");
    const searchInput = document.getElementById("searchDriver");
    
    let allDrivers = [];
    let filteredDrivers = [];
    let selectedNationality = null;
    
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
    
    // Función para obtener la URL de la imagen del piloto
    function getDriverImageUrl(driver) {
        // En un caso real, tendrías imágenes reales de los pilotos
        // Aquí usamos una imagen genérica basada en el nombre
        const driverName = `${driver.forename} ${driver.surname}`.toLowerCase().replace(/\s+/g, '-');
        return `https://source.unsplash.com/300x400/?formula1,driver,racing,${driverName}`;
    }
    
    // Función para renderizar los pilotos
    function renderDrivers(drivers) {
        if (drivers.length === 0) {
            driversContainer.innerHTML = `
                <div class="col-12">
                    <div class="no-results">
                        <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
                        <h3 class="mt-3">No se encontraron pilotos</h3>
                        <p class="text-muted">Intenta con otros criterios de búsqueda</p>
                    </div>
                </div>
            `;
            return;
        }
        
        driversContainer.innerHTML = '';
        
        drivers.forEach(driver => {
            const driverNumber = driver.number !== "\\N" ? driver.number : "N/A";
            
            const driverCard = document.createElement('div');
            driverCard.className = 'col-md-6 col-lg-4';
            driverCard.innerHTML = `
                <div class="driver-card">
                    <div class="driver-image" style="background-image: url('${getDriverImageUrl(driver)}')">
                        ${driverNumber !== "N/A" ? `<div class="driver-number">${driverNumber}</div>` : ''}
                    </div>
                    <div class="driver-info">
                        <h3 class="driver-name">${driver.forename} ${driver.surname}</h3>
                        <div class="driver-nationality">
                            <img src="${getFlagEmoji(driver.nationality)}" alt="${driver.nationality}" class="flag-icon">
                            ${driver.nationality}
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-dark">${driver.code || 'N/A'}</span>
                            <a href="/HTML/pilotos/detallePiloto.html?id=${driver.driverId}" class="btn btn-sm btn-motorsport">Ver perfil</a>
                        </div>
                        <div class="driver-stats">
                            <div class="stat">
                                <div class="stat-value">${driver.stats.wins}</div>
                                <div class="stat-label">Victorias</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${driver.stats.podiums}</div>
                                <div class="stat-label">Podios</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${driver.stats.points.toFixed(0)}</div>
                                <div class="stat-label">Puntos</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            driversContainer.appendChild(driverCard);
        });
    }
    
    // Función para crear los filtros de nacionalidad
    function createNationalityFilters(drivers) {
        // Obtener nacionalidades únicas
        const nationalities = [...new Set(drivers.map(driver => driver.nationality))];
        
        // Crear botón para "Todos"
        const allButton = document.createElement('span');
        allButton.className = 'badge bg-secondary nationality-badge active';
        allButton.textContent = 'Todos';
        allButton.dataset.nationality = 'all';
        nationalityFilter.appendChild(allButton);
        
        // Crear botones para cada nacionalidad
        nationalities.forEach(nationality => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary nationality-badge';
            badge.innerHTML = `<img src="${getFlagEmoji(nationality)}" alt="${nationality}" class="flag-icon" style="width: 16px;"> ${nationality}`;
            badge.dataset.nationality = nationality;
            nationalityFilter.appendChild(badge);
        });
        
        // Agregar eventos de clic a los botones
        document.querySelectorAll('.nationality-badge').forEach(badge => {
            badge.addEventListener('click', function() {
                // Quitar la clase active de todos los botones
                document.querySelectorAll('.nationality-badge').forEach(b => b.classList.remove('active'));
                
                // Agregar la clase active al botón clickeado
                this.classList.add('active');
                
                // Actualizar el filtro seleccionado
                selectedNationality = this.dataset.nationality === 'all' ? null : this.dataset.nationality;
                
                // Aplicar filtros
                applyFilters();
            });
        });
    }
    
    // Función para aplicar filtros
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredDrivers = allDrivers.filter(driver => {
            const fullName = `${driver.forename} ${driver.surname}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm);
            const matchesNationality = selectedNationality ? driver.nationality === selectedNationality : true;
            
            return matchesSearch && matchesNationality;
        });
        
        renderDrivers(filteredDrivers);
    }
    
    // Cargar los pilotos y sus estadísticas
    try {
        // Realizar múltiples peticiones en paralelo
        const [driversResponse, resultsResponse, driverStandingsResponse, racesResponse] = await Promise.all([
            fetch("http://localhost:3000/drivers"),
            fetch("http://localhost:3000/results"),
            fetch("http://localhost:3000/driverStandings"),
            fetch("http://localhost:3000/races")
        ]);
        
        // Verificar si alguna petición falló
        if (!driversResponse.ok || !resultsResponse.ok || !driverStandingsResponse.ok || !racesResponse.ok) {
            throw new Error(`Error al obtener datos: ${driversResponse.status}`);
        }
        
        // Obtener los datos
        const drivers = await driversResponse.json();
        const results = await resultsResponse.json();
        const driverStandings = await driverStandingsResponse.json();
        const races = await racesResponse.json();
        
        // Calcular estadísticas para cada piloto - CÓDIGO CORREGIDO
        allDrivers = drivers.map(driver => {
            // Filtrar todos los resultados para este piloto
            const driverResults = results.filter(result => result.driverId === driver.driverId);
            
            // Calcular victorias (posición 1)
            const wins = driverResults.filter(result => 
                result.position === "1" || result.position === 1
            ).length;
            
            // Calcular podios (posiciones 1, 2 o 3)
            const podiums = driverResults.filter(result => 
                result.position === "1" || result.position === "2" || result.position === "3" ||
                result.position === 1 || result.position === 2 || result.position === 3
            ).length;
            
            // Calcular puntos totales
            const points = driverResults.reduce((total, result) => 
                total + (parseFloat(result.points) || 0), 0
            );
            
            // Obtener el último standing del piloto (si existe)
            const driverStandingsForDriver = driverStandings.filter(
                standing => standing.driverId === driver.driverId
            );
            
            let latestStanding = null;
            if (driverStandingsForDriver.length > 0) {
                latestStanding = [...driverStandingsForDriver].sort((a, b) => b.raceId - a.raceId)[0];
            }
            
            // Añadir estadísticas al objeto del piloto
            return {
                ...driver,
                stats: {
                    wins: wins,
                    podiums: podiums,
                    points: points,
                    // Usar datos del standing si está disponible
                    position: latestStanding ? latestStanding.position : 'N/A'
                }
            };
        });
        
        filteredDrivers = [...allDrivers];
        
        // Crear filtros de nacionalidad
        createNationalityFilters(allDrivers);
        
        // Renderizar los pilotos
        renderDrivers(filteredDrivers);
        
        // Agregar evento de búsqueda
        searchInput.addEventListener('input', applyFilters);
        
    } catch (error) {
        console.error("Error al cargar los pilotos:", error);
        driversContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los pilotos: ${error.message}
                    <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                </div>
            </div>
        `;
    }
});