// Servidor estático para MotorsportLIVE Frontend
import express from "express"
import path from "path"
import { fileURLToPath } from "url"

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear aplicación Express
const app = express()

// Configurar archivos estáticos - servir desde la raíz del proyecto
const staticPath = path.join(__dirname, "..")
app.use(express.static(staticPath))

// Ruta principal - servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"))
})

// Rutas para servir archivos HTML específicos
app.get("/HTML/*", (req, res) => {
  const filePath = path.join(__dirname, "..", req.path)
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Archivo HTML no encontrado")
    }
  })
})

// Rutas para servir archivos CSS
app.get("/CSS/*", (req, res) => {
  const filePath = path.join(__dirname, "..", req.path)
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Archivo CSS no encontrado")
    }
  })
})

// Rutas para servir archivos JavaScript
app.get("/JS/*", (req, res) => {
  const filePath = path.join(__dirname, "..", req.path)
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Archivo JS no encontrado")
    }
  })
})

// Manejo de errores 404 personalizado
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Página no encontrada | MotorsportLIVE</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            :root {
                --motorsport-red: #e10600;
            }
            .btn-motorsport {
                background-color: var(--motorsport-red);
                color: white;
                border: none;
            }
            .btn-motorsport:hover {
                background-color: #c10500;
                color: white;
            }
        </style>
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 text-center">
                    <h1 class="display-1 text-danger">404</h1>
                    <h2>Página no encontrada</h2>
                    <p class="lead">La página que buscas no existe en MotorsportLIVE.</p>
                    <a href="/" class="btn btn-motorsport">
                        <i class="bi bi-house-fill"></i> Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Puerto del servidor
const PORT = process.env.PORT || 3000

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🏁 MotorsportLIVE Frontend servidor iniciado`)
  console.log(`🌐 Disponible en: http://localhost:${PORT}`)
  console.log(`📁 Sirviendo archivos desde: ${staticPath}`)
  console.log(`🚀 Listo para desarrollo frontend`)
})

export default app
