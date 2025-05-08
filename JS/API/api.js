import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { url } from 'inspector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo JSON directamente
const circuitosRaw = fs.readFileSync(path.join(__dirname, 'circuito.json'), 'utf8');
const circuitos = JSON.parse(circuitosRaw);

const driversRaw = fs.readFileSync(path.join(__dirname, 'drivers.json'), 'utf8');
const drivers = JSON.parse(driversRaw);

const racesRaw = fs.readFileSync(path.join(__dirname, 'races.json'), 'utf8');
const races = JSON.parse(racesRaw);

const resultsRaw = fs.readFileSync(path.join(__dirname, 'results.json'), 'utf8');
const results = JSON.parse(resultsRaw);

const seasonsRaw = fs.readFileSync(path.join(__dirname, 'seasons.json'), 'utf8');
const seasons = JSON.parse(seasonsRaw);

const statusRaw = fs.readFileSync(path.join(__dirname, 'status.json'), 'utf8');
const status = JSON.parse(statusRaw);

const sprint_resultsRaw = fs.readFileSync(path.join(__dirname, 'sprint_results.json'), 'utf8');
const sprint_results = JSON.parse(sprint_resultsRaw);

const qualifyingRaw = fs.readFileSync(path.join(__dirname, 'qualyfing.json'), 'utf8');
const qualifying = JSON.parse(qualifyingRaw);

const lap_timesRaw = fs.readFileSync(path.join(__dirname, 'laptimes.json'), 'utf8');
const lap_times = JSON.parse(lap_timesRaw);

const pitstopsRaw = fs.readFileSync(path.join(__dirname, 'pitstops.json'), 'utf8');
const pitstops = JSON.parse(pitstopsRaw);

const driverStandingsRaw = fs.readFileSync(path.join(__dirname, 'driverStandings.json'), 'utf8');
const driverStandings = JSON.parse(driverStandingsRaw);

const constructorStandingsRaw = fs.readFileSync(path.join(__dirname, 'constructorStandings.json'), 'utf8');
const constructorStandings = JSON.parse(constructorStandingsRaw);

const constructorRaw = fs.readFileSync(path.join(__dirname, 'constructors.json'), 'utf8');
const constructors = JSON.parse(constructorRaw);

const constructorResultsRaw = fs.readFileSync(path.join(__dirname, 'constructorResults.json'), 'utf8');
const constructorResults = JSON.parse(constructorResultsRaw);

const app = express();
const PORT = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());
app.use(express.json());

// Función para guardar datos en un archivo JSON
function saveDataToFile(data, filename) {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Ruta para obtener todos los circuitos
app.get('/circuitos', (req, res) => {
    res.json(circuitos);
});

// Ruta para obtener todos los pilotos
app.get('/drivers', (req, res) => {
    res.json(drivers);
});

// Ruta para crear un nuevo piloto
app.post('/drivers', (req, res) => {
    try {
        const newDriver = req.body;
        
        // Validar datos requeridos
        if (!newDriver.driverRef || !newDriver.code || !newDriver.forename || !newDriver.surname || !newDriver.nationality) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }
        
        // Verificar si ya existe un piloto con el mismo driverRef o código
        const existingDriver = drivers.find(d => 
            d.driverRef === newDriver.driverRef || d.code === newDriver.code
        );
        
        if (existingDriver) {
            return res.status(409).json({ message: 'Ya existe un piloto con esa referencia o código' });
        }
        
        // Añadir el nuevo piloto al array
        drivers.push(newDriver);
        
        // Guardar los cambios en el archivo JSON
        saveDataToFile(drivers, 'drivers.json');
        
        res.status(201).json(newDriver);
    } catch (error) {
        console.error('Error al crear piloto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// NUEVA RUTA: Actualizar un piloto existente
app.put('/drivers/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedDriver = req.body;
        
        // Validar datos requeridos
        if (!updatedDriver.driverRef || !updatedDriver.code || !updatedDriver.forename || !updatedDriver.surname || !updatedDriver.nationality) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }
        
        // Encontrar el índice del piloto a actualizar
        const driverIndex = drivers.findIndex(d => d.driverId === id);
        
        if (driverIndex === -1) {
            return res.status(404).json({ message: 'Piloto no encontrado' });
        }
        
        // Verificar si ya existe otro piloto con el mismo driverRef o código
        const existingDriver = drivers.find(d => 
            (d.driverRef === updatedDriver.driverRef || d.code === updatedDriver.code) && 
            d.driverId !== id
        );
        
        if (existingDriver) {
            return res.status(409).json({ message: 'Ya existe otro piloto con esa referencia o código' });
        }
        
        // Actualizar el piloto
        drivers[driverIndex] = {
            ...drivers[driverIndex],
            ...updatedDriver
        };
        
        // Guardar los cambios en el archivo JSON
        saveDataToFile(drivers, 'drivers.json');
        
        res.json(drivers[driverIndex]);
    } catch (error) {
        console.error('Error al actualizar piloto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// NUEVA RUTA: Actualizar las estadísticas de un piloto
app.put("/drivers/:id/stats", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const statsData = req.body

    console.log("Recibiendo actualización de estadísticas para piloto ID:", id)
    console.log("Datos recibidos:", statsData)

    // Verificar si el piloto existe
    const driver = drivers.find((d) => d.driverId === id)

    if (!driver) {
      return res.status(404).json({ message: "Piloto no encontrado" })
    }

    // Crear o actualizar un objeto de estadísticas para el piloto
    // Este objeto se guardará en memoria y se usará para responder a futuras solicitudes
    if (!global.driverStats) {
      global.driverStats = {}
    }

    // Guardar las estadísticas actualizadas
    global.driverStats[id] = {
      wins: statsData.wins || 0,
      podiums: statsData.podiums || 0,
      points: statsData.points || 0,
      polePositions: statsData.polePositions || 0,
      fastestLaps: statsData.fastestLaps || 0,
      totalRaces: statsData.totalRaces || 0,
      bestChampionshipPosition: statsData.bestChampionshipPosition || 0,
    }

    console.log("Estadísticas guardadas:", global.driverStats[id])

    // Actualizar driverStandings si es necesario
    if (statsData.position) {
      // Buscar el último standing del piloto
      const driverStandingsArray = driverStandings.filter((ds) => ds.driverId === id)

      if (driverStandingsArray.length > 0) {
        // Ordenar por raceId (más reciente primero)
        driverStandingsArray.sort((a, b) => b.raceId - a.raceId)
        const latestStanding = driverStandingsArray[0]

        // Actualizar el standing
        const standingIndex = driverStandings.findIndex(
          (ds) => ds.driverStandingsId === latestStanding.driverStandingsId,
        )

        if (standingIndex !== -1) {
          driverStandings[standingIndex] = {
            ...driverStandings[standingIndex],
            position: statsData.position,
            positionText: statsData.position.toString(),
            points: statsData.points || driverStandings[standingIndex].points,
            wins: statsData.wins || driverStandings[standingIndex].wins,
          }

          // Guardar los cambios en el archivo JSON
          saveDataToFile(driverStandings, "driverStandings.json")
          console.log("Driver standings actualizados")
        }
      } else {
        // Crear un nuevo standing si no existe
        const newStandingId = Math.max(...driverStandings.map((ds) => ds.driverStandingsId)) + 1
        const latestRaceId = Math.max(...races.map((r) => r.raceId))

        const newStanding = {
          driverStandingsId: newStandingId,
          raceId: latestRaceId,
          driverId: id,
          points: statsData.points || 0,
          position: statsData.position,
          positionText: statsData.position.toString(),
          wins: statsData.wins || 0,
        }

        driverStandings.push(newStanding)
        saveDataToFile(driverStandings, "driverStandings.json")
        console.log("Nuevo driver standing creado")
      }
    }

    // Actualizar el constructor del piloto si es necesario
    if (statsData.constructorId) {
      // Verificar si el constructor existe
      const constructor = constructors.find((c) => c.constructorId === statsData.constructorId)

      if (!constructor) {
        return res.status(404).json({ message: "Constructor no encontrado" })
      }

      // Buscar el último resultado del piloto
      const driverResults = results.filter((r) => r.driverId === id)

      if (driverResults.length > 0) {
        // Ordenar por raceId (más reciente primero)
        driverResults.sort((a, b) => b.raceId - a.raceId)
        const latestResult = driverResults[0]

        // Actualizar el resultado
        const resultIndex = results.findIndex((r) => r.resultId === latestResult.resultId)

        if (resultIndex !== -1) {
          results[resultIndex] = {
            ...results[resultIndex],
            constructorId: statsData.constructorId,
          }

          // Guardar los cambios en el archivo JSON
          saveDataToFile(results, "results.json")
          console.log("Constructor actualizado en results")
        }
      }
    }

    // Guardar las estadísticas en un archivo JSON separado para persistencia
    try {
      let allStats = {}
      const statsFilePath = path.join(__dirname, "driverStats.json")

      // Intentar leer el archivo existente
      if (fs.existsSync(statsFilePath)) {
        const statsFileContent = fs.readFileSync(statsFilePath, "utf8")
        allStats = JSON.parse(statsFileContent)
      }

      // Actualizar las estadísticas del piloto
      allStats[id] = global.driverStats[id]

      // Guardar el archivo
      fs.writeFileSync(statsFilePath, JSON.stringify(allStats, null, 2), "utf8")
      console.log("Estadísticas guardadas en archivo")
    } catch (fileError) {
      console.error("Error al guardar estadísticas en archivo:", fileError)
      // No interrumpimos la ejecución, solo registramos el error
    }

    res.json({
      message: "Estadísticas actualizadas con éxito",
      stats: global.driverStats[id],
    })
  } catch (error) {
    console.error("Error al actualizar estadísticas:", error)
    res.status(500).json({ message: "Error interno del servidor", error: error.message })
  }
}) 

// NUEVA RUTA: Obtener estadísticas de un piloto por ID
app.get("/drivers/:id/stats", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)

    // Verificar si el piloto existe
    const driver = drivers.find((d) => d.driverId === id)

    if (!driver) {
      return res.status(404).json({ message: "Piloto no encontrado" })
    }

    // Comprobar si tenemos estadísticas guardadas para este piloto
    if (global.driverStats && global.driverStats[id]) {
      console.log("Devolviendo estadísticas guardadas para piloto ID:", id)
      return res.json(global.driverStats[id])
    }

    // Intentar cargar estadísticas desde el archivo
    try {
      const statsFilePath = path.join(__dirname, "driverStats.json")
      if (fs.existsSync(statsFilePath)) {
        const statsFileContent = fs.readFileSync(statsFilePath, "utf8")
        const allStats = JSON.parse(statsFileContent)

        if (allStats[id]) {
          console.log("Devolviendo estadísticas desde archivo para piloto ID:", id)

          // Guardar en memoria para futuras solicitudes
          if (!global.driverStats) {
            global.driverStats = {}
          }
          global.driverStats[id] = allStats[id]

          return res.json(allStats[id])
        }
      }
    } catch (fileError) {
      console.error("Error al leer estadísticas desde archivo:", fileError)
      // Continuamos con el cálculo de estadísticas
    }

    // Si no hay estadísticas guardadas, calcularlas desde los resultados
    console.log("Calculando estadísticas para piloto ID:", id)

    // Obtener resultados del piloto
    const driverResults = results.filter((r) => r.driverId === id)

    // Obtener clasificaciones del piloto
    const driverStandingsData = driverStandings.filter((ds) => ds.driverId === id)

    // Calcular estadísticas
    const wins = driverResults.filter((r) => r.position === 1 || r.position === "1").length
    const podiums = driverResults.filter(
      (r) =>
        r.position === 1 ||
        r.position === "1" ||
        r.position === 2 ||
        r.position === "2" ||
        r.position === 3 ||
        r.position === "3",
    ).length
    const totalRaces = driverResults.length
    const points = driverResults.reduce((total, result) => total + Number.parseFloat(result.points || 0), 0)
    const polePositions = driverResults.filter((r) => r.grid === 1 || r.grid === "1").length
    const fastestLaps = driverResults.filter((r) => r.rank === 1 || r.rank === "1").length

    // Obtener mejor posición en campeonato
    let bestChampionshipPosition = 999
    if (driverStandingsData.length > 0) {
      bestChampionshipPosition = Math.min(...driverStandingsData.map((ds) => Number.parseInt(ds.position)))
    }

    const stats = {
      totalRaces,
      wins,
      podiums,
      points,
      polePositions,
      fastestLaps,
      bestChampionshipPosition: bestChampionshipPosition === 999 ? "N/A" : bestChampionshipPosition,
    }

    // Guardar en memoria para futuras solicitudes
    if (!global.driverStats) {
      global.driverStats = {}
    }
    global.driverStats[id] = stats

    // Guardar en archivo
    try {
      let allStats = {}
      const statsFilePath = path.join(__dirname, "driverStats.json")

      // Intentar leer el archivo existente
      if (fs.existsSync(statsFilePath)) {
        const statsFileContent = fs.readFileSync(statsFilePath, "utf8")
        allStats = JSON.parse(statsFileContent)
      }

      // Actualizar las estadísticas del piloto
      allStats[id] = stats

      // Guardar el archivo
      fs.writeFileSync(statsFilePath, JSON.stringify(allStats, null, 2), "utf8")
    } catch (fileError) {
      console.error("Error al guardar estadísticas en archivo:", fileError)
      // No interrumpimos la ejecución, solo registramos el error
    }

    res.json(stats)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({ message: "Error interno del servidor", error: error.message })
  }
})

// Ruta para crear una nueva temporada
app.post("/seasons", (req, res) => {
  try {
    const newSeason = req.body

    // Validar datos requeridos
    if (!newSeason.year) {
      return res.status(400).json({ message: "El año es obligatorio" })
    }

    // Verificar si ya existe una temporada con el mismo año
    const existingSeason = seasons.find((s) => s.year === newSeason.year)

    if (existingSeason) {
      return res.status(409).json({ message: "Ya existe una temporada para ese año" })
    }

    // Añadir la nueva temporada al array
    seasons.push(newSeason)

    // Guardar los cambios en el archivo JSON
    saveDataToFile(seasons, "seasons.json")

    res.status(201).json(newSeason)
  } catch (error) {
    console.error("Error al crear temporada:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para obtener una temporada por año
app.get("/seasons/:year", (req, res) => {
  const year = Number.parseInt(req.params.year)
  const season = seasons.find((s) => s.year === year)

  if (season) {
    res.json(season)
  } else {
    res.status(404).json({ message: "Temporada no encontrada" })
  }
})

// Ruta para crear una nueva carrera
app.post("/races", (req, res) => {
  try {
    const newRace = req.body

    // Validar datos requeridos
    if (!newRace.year || !newRace.round || !newRace.circuitId || !newRace.name || !newRace.date) {
      return res.status(400).json({ message: "Faltan campos obligatorios" })
    }

    // Verificar si ya existe una carrera con el mismo año y ronda
    const existingRace = races.find((r) => r.year === newRace.year && r.round === newRace.round)

    if (existingRace) {
      return res.status(409).json({ message: "Ya existe una carrera con esa ronda para ese año" })
    }

    // Generar un nuevo ID para la carrera
    const maxRaceId = Math.max(...races.map((r) => r.raceId), 0)
    newRace.raceId = maxRaceId + 1

    // Añadir campos adicionales si no están presentes
    if (!newRace.time) newRace.time = "00:00:00"
    if (!newRace.url) newRace.url = ""

    // Añadir campos para prácticas, clasificación y sprint (si es necesario)
    newRace.fp1_date = newRace.fp1_date || "\\N"
    newRace.fp1_time = newRace.fp1_time || "\\N"
    newRace.fp2_date = newRace.fp2_date || "\\N"
    newRace.fp2_time = newRace.fp2_time || "\\N"
    newRace.fp3_date = newRace.fp3_date || "\\N"
    newRace.fp3_time = newRace.fp3_time || "\\N"
    newRace.quali_date = newRace.quali_date || "\\N"
    newRace.quali_time = newRace.quali_time || "\\N"
    newRace.sprint_date = newRace.sprint_date || "\\N"
    newRace.sprint_time = newRace.sprint_time || "\\N"

    // Añadir la nueva carrera al array
    races.push(newRace)

    // Guardar los cambios en el archivo JSON
    saveDataToFile(races, "races.json")

    res.status(201).json(newRace)
  } catch (error) {
    console.error("Error al crear carrera:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para obtener carreras por año
app.get("/races/season/:year", (req, res) => {
  const year = Number.parseInt(req.params.year)
  const seasonRaces = races.filter((r) => r.year === year)

  // Ordenar por ronda
  seasonRaces.sort((a, b) => a.round - b.round)

  // Enriquecer con información de circuitos
  const enrichedRaces = seasonRaces.map((race) => {
    const circuit = circuitos.find((c) => c.circuitId === race.circuitId)
    return {
      ...race,
      circuit: circuit
        ? {
            name: circuit.name,
            location: circuit.location,
            country: circuit.country,
          }
        : null,
    }
  })

  res.json(enrichedRaces)
}) 

// Ruta para obtener una carrera por ID
app.get("/races/:id", (req, res) => {
  const id = Number.parseInt(req.params.id)
  const race = races.find((r) => r.raceId === id)

  if (race) {
    res.json(race)
  } else {
    res.status(404).json({ message: "Carrera no encontrada" })
  }
})

// Ruta para actualizar una carrera existente
app.put("/races/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const updatedRace = req.body

    // Encontrar el índice de la carrera a actualizar
    const raceIndex = races.findIndex((r) => r.raceId === id)

    if (raceIndex === -1) {
      return res.status(404).json({ message: "Carrera no encontrada" })
    }

    // Actualizar la carrera
    races[raceIndex] = {
      ...races[raceIndex],
      ...updatedRace,
    }

    // Guardar los cambios en el archivo JSON
    saveDataToFile(races, "races.json")

    res.json(races[raceIndex])
  } catch (error) {
    console.error("Error al actualizar carrera:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para obtener todos los resultados
app.get('/results', (req, res) => {
    // Filtrar por driverId si se proporciona
    if (req.query.driverId) {
        const driverId = parseInt(req.query.driverId);
        const filteredResults = results.filter(r => r.driverId === driverId);
        
        // Enriquecer con información de carreras
        const enrichedResults = filteredResults.map(result => {
            const race = races.find(r => r.raceId === result.raceId);
            return {
                ...result,
                raceName: race ? race.name : null,
                date: race ? race.date : null,
                year: race ? race.year : null
            };
        });
        
        return res.json(enrichedResults);
    }
    
    res.json(results);
}); 


// Ruta para actualizar un resultado existente
app.put("/results/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const updatedResult = req.body

    // Encontrar el índice del resultado a actualizar
    const resultIndex = results.findIndex((r) => r.resultId === id)

    if (resultIndex === -1) {
      return res.status(404).json({ message: "Resultado no encontrado" })
    }

    // Actualizar el resultado
    results[resultIndex] = {
      ...results[resultIndex],
      ...updatedResult,
    }

    // Guardar los cambios en el archivo JSON
    saveDataToFile(results, "results.json")

    res.json(results[resultIndex])
  } catch (error) {
    console.error("Error al actualizar resultado:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para obtener todas las carreras
app.get('/races', (req, res) => {
    res.json(races);
}); 

// Ruta para obtener todas las temporadas
app.get('/seasons', (req, res) => {
    res.json(seasons);
}); 

// Ruta para obtener todos los estados
app.get('/status', (req, res) => {
    res.json(status);
}); 

// Ruta para obtener todos los resultados de las carreras sprint
app.get('/sprint_results', (req, res) => {
    res.json(sprint_results);
}); 

// Ruta para obtener todas las clasificaciones
app.get('/qualifying', (req, res) => {
    res.json(qualifying);
});

// Ruta para obtener todos los tiempos de carrera    
app.get('/lap_times', (req, res) => {
    res.json(lap_times);
}); 

// Ruta para obtener todas las paradas en boxes
app.get('/pitstops', (req, res) => {
    res.json(pitstops);
}); 

// Ruta para obtener todas las clasificaciones de pilotos
app.get('/driverStandings', (req, res) => {
    // Filtrar por driverId si se proporciona
    if (req.query.driverId) {
        const driverId = parseInt(req.query.driverId);
        const filteredStandings = driverStandings.filter(ds => ds.driverId === driverId);
        return res.json(filteredStandings);
    }
    
    res.json(driverStandings);
});

// Ruta para obtener todas las clasificaciones de constructores
app.get('/constructorStandings', (req, res) => {
    res.json(constructorStandings);
});

// Ruta para obtener todos los constructores
app.get('/constructors', (req, res) => {
    res.json(constructors);
}); 

// Ruta para obtener todos los resultados de los constructores
app.get('/constructorResults', (req, res) => {
    res.json(constructorResults);
}); 

// Ruta para obtener un circuito por ID
app.get('/circuitos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const circuito = circuitos.find(c => c.circuitId === id);

    if (circuito) {
        res.json(circuito);
    } else {
        res.status(404).json({ message: 'Circuito no encontrado' });
    }
});

app.get('/constructors/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const constructor = constructors.find(c => c.constructorId === id);

    if (constructor) {
        res.json(constructor);
    } else {
        res.status(404).json({ message: 'Constructor no encontrado' });
    }
});

// NUEVA RUTA: Obtener un piloto por ID
app.get('/drivers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const driver = drivers.find(d => d.driverId === id);

    if (driver) {
        res.json(driver);
    } else {
        res.status(404).json({ message: 'Piloto no encontrado' });
    }
});

// NUEVA RUTA: Obtener resultados recientes de un piloto por ID
app.get('/drivers/:id/results', (req, res) => {
    const id = parseInt(req.params.id);
    
    // Obtener resultados del piloto
    const driverResults = results.filter(r => r.driverId === id);
    
    // Obtener información de las carreras
    const raceResults = driverResults.map(result => {
        const race = races.find(r => r.raceId === result.raceId);
        return {
            raceId: race.raceId,
            raceName: race.name,
            date: race.date,
            year: race.year,
            position: result.position,
            grid: result.grid,
            points: result.points,
            laps: result.laps,
            time: result.time,
            fastestLapTime: result.fastestLapTime
        };
    });
    
    // Ordenar por fecha (más reciente primero)
    raceResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(raceResults);
});


// Ruta para crear una nueva carrera
app.post("/races", (req, res) => {
  try {
    const newRace = req.body

    // Validar datos requeridos
    if (!newRace.year || !newRace.round || !newRace.circuitId || !newRace.name || !newRace.date) {
      return res.status(400).json({ message: "Faltan campos obligatorios" })
    }

    // Verificar si ya existe una carrera con el mismo año y ronda
    const existingRace = races.find((r) => r.year === newRace.year && r.round === newRace.round)

    if (existingRace) {
      return res.status(409).json({ message: "Ya existe una carrera con esa ronda para ese año" })
    }

    // Generar un nuevo ID para la carrera
    const maxRaceId = Math.max(...races.map((r) => r.raceId), 0)
    newRace.raceId = maxRaceId + 1

    // Añadir campos adicionales si no están presentes
    if (!newRace.time) newRace.time = "00:00:00"
    if (!newRace.url) newRace.url = ""

    // Añadir campos para prácticas, clasificación y sprint (si es necesario)
    newRace.fp1_date = newRace.fp1_date || "\\N"
    newRace.fp1_time = newRace.fp1_time || "\\N"
    newRace.fp2_date = newRace.fp2_date || "\\N"
    newRace.fp2_time = newRace.fp2_time || "\\N"
    newRace.fp3_date = newRace.fp3_date || "\\N"
    newRace.fp3_time = newRace.fp3_time || "\\N"
    newRace.quali_date = newRace.quali_date || "\\N"
    newRace.quali_time = newRace.quali_time || "\\N"
    newRace.sprint_date = newRace.sprint_date || "\\N"
    newRace.sprint_time = newRace.sprint_time || "\\N"

    // Añadir la nueva carrera al array
    races.push(newRace)

    // Guardar los cambios en el archivo JSON
    saveDataToFile(races, "races.json")

    res.status(201).json(newRace)
  } catch (error) {
    console.error("Error al crear carrera:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para crear un nuevo circuito
app.post("/circuitos", (req, res) => {
  try {
    const newCircuit = req.body

    // Validar datos requeridos
    if (
      !newCircuit.name ||
      !newCircuit.circuitRef ||
      !newCircuit.location ||
      !newCircuit.country ||
      !newCircuit.lat ||
      !newCircuit.lng
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" })
    }

    // Verificar si ya existe un circuito con la misma referencia
    const existingCircuit = circuitos.find((c) => c.circuitRef === newCircuit.circuitRef)

    if (existingCircuit) {
      return res.status(409).json({ message: "Ya existe un circuito con esa referencia" })
    }

    // Generar un nuevo ID para el circuito
    const maxCircuitId = Math.max(...circuitos.map((c) => c.circuitId), 0)
    newCircuit.circuitId = maxCircuitId + 1

    // Convertir coordenadas a números
    newCircuit.lat = Number.parseFloat(newCircuit.lat)
    newCircuit.lng = Number.parseFloat(newCircuit.lng)
    newCircuit.alt = Number.parseFloat(newCircuit.alt) || 0

    // Añadir el nuevo circuito al array
    circuitos.push(newCircuit)

    // Guardar los cambios en el archivo JSON
    saveDataToFile(circuitos, "circuito.json")

    res.status(201).json(newCircuit)
  } catch (error) {
    console.error("Error al crear circuito:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para actualizar un circuito existente
app.put("/circuitos/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const updatedCircuit = req.body

    // Validar datos requeridos
    if (
      !updatedCircuit.name ||
      !updatedCircuit.circuitRef ||
      !updatedCircuit.location ||
      !updatedCircuit.country ||
      !updatedCircuit.lat ||
      !updatedCircuit.lng
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" })
    }

    // Encontrar el índice del circuito a actualizar
    const circuitIndex = circuitos.findIndex((c) => c.circuitId === id)

    if (circuitIndex === -1) {
      return res.status(404).json({ message: "Circuito no encontrado" })
    }

    // Verificar si ya existe otro circuito con la misma referencia
    const existingCircuit = circuitos.find((c) => c.circuitRef === updatedCircuit.circuitRef && c.circuitId !== id)

    if (existingCircuit) {
      return res.status(409).json({ message: "Ya existe otro circuito con esa referencia" })
    }

    // Convertir coordenadas a números
    updatedCircuit.lat = Number.parseFloat(updatedCircuit.lat)
    updatedCircuit.lng = Number.parseFloat(updatedCircuit.lng)
    updatedCircuit.alt = Number.parseFloat(updatedCircuit.alt) || 0

    // Actualizar el circuito
    circuitos[circuitIndex] = {
      ...circuitos[circuitIndex],
      ...updatedCircuit,
    }

    // Guardar los cambios en el archivo JSON
    saveDataToFile(circuitos, "circuito.json")

    res.json(circuitos[circuitIndex])
  } catch (error) {
    console.error("Error al actualizar circuito:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta para obtener detalles técnicos de un circuito
app.get("/circuitos/:id/details", (req, res) => {
  const id = Number.parseInt(req.params.id)
  const circuit = circuitos.find((c) => c.circuitId === id)

  if (!circuit) {
    return res.status(404).json({ message: "Circuito no encontrado" })
  }

  // Obtener carreras asociadas a este circuito
  const circuitRaces = races.filter((r) => r.circuitId === id)

  // Calcular estadísticas
  const totalRaces = circuitRaces.length
  const years = [...new Set(circuitRaces.map((r) => r.year))]

  // Crear objeto con detalles técnicos
  const details = {
    circuitId: circuit.circuitId,
    name: circuit.name,
    location: circuit.location,
    lat: circuit.lat,
    lng: circuit.lng,
    alt: circuit.alt,
    circuitRef: circuit.circuitRef,
    url: circuit.url,
    
    country: circuit.country,
    totalRaces,
    years,
    // Detalles técnicos (si existen en el objeto del circuito)
    length: circuit.length || null,
    turns: circuit.turns || null,
    drsZones: circuit.drsZones || null,
    maxSpeed: circuit.maxSpeed || null,
    capacity: circuit.capacity || null,
    inauguratedYear: circuit.inauguratedYear || null,
    lapRecord: circuit.lapRecord || null,
    lapRecordHolder: circuit.lapRecordHolder || null,
    description: circuit.description || null,
    category: circuit.category || "F1",
    // Multimedia
    circuitLayout: circuit.circuitLayout || null,
    heroImage: circuit.heroImage || null,
    videoUrl: circuit.videoUrl || null,
  }

  res.json(details)
})

// Añadir una ruta para obtener datos de clasificación filtrados por raceId
app.get("/qualifying", (req, res) => {
  // Filtrar por raceId si se proporciona
  if (req.query.raceId) {
    const raceId = Number.parseInt(req.query.raceId)
    const filteredQualifying = qualifying.filter((q) => q.raceId === raceId)
    return res.json(filteredQualifying)
  }

  res.json(qualifying)
})

// Ruta para obtener una clasificación por ID
app.get('/qualifying/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quali = qualifying.find(q => q.qualifyingId === id);

  if (quali) {
      res.json(quali);
  } else {
      res.status(404).json({ message: 'Clasificación no encontrada' });
  }
});

// Ruta para actualizar una clasificación existente
app.put('/qualifying/:id', (req, res) => {
  try {
      const id = parseInt(req.params.id);
      const updatedQualifying = req.body;
      
      // Encontrar el índice de la clasificación a actualizar
      const qualifyingIndex = qualifying.findIndex(q => q.qualifyingId === id);
      
      if (qualifyingIndex === -1) {
          return res.status(404).json({ message: 'Clasificación no encontrada' });
      }
      
      // Actualizar la clasificación
      qualifying[qualifyingIndex] = {
          ...qualifying[qualifyingIndex],
          ...updatedQualifying
      };
      
      // Guardar los cambios en el archivo JSON
      saveDataToFile(qualifying, 'qualyfing.json');
      
      res.json(qualifying[qualifyingIndex]);
  } catch (error) {
      console.error('Error al actualizar clasificación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para crear una nueva clasificación
app.post('/qualifying', (req, res) => {
  try {
      const newQualifying = req.body;
      
      // Validar datos requeridos
      if (!newQualifying.raceId || !newQualifying.driverId || !newQualifying.constructorId || !newQualifying.position) {
          return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }
      
      // Generar un nuevo ID para la clasificación
      const maxQualifyingId = Math.max(...qualifying.map(q => q.qualifyingId), 0);
      newQualifying.qualifyingId = maxQualifyingId + 1;
      
      // Añadir la nueva clasificación al array
      qualifying.push(newQualifying);
      
      // Guardar los cambios en el archivo JSON
      saveDataToFile(qualifying, 'qualyfing.json');
      
      res.status(201).json(newQualifying);
  } catch (error) {
      console.error('Error al crear clasificación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});