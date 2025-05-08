document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("teams-container");
    const searchInput = document.getElementById("team-search");
    const categoryButtons = document.querySelectorAll(".category-btn");
    
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
    
    // Función para determinar la categoría del equipo basado en su nombre o referencia
    function getTeamCategory(team) {
        const name = team.name.toLowerCase();
        const ref = team.constructorRef.toLowerCase();
        
        if (name.includes("ferrari") || name.includes("mercedes") || name.includes("red bull") || 
            name.includes("mclaren") || name.includes("williams") || name.includes("sauber") || 
            ref.includes("ferrari") || ref.includes("mercedes") || ref.includes("redbull") || 
            ref.includes("mclaren") || ref.includes("williams") || ref.includes("sauber")) {
            return "f1";
        } else if (name.includes("honda") || name.includes("yamaha") || name.includes("ducati") || 
                  name.includes("suzuki") || name.includes("aprilia") || 
                  ref.includes("honda") || ref.includes("yamaha") || ref.includes("ducati") || 
                  ref.includes("suzuki") || ref.includes("aprilia")) {
            return "motogp";
        } else if (name.includes("toyota") || name.includes("hyundai") || name.includes("ford") || 
                  name.includes("citroen") || name.includes("subaru") || 
                  ref.includes("toyota") || ref.includes("hyundai") || ref.includes("ford") || 
                  ref.includes("citroen") || ref.includes("subaru")) {
            return "wrc";
        }
        
        // Por defecto, asumimos F1
        return "f1";
    }
    
    // Función para obtener el color de fondo del equipo
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
            return `<i class="bi bi-shield-fill text-danger" style="font-size: 2rem;"></i>`;
        } else if (name.includes("mercedes") || ref.includes("mercedes")) {
            return `<i class="bi bi-star-fill text-info" style="font-size: 2rem;"></i>`;
        } else if (name.includes("red bull") || ref.includes("redbull")) {
            return `<i class="bi bi-lightning-fill text-primary" style="font-size: 2rem;"></i>`;
        } else if (name.includes("mclaren") || ref.includes("mclaren")) {
            return `<i class="bi bi-speedometer2 text-warning" style="font-size: 2rem;"></i>`;
        } else if (name.includes("williams") || ref.includes("williams")) {
            return `<i class="bi bi-trophy-fill text-primary" style="font-size: 2rem;"></i>`;
        } else if (name.includes("alpine") || ref.includes("alpine")) {
            return `<i class="bi bi-diamond-fill text-info" style="font-size: 2rem;"></i>`;
        } else if (name.includes("aston martin") || ref.includes("aston")) {
            return `<i class="bi bi-suit-heart-fill text-success" style="font-size: 2rem;"></i>`;
        } else {
            return `<i class="bi bi-car-front-fill" style="font-size: 2rem;"></i>`;
        }
    }
    
    try {
        // Realizar múltiples peticiones en paralelo
        const [constructorsResponse, constructorStandingsResponse, constructorResultsResponse] = await Promise.all([
            fetch("http://localhost:3000/constructors"),
            fetch("http://localhost:3000/constructorStandings"),
            fetch("http://localhost:3000/constructorResults")
        ]);
        
        // Verificar si alguna petición falló
        if (!constructorsResponse.ok || !constructorStandingsResponse.ok || !constructorResultsResponse.ok) {
            throw new Error("Error al obtener datos de los equipos");
        }
        
        // Obtener los datos
        const constructors = await constructorsResponse.json();
        const constructorStandings = await constructorStandingsResponse.json();
        const constructorResults = await constructorResultsResponse.json();
        
        // Calcular estadísticas para cada constructor
        const teamStats = {};
        
        // Inicializar estadísticas
        constructors.forEach(constructor => {
            teamStats[constructor.constructorId] = {
                totalPoints: 0,
                totalWins: 0,
                bestPosition: 999,
                races: 0
            };
        });
        
        // Sumar puntos de constructorResults
        constructorResults.forEach(result => {
            if (teamStats[result.constructorId]) {
                teamStats[result.constructorId].totalPoints += parseFloat(result.points);
                teamStats[result.constructorId].races += 1;
            }
        });
        
        // Obtener victorias y mejor posición de constructorStandings
        constructorStandings.forEach(standing => {
            if (teamStats[standing.constructorId]) {
                teamStats[standing.constructorId].totalWins += parseInt(standing.wins);
                
                const position = parseInt(standing.position);
                if (position < teamStats[standing.constructorId].bestPosition) {
                    teamStats[standing.constructorId].bestPosition = position;
                }
            }
        });
        
        // Limpiar el contenedor
        container.innerHTML = '';
        
        // Generar HTML para cada constructor
        constructors.forEach(constructor => {
            const stats = teamStats[constructor.constructorId];
            const category = getTeamCategory(constructor);
            const teamColor = getTeamColor(constructor);
            const teamLogo = getTeamLogo(constructor);
            
            // Crear elemento para el equipo
            const teamElement = document.createElement("div");
            teamElement.classList.add("col-md-6", "col-lg-4", "team-item");
            teamElement.setAttribute("data-category", category);
            teamElement.setAttribute("data-name", constructor.name.toLowerCase());
            
            teamElement.innerHTML = `
                <div class="team-card">
                    <div class="team-header" style="background-color: ${teamColor}">
                        <div class="team-logo">
                            ${teamLogo}
                        </div>
                        <img src="${getFlagEmoji(constructor.nationality)}" alt="${constructor.nationality}" class="team-flag">
                    </div>
                    <div class="team-content">
                        <h4 class="team-name">${constructor.name}</h4>
                        <div class="team-nationality">
                            <i class="bi bi-globe"></i> ${constructor.nationality}
                        </div>
                        <div class="team-stats">
                            <div class="stat-item">
                                <div class="stat-value">${stats.totalPoints.toFixed(0)}</div>
                                <div class="stat-label">PUNTOS</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.totalWins}</div>
                                <div class="stat-label">VICTORIAS</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.bestPosition === 999 ? 'N/A' : stats.bestPosition}</div>
                                <div class="stat-label">MEJOR POS.</div>
                            </div>
                        </div>
                        <div class="mt-3 text-center">
                            <a href="equipo.html?id=${constructor.constructorId}" class="btn btn-sm btn-outline-dark">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(teamElement);
        });
        
        // Implementar búsqueda
        searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            
            document.querySelectorAll(".team-item").forEach(item => {
                const teamName = item.getAttribute("data-name");
                const isVisible = teamName.includes(searchTerm);
                
                item.style.display = isVisible ? "block" : "none";
            });
        });
        
        // Implementar filtro por categoría
        categoryButtons.forEach(button => {
            button.addEventListener("click", function() {
                // Actualizar botón activo
                categoryButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                
                const category = this.getAttribute("data-category");
                
                document.querySelectorAll(".team-item").forEach(item => {
                    if (category === "all") {
                        item.style.display = "block";
                    } else {
                        const itemCategory = item.getAttribute("data-category");
                        item.style.display = itemCategory === category ? "block" : "none";
                    }
                });
            });
        });
        
    } catch (error) {
        console.error("Error al cargar los equipos:", error);
        container.innerHTML = `
            <div class="col-12 text-center my-4">
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar los equipos: ${error.message}
                    <p class="mt-2 small">Asegúrate de que el servidor API esté funcionando en http://localhost:3000</p>
                </div>
                <button class="btn btn-motorsport mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise"></i> Reintentar
                </button>
            </div>
        `;
    }
});