document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("team-container");
    
    // Obtener el ID del equipo de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const constructorId = urlParams.get('id');
    
    if (!constructorId) {
        container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> No se especificó un ID de equipo.
                </div>
                <a href="/HTML/equipos/todosEquipos.html" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver a equipos
                </a>
            </div>
        `;
        return;
    }
    
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
        return `https://flagcdn.com/w160/${countryCode}.png`;
    }
    
    // Función para obtener el color del equipo
    function getTeamColor(team) {
        const name = team.name.toLowerCase();
        const ref = team.constructorRef.toLowerCase();
        
        if (name.includes("ferrari") || ref.includes("ferrari")) {
            return "#FF2800"; // Rojo Ferrari
        } else if (name.includes("mercedes") || ref.includes("mercedes")) {
            return "#00D2BE"; // Turquesa Mercedes
        } else if (name.includes("red bull") || ref.includes("redbull")) {
            return "#0600EF"; // Azul Red Bull
        } else if (name.includes("mclaren") || ref.includes("mclaren")) {
            return "#FF8700"; // Naranja McLaren
        } else if (name.includes("williams") || ref.includes("williams")) {
            return "#005AFF"; // Azul Williams
        } else if (name.includes("alpine") || ref.includes("alpine")) {
            return "#0090FF"; // Azul Alpine
        } else if (name.includes("aston martin") || ref.includes("aston")) {
            return "#006F62"; // Verde Aston Martin
        } else if (name.includes("honda") || ref.includes("honda")) {
            return "#e10600"; // Rojo Honda
        } else if (name.includes("yamaha") || ref.includes("yamaha")) {
            return "#0046FF"; // Azul Yamaha
        } else if (name.includes("ducati") || ref.includes("ducati")) {
            return "#e10600"; // Rojo Ducati
        } else if (name.includes("toyota") || ref.includes("toyota")) {
            return "#EB0A1E"; // Rojo Toyota
        } else if (name.includes("hyundai") || ref.includes("hyundai")) {
            return "#003C7E"; // Azul Hyundai
        }
        
        // Colores aleatorios para otros equipos
        const colors = ["#3498db", "#2ecc71", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c", "#d35400"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Función para obtener el logo del equipo
    function getTeamLogo(team) {
        const name = team.name.toLowerCase();
        const ref = team.constructorRef.toLowerCase();
        
        // En un caso real, aquí se usarían URLs a logos reales
        // Para este ejemplo, usamos iconos de Bootstrap que representan cada equipo
        
        if (name.includes("ferrari") || ref.includes("ferrari")) {
            return `<i class="bi bi-shield-fill text-danger" style="font-size: 3rem;"></i>`;
        } else if (name.includes("mercedes") || ref.includes("mercedes")) {
            return `<i class="bi bi-star-fill text-info" style="font-size: 3rem;"></i>`;
        } else if (name.includes("red bull") || ref.includes("redbull")) {
            return `<i class="bi bi-lightning-fill text-primary" style="font-size: 3rem;"></i>`;
        } else if (name.includes("mclaren") || ref.includes("mclaren")) {
            return `<i class="bi bi-speedometer2 text-warning" style="font-size: 3rem;"></i>`;
        } else if (name.includes("williams") || ref.includes("williams")) {
            return `<i class="bi bi-trophy-fill text-primary" style="font-size: 3rem;"></i>`;
        } else if (name.includes("alpine") || ref.includes("alpine")) {
            return `<i class="bi bi-diamond-fill text-info" style="font-size: 3rem;"></i>`;
        } else if (name.includes("aston martin") || ref.includes("aston")) {
            return `<i class="bi bi-suit-heart-fill text-success" style="font-size: 3rem;"></i>`;
        } else {
            return `<i class="bi bi-car-front-fill" style="font-size: 3rem;"></i>`;
        }
    }
    
    try {
        // Realizar múltiples peticiones en paralelo
        const [
            constructorResponse, 
            constructorStandingsResponse, 
            constructorResultsResponse,
            driversResponse,
            resultsResponse,
            racesResponse
        ] = await Promise.all([
            fetch(`http://localhost:3000/constructors/${constructorId}`),
            fetch(`http://localhost:3000/constructorStandings`),
            fetch(`http://localhost:3000/constructorResults`),
            fetch(`http://localhost:3000/drivers`),
            fetch(`http://localhost:3000/results`),
            fetch(`http://localhost:3000/races`)
        ]);
        
        // Verificar si alguna petición falló
        if (!constructorResponse.ok) {
            throw new Error(`Error al obtener datos del equipo: ${constructorResponse.status}`);
        }
        
        // Obtener los datos
        const constructor = await constructorResponse.json();
        const allConstructorStandings = await constructorStandingsResponse.json();
        const allConstructorResults = await constructorResultsResponse.json();
        const allDrivers = await driversResponse.json();
        const allResults = await resultsResponse.json();
        const allRaces = await racesResponse.json();
        
        // Filtrar datos para este constructor
        const constructorStandings = allConstructorStandings.filter(standing => standing.constructorId === parseInt(constructorId));
        const constructorResults = allConstructorResults.filter(result => result.constructorId === parseInt(constructorId));
        
        // Preparar datos para el gráfico de puntos por temporada y calcular puntos totales correctamente
        const pointsByYear = {};
        const racesByYear = {};
        
        // Agrupar resultados por año
        constructorResults.forEach(result => {
            const race = allRaces.find(r => r.raceId === result.raceId);
            if (!race) return;
            
            const year = race.year;
            if (!pointsByYear[year]) {
                pointsByYear[year] = 0;
                racesByYear[year] = 0;
            }
            
            pointsByYear[year] += parseFloat(result.points);
            racesByYear[year]++;
        });
        
        // Calcular estadísticas correctamente
        // 1. Puntos totales: suma de los puntos por temporada
        const totalPoints = Object.values(pointsByYear).reduce((sum, points) => sum + points, 0);
        
        // 2. Total de carreras: suma de carreras por temporada
        const totalRaces = Object.values(racesByYear).reduce((sum, races) => sum + races, 0);
        
        // 3. Victorias: usar el último standing disponible para obtener el total acumulado
        // Ordenar standings por raceId (más reciente primero)
        const sortedStandings = [...constructorStandings].sort((a, b) => b.raceId - a.raceId);
        const totalWins = sortedStandings.length > 0 ? parseInt(sortedStandings[0].wins) : 0;
        
        // 4. Mejor posición: igual que antes
        const bestPosition = constructorStandings.length > 0 ? 
            Math.min(...constructorStandings.map(standing => parseInt(standing.position))) : 'N/A';
        
        // Obtener pilotos asociados con este equipo
        const teamResultsWithDrivers = allResults.filter(result => result.constructorId === parseInt(constructorId));
        const teamDriverIds = [...new Set(teamResultsWithDrivers.map(result => result.driverId))];
        const teamDrivers = teamDriverIds.map(driverId => {
            const driver = allDrivers.find(d => d.driverId === driverId);
            if (!driver) return null;
            
            // Calcular estadísticas del piloto con este equipo
            const driverResults = teamResultsWithDrivers.filter(result => result.driverId === driverId);
            const driverPoints = driverResults.reduce((sum, result) => sum + parseFloat(result.points), 0);
            const driverWins = driverResults.filter(result => result.position === "1").length;
            
            return {
                ...driver,
                points: driverPoints,
                wins: driverWins,
                races: driverResults.length
            };
        }).filter(driver => driver !== null);
        
        // Obtener resultados recientes
        const recentResults = [...teamResultsWithDrivers]
            .sort((a, b) => b.raceId - a.raceId)
            .slice(0, 5); // Tomar los 5 más recientes
        
        // Enriquecer los resultados con información de carreras y pilotos
        const enrichedResults = recentResults.map(result => {
            const race = allRaces.find(r => r.raceId === result.raceId);
            const driver = allDrivers.find(d => d.driverId === result.driverId);
            
            return {
                ...result,
                raceName: race ? race.name : 'Desconocida',
                raceDate: race ? race.date : 'Desconocida',
                driverName: driver ? `${driver.forename} ${driver.surname}` : 'Desconocido'
            };
        });
        
        // Ordenar años para el gráfico
        const years = Object.keys(pointsByYear).sort();
        const pointsData = years.map(year => pointsByYear[year]);
        
        // Actualizar el título de la página
        document.title = `${constructor.name} - MotorsportLIVE`;
        
        // Obtener color y logo del equipo
        const teamColor = getTeamColor(constructor);
        const teamLogo = getTeamLogo(constructor);
        
        // Generar HTML para la página
        const teamHTML = `
            <!-- Cabecera del equipo -->
            <div class="team-header" style="background-color: ${teamColor}">
                <div class="team-header-overlay"></div>
                <div class="container team-header-content">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="../index.html" class="text-white">Inicio</a></li>
                            <li class="breadcrumb-item"><a href="/HTML/equipos/todosEquipos.html" class="text-white">Equipos</a></li>
                            <li class="breadcrumb-item active text-white" aria-current="page">${constructor.name}</li>
                        </ol>
                    </nav>
                    
                    <div class="d-flex flex-column flex-md-row align-items-center mb-4">
                        <div class="team-logo-large">
                            ${teamLogo}
                        </div>
                        <div class="ms-md-4 text-center text-md-start">
                            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
                                <h1 class="display-4 fw-bold mb-0">${constructor.name}</h1>
                                <img src="${getFlagEmoji(constructor.nationality)}" alt="${constructor.nationality}" class="team-flag-large">
                            </div>
                            <p class="lead mb-0">${constructor.nationality}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Contenido principal -->
            <div class="container mt-n4">
                <!-- Tarjeta de estadísticas -->
                <div class="team-stats-card">
                    <div class="team-stats-header">
                        <h3>Estadísticas generales</h3>
                    </div>
                    <div class="team-stats-content">
                        <div class="row g-4">
                            <div class="col-6 col-md-3">
                                <div class="stat-box">
                                    <div class="stat-value-large">${totalPoints.toFixed(0)}</div>
                                    <div class="stat-label-large">PUNTOS TOTALES</div>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="stat-box">
                                    <div class="stat-value-large">${totalWins}</div>
                                    <div class="stat-label-large">VICTORIAS</div>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="stat-box">
                                    <div class="stat-value-large">${bestPosition}</div>
                                    <div class="stat-label-large">MEJOR POSICIÓN</div>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="stat-box">
                                    <div class="stat-value-large">${totalRaces}</div>
                                    <div class="stat-label-large">CARRERAS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pestañas de contenido -->
                <ul class="nav nav-tabs mb-4" id="teamTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="true">
                            <i class="bi bi-info-circle"></i> Resumen
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="drivers-tab" data-bs-toggle="tab" data-bs-target="#drivers" type="button" role="tab" aria-controls="drivers" aria-selected="false">
                            <i class="bi bi-person-circle"></i> Pilotos
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="results-tab" data-bs-toggle="tab" data-bs-target="#results" type="button" role="tab" aria-controls="results" aria-selected="false">
                            <i class="bi bi-trophy"></i> Resultados
                        </button>
                    </li>
                </ul>
                
                <!-- Contenido de las pestañas -->
                <div class="tab-content" id="teamTabsContent">
                    <!-- Pestaña de resumen -->
                    <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                        <div class="row">
                            <div class="col-md-6 mb-4">
                                <div class="team-stats-card">
                                    <div class="team-stats-header">
                                        <h4>Información del equipo</h4>
                                    </div>
                                    <div class="team-stats-content">
                                        <p>
                                            <strong>${constructor.name}</strong> es un equipo de origen ${constructor.nationality}. 
                                            Ha participado en ${totalRaces} carreras, acumulando un total de ${totalPoints.toFixed(0)} puntos 
                                            y ${totalWins} victorias a lo largo de su historia.
                                        </p>
                                        <p>
                                            Su mejor posición en el campeonato ha sido ${bestPosition}.
                                            Para más información, puedes visitar su 
                                            <a href="${constructor.url}" target="_blank" class="text-motorsport">página oficial <i class="bi bi-box-arrow-up-right"></i></a>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-4">
                                <div class="team-stats-card">
                                    <div class="team-stats-header">
                                        <h4>Puntos por temporada</h4>
                                    </div>
                                    <div class="team-stats-content">
                                        <div class="chart-container">
                                            <canvas id="pointsChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pestaña de pilotos -->
                    <div class="tab-pane fade" id="drivers" role="tabpanel" aria-labelledby="drivers-tab">
                        <div class="team-stats-card">
                            <div class="team-stats-header">
                                <h4>Pilotos del equipo</h4>
                            </div>
                            <div class="team-stats-content">
                                ${teamDrivers.length > 0 ? 
                                    teamDrivers.map((driver, index) => `
                                        <div class="driver-card">
                                            <div class="driver-number">${index + 1}</div>
                                            <div class="driver-avatar">
                                                <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
                                            </div>
                                            <div class="driver-info">
                                                <h5 class="driver-name">
                                                    <a href="/HTML/pilotos/detallePiloto.html?id=${driver.driverId}" class="text-decoration-none text-dark">
                                                        ${driver.forename} ${driver.surname}
                                                    </a>
                                                </h5>
                                                <div class="driver-nationality">
                                                    <img src="${getFlagEmoji(driver.nationality)}" alt="${driver.nationality}" width="20" class="me-1">
                                                    ${driver.nationality}
                                                </div>
                                            </div>
                                            <div class="driver-stats">
                                                <div class="fw-bold text-motorsport">${driver.points.toFixed(0)} pts</div>
                                                <div class="small">${driver.wins} victorias</div>
                                            </div>
                                        </div>
                                    `).join('') : 
                                    `<div class="alert alert-info">No se encontraron pilotos asociados a este equipo.</div>`
                                }
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pestaña de resultados -->
                    <div class="tab-pane fade" id="results" role="tabpanel" aria-labelledby="results-tab">
                        <div class="team-stats-card">
                            <div class="team-stats-header">
                                <h4>Resultados recientes</h4>
                            </div>
                            <div class="team-stats-content">
                                ${enrichedResults.length > 0 ? 
                                    enrichedResults.map(result => `
                                        <div class="result-card">
                                            <div class="result-race">${result.raceName}</div>
                                            <div class="result-date">
                                                <i class="bi bi-calendar3"></i> ${new Date(result.raceDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <div class="result-position position-${result.position <= 3 ? result.position : 'other'}">${result.positionText}</div>
                                                <div>
                                                    <div class="fw-bold">${result.driverName}</div>
                                                    <div class="small text-muted">
                                                        Puntos: <span class="text-motorsport fw-bold">${result.points}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('') : 
                                    `<div class="alert alert-info">No se encontraron resultados recientes para este equipo.</div>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Actualizar el contenido
        container.innerHTML = teamHTML;
        
        // Inicializar el gráfico de puntos por temporada
        const ctx = document.getElementById('pointsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Puntos',
                    data: pointsData,
                    backgroundColor: teamColor,
                    borderColor: teamColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Puntos'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Temporada'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error("Error al cargar los detalles del equipo:", error);
        container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los detalles del equipo: ${error.message}
                    <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                </div>
                <a href="/HTML/equipos/todosEquipos.html" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver a equipos
                </a>
            </div>
        `;
    }
});