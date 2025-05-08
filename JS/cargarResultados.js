document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("results-container");
    
    // Obtener el ID del circuito de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const circuitId = urlParams.get('id');
    
    if (!circuitId) {
        container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> No se especificó un ID de circuito.
                </div>
                <a href="../index.html" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver al inicio
                </a>
            </div>
        `;
        return;
    }
    
    try {
        // Realizar múltiples peticiones en paralelo
        const [circuitResponse, racesResponse, resultsResponse, driversResponse, constructorsResponse, seasonsResponse] = await Promise.all([
            fetch(`http://localhost:3000/circuitos/${circuitId}`),
            fetch(`http://localhost:3000/races`),
            fetch(`http://localhost:3000/results`),
            fetch(`http://localhost:3000/drivers`),
            fetch(`http://localhost:3000/constructors`),
            fetch(`http://localhost:3000/seasons`)
        ]);
        
        // Verificar si alguna petición falló
        if (!circuitResponse.ok) {
            throw new Error(`Error al obtener datos del circuito: ${circuitResponse.status}`);
        }
        
        // Obtener los datos
        const circuit = await circuitResponse.json();
        const allRaces = await racesResponse.json();
        const allResults = await resultsResponse.json();
        const allDrivers = await driversResponse.json();
        const allConstructors = await constructorsResponse.json();
        const allSeasons = await seasonsResponse.json();
        
        // Filtrar carreras por circuito
        const circuitRaces = allRaces.filter(race => race.circuitId === parseInt(circuitId));
        
        // Si no hay carreras para este circuito
        if (circuitRaces.length === 0) {
            container.innerHTML = `
                <div class="container my-5">
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle-fill"></i> No se encontraron carreras para este circuito.
                    </div>
                    <a href="../index.html" class="btn btn-motorsport">
                        <i class="bi bi-arrow-left"></i> Volver al inicio
                    </a>
                </div>
            `;
            return;
        }
        
        // Agrupar carreras por temporada
        const racesByYear = {};
        circuitRaces.forEach(race => {
            if (!racesByYear[race.year]) {
                racesByYear[race.year] = [];
            }
            racesByYear[race.year].push(race);
        });
        
        // Ordenar temporadas (más reciente primero)
        const years = Object.keys(racesByYear).sort((a, b) => b - a);
        
        // Actualizar el título de la página
        document.title = `Resultados: ${circuit.name} - MotorsportLIVE`;
        
        // Generar HTML para la cabecera
        let headerHTML = `
            <div class="circuit-header" style="background-image: url('https://source.unsplash.com/1600x400/?racing,circuit,${circuit.name.toLowerCase().replace(/\s+/g, '-')}')">
                <div class="container circuit-header-content">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="../index.html" class="text-white">Inicio</a></li>
                            <li class="breadcrumb-item active text-white" aria-current="page">Resultados</li>
                        </ol>
                    </nav>
                    <h1 class="display-4 fw-bold">${circuit.name}</h1>
                    <p class="lead">${circuit.location}, ${circuit.country}</p>
                </div>
            </div>
        `;
        
        // Generar HTML para el selector de temporadas
        let seasonSelectorHTML = `
            <div class="container">
                <div class="season-selector">
                    <h4 class="mb-3">Seleccionar temporada</h4>
                    <div class="d-flex flex-wrap">
        `;
        
        years.forEach((year, index) => {
            seasonSelectorHTML += `
                <button class="btn btn-outline-dark season-btn ${index === 0 ? 'active' : ''}" data-year="${year}">
                    ${year}
                </button>
            `;
        });
        
        seasonSelectorHTML += `
                    </div>
                </div>
            </div>
        `;
        
        // Generar HTML para los resultados (inicialmente mostrar la temporada más reciente)
        let resultsHTML = `<div class="container mt-4" id="results-content">`;
        
        // Función para obtener los resultados de una carrera
        function getRaceResults(raceId) {
            return allResults.filter(result => result.raceId === raceId);
        }
        
        // Función para obtener el nombre del piloto
        function getDriverName(driverId) {
            const driver = allDrivers.find(d => d.driverId === driverId);
            return driver ? `${driver.forename} ${driver.surname}` : 'Desconocido';
        }
        
        // Función para obtener el nombre del constructor
        function getConstructorName(constructorId) {
            const constructor = allConstructors.find(c => c.constructorId === constructorId);
            return constructor ? constructor.name : 'Desconocido';
        }
        
        // Función para generar HTML de resultados para una temporada
        function generateResultsForYear(year) {
            let yearResultsHTML = '';
            
            racesByYear[year].forEach(race => {
                const raceResults = getRaceResults(race.raceId);
                
                if (raceResults.length === 0) {
                    return; // Saltar si no hay resultados
                }
                
                // Ordenar resultados por posición
                raceResults.sort((a, b) => a.positionOrder - b.positionOrder);
                
                yearResultsHTML += `
                    <div class="results-table">
                        <div class="race-info">
                            <h3>${race.name}</h3>
                            <p class="race-date">
                                <i class="bi bi-calendar3"></i> ${new Date(race.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                ${race.time !== "\\N" ? `<i class="bi bi-clock ms-3"></i> ${race.time.substring(0, 5)}` : ''}
                            </p>
                        </div>
                        
                        <h4 class="results-title">Resultados de la carrera</h4>
                        
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Piloto</th>
                                        <th>Equipo</th>
                                        <th>Vueltas</th>
                                        <th>Tiempo</th>
                                        <th>Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                raceResults.forEach(result => {
                    const driverName = getDriverName(result.driverId);
                    const constructorName = getConstructorName(result.constructorId);
                    
                    yearResultsHTML += `
                        <tr>
                            <td class="position-cell">
                                <div class="position-${result.position <= 3 ? result.position : ''}">
                                    ${result.positionText}
                                </div>
                            </td>
                            <td class="driver-cell">
                                <a href="/HTML/pilotos/detallePiloto.html?id=${result.driverId}" class="text-decoration-none text-dark">
                                    ${driverName}
                                </a>
                            </td>
                            <td class="team-cell">${constructorName}</td>
                            <td>${result.laps}</td>
                            <td class="time-cell">${result.time}</td>
                            <td class="points-cell">${result.points}</td>
                        </tr>
                    `;
                });
                
                yearResultsHTML += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });
            
            return yearResultsHTML || `
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle-fill"></i> No hay resultados disponibles para la temporada ${year}.
                </div>
            `;
        }
        
        // Generar resultados para la temporada más reciente
        resultsHTML += generateResultsForYear(years[0]);
        resultsHTML += `</div>`;
        
        // Combinar todo el HTML
        container.innerHTML = headerHTML + seasonSelectorHTML + resultsHTML;
        
        // Añadir event listeners para los botones de temporada
        document.querySelectorAll('.season-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Actualizar botón activo
                document.querySelectorAll('.season-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Actualizar resultados
                const year = this.getAttribute('data-year');
                document.getElementById('results-content').innerHTML = generateResultsForYear(year);
                
                // Scroll suave hasta los resultados
                document.getElementById('results-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        
    } catch (error) {
        console.error("Error al cargar los resultados:", error);
        container.innerHTML = `
            <div class="container my-5">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los resultados: ${error.message}
                    <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                </div>
                <a href="../index.html" class="btn btn-motorsport">
                    <i class="bi bi-arrow-left"></i> Volver al inicio
                </a>
            </div>
        `;
    }
});