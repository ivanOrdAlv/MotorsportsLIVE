document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("circuitos-container");
    const seasonTitle = document.getElementById("season-title");
    const seasonDropdown = document.getElementById("seasonDropdown");
    const seasonDropdownItems = document.getElementById("seasonDropdownItems");
    
    let currentYear = 2025; // Año por defecto
    
    // Función para cargar las temporadas disponibles
    async function loadSeasons() {
        try {
            const response = await fetch("http://localhost:3000/seasons", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const seasons = await response.json();
            
            // Ordenar temporadas de más reciente a más antigua
            seasons.sort((a, b) => b.year - a.year);
            
            // Añadir la temporada actual (2025) si no existe
            if (!seasons.some(season => season.year === 2025)) {
                seasons.unshift({ year: 2025, url: "#" });
            }
            
            // Limpiar el dropdown
            seasonDropdownItems.innerHTML = '';
            
            // Añadir las temporadas al dropdown
            seasons.forEach(season => {
                const item = document.createElement("li");
                const link = document.createElement("a");
                link.classList.add("dropdown-item");
                link.href = "#";
                link.textContent = `Temporada ${season.year}`;
                link.dataset.year = season.year;
                
                // Añadir evento de clic
                link.addEventListener("click", function(e) {
                    e.preventDefault();
                    currentYear = parseInt(this.dataset.year);
                    seasonTitle.textContent = `Temporada ${currentYear}`;
                    loadCircuits(currentYear);
                });
                
                item.appendChild(link);
                seasonDropdownItems.appendChild(item);
            });
            
        } catch (error) {
            console.error("Error al cargar las temporadas:", error);
            seasonDropdownItems.innerHTML = `
                <li><a class="dropdown-item text-danger" href="#">Error al cargar temporadas</a></li>
            `;
        }
    }
    
    // Función para cargar los circuitos de una temporada específica
    async function loadCircuits(year) {
        // Mostrar mensaje de carga
        container.innerHTML = `
            <div class="col-12 text-center my-4">
                <div class="spinner-border text-motorsport" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando circuitos de la temporada ${year}...</p>
            </div>
        `;

        try {
            // Primero, obtener todas las carreras
            const racesResponse = await fetch("http://localhost:3000/races", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!racesResponse.ok) {
                throw new Error(`Error HTTP: ${racesResponse.status}`);
            }
            
            const allRaces = await racesResponse.json();
            
            // Filtrar carreras por año
            const racesByYear = allRaces.filter(race => race.year === parseInt(year));
            
            // Si no hay carreras para este año, mostrar mensaje
            if (racesByYear.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center my-4">
                        <div class="alert alert-info" role="alert">
                            <i class="bi bi-info-circle"></i> No se encontraron circuitos para la temporada ${year}.
                        </div>
                    </div>
                `;
                return;
            }
            
            // Obtener los IDs de circuitos únicos para este año
            const circuitIds = [...new Set(racesByYear.map(race => race.circuitId))];
            
            // Obtener todos los circuitos
            const circuitosResponse = await fetch("http://localhost:3000/circuitos", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!circuitosResponse.ok) {
                throw new Error(`Error HTTP: ${circuitosResponse.status}`);
            }
            
            const allCircuitos = await circuitosResponse.json();
            
            // Filtrar circuitos por IDs
            const circuitosByYear = allCircuitos.filter(circuito => 
                circuitIds.includes(circuito.circuitId)
            );
            
            // Enriquecer los circuitos con información de la carrera
            const enrichedCircuits = circuitosByYear.map(circuito => {
                const race = racesByYear.find(race => race.circuitId === circuito.circuitId);
                return {
                    ...circuito,
                    raceName: race ? race.name : circuito.name,
                    raceDate: race ? race.date : null,
                    round: race ? race.round : null
                };
            });
            
            // Ordenar por ronda
            enrichedCircuits.sort((a, b) => a.round - b.round);
            
            // Limpiar el contenedor
            container.innerHTML = '';
            
            // Renderizar los circuitos
            enrichedCircuits.forEach(circuito => {
                const card = document.createElement("div");
                card.classList.add("col-lg-10", "mb-3");

                // Determinar la categoría basada en el circuitRef
                let categoria = "f1"; // Por defecto
                
                // Puedes personalizar esto según tus datos
                if (circuito.circuitRef.includes("sepang")) {
                    categoria = "motogp";
                } else if (circuito.circuitRef.includes("monte")) {
                    categoria = "wrc";
                }
                
                // Formatear fecha si está disponible
                let dateDisplay = '';
                if (circuito.raceDate) {
                    const date = new Date(circuito.raceDate);
                    dateDisplay = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                }

                card.innerHTML = `
                    <div class="card event-card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2 text-center">
                                    <div class="event-date">
                                        ${circuito.round ? `<span class="badge bg-dark mb-1">Ronda ${circuito.round}</span><br>` : ''}
                                        <i class="bi bi-geo-alt-fill"></i> ${circuito.country}
                                        ${dateDisplay ? `<br><small>${dateDisplay}</small>` : ''}
                                    </div>
                                </div>
                                <div class="col-md-7">
                                    <span class="event-category category-${categoria}">${categoria.toUpperCase()}</span>
                                    <h5 class="event-location mb-0">${circuito.raceName}</h5>
                                    <small>${circuito.location}, ${circuito.country}</small>
                                </div>
                                <div class="col-md-3 text-md-end mt-2 mt-md-0">
                                    <a href="/HTML/eventos/detalleEventos.html?id=${circuito.circuitId}" class="btn btn-sm btn-outline-dark">Detalles</a>
                                    <a href="/HTML/resultados/resultados.html?id=${circuito.circuitId}" class="btn btn-sm btn-motorsport">Resultados</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });
        } catch (error) {
            console.error("Error al cargar los circuitos:", error);
            container.innerHTML = `
                <div class="col-12 text-center my-4">
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los circuitos: ${error.message}
                        <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                    </div>
                    <button class="btn btn-motorsport mt-2" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
    
    // Inicializar: cargar temporadas y circuitos del año actual
    await loadSeasons();
    loadCircuits(currentYear);
    
    // Añadir evento para los filtros de categoría
    document.querySelectorAll('.btn-group .btn').forEach(button => {
        button.addEventListener('click', function() {
            // Quitar la clase active de todos los botones
            document.querySelectorAll('.btn-group .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Añadir la clase active al botón clickeado
            this.classList.add('active');
            
            const category = this.textContent.trim().toLowerCase();
            
            // Filtrar los circuitos por categoría
            if (category === 'todos') {
                document.querySelectorAll('.event-card').forEach(card => {
                    card.parentElement.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.event-card').forEach(card => {
                    const cardCategory = card.querySelector('.event-category').textContent.toLowerCase();
                    if (cardCategory === category) {
                        card.parentElement.style.display = 'block';
                    } else {
                        card.parentElement.style.display = 'none';
                    }
                });
            }
        });
    });
});