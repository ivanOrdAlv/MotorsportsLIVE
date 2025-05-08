import editorService from './services/editorService.js'
import authService from './services/authService.js'
import * as bootstrap from 'bootstrap'

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si el usuario es administrador
  if (!authService.tieneRol('administrador')) {
    window.location.href = '/HTML/auth/login.html'
    return
  }
  
  // Cargar datos iniciales
  cargarEstadisticas()
  
  // Event listeners
  document.getElementById('crearEditorForm').addEventListener('submit', crearEditor)
  document.getElementById('cerrarSesionBtn').addEventListener('click', cerrarSesion)
})

/**
 * Carga las estadísticas para el dashboard
 */
async function cargarEstadisticas() {
  try {
    // Obtener editores
    const resultEditores = await editorService.obtenerEditores()
    
    if (resultEditores.success) {
      // Actualizar contador de editores
      document.getElementById('totalEditores').textContent = resultEditores.editores.length
      
      // Actualizar lista de editores recientes
      const listaEditores = document.getElementById('listaEditoresRecientes')
      listaEditores.innerHTML = ''
      
      const editoresRecientes = resultEditores.editores
        .sort((a, b) => new Date(b.Usuarios.created_at) - new Date(a.Usuarios.created_at))
        .slice(0, 5)
      
      editoresRecientes.forEach(editor => {
        const li = document.createElement('li')
        li.className = 'list-group-item d-flex justify-content-between align-items-center'
        li.innerHTML = `
          <div>
            <strong>${editor.nombre}</strong>
            <br>
            <small class="text-muted">${editor.correo_electronico}</small>
          </div>
          <span class="badge bg-primary rounded-pill">
            ${new Date(editor.Usuarios.created_at).toLocaleDateString()}
          </span>
        `
        listaEditores.appendChild(li)
      })
    }
    
    // Aquí puedes agregar más llamadas para obtener otras estadísticas
    // como número de noticias, usuarios, etc.
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

/**
 * Crea un nuevo editor
 * @param {Event} e - Evento del formulario
 */
async function crearEditor(e) {
  e.preventDefault()
  
  const email = document.getElementById('editorEmail').value
  const nombre = document.getElementById('editorNombre').value
  
  // Generar contraseña temporal
  const password = generarContraseñaAleatoria()
  
  // Mostrar indicador de carga
  const submitBtn = document.getElementById('crearEditorBtn')
  const originalBtnText = submitBtn.innerHTML
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando...'
  submitBtn.disabled = true
  
  try {
    const result = await editorService.crearEditor(email, nombre, password)
    
    // Ocultar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('crearEditorModal'))
    modal.hide()
    
    if (result.success) {
      // Mostrar mensaje de éxito con la contraseña temporal
      mostrarAlerta('success', `Editor creado correctamente. Contraseña temporal: ${password}`)
      
      // Limpiar formulario
      document.getElementById('crearEditorForm').reset()
      
      // Recargar estadísticas
      cargarEstadisticas()
    } else {
      mostrarAlerta('danger', result.error || 'Error al crear editor')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarAlerta('danger', 'Error al crear editor')
  } finally {
    // Restaurar botón
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false
  }
}

/**
 * Cierra la sesión del usuario
 */
async function cerrarSesion() {
  try {
    await authService.cerrarSesion()
    window.location.href = '/HTML/auth/login.html'
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

/**
 * Muestra una alerta en la página
 * @param {string} tipo - Tipo de alerta (success, danger, warning, info)
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarAlerta(tipo, mensaje) {
  const alertaContainer = document.getElementById('alertaContainer')
  
  const alerta = document.createElement('div')
  alerta.className = `alert alert-${tipo} alert-dismissible fade show`
  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `
  
  alertaContainer.appendChild(alerta)
  
  // Eliminar después de 5 segundos
  setTimeout(() => {
    alerta.classList.remove('show')
    setTimeout(() => alerta.remove(), 150)
  }, 5000)
}

/**
 * Genera una contraseña aleatoria
 * @returns {string} - Contraseña generada
 */
function generarContraseñaAleatoria() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let contraseña = ''
  
  for (let i = 0; i < 10; i++) {
    const indice = Math.floor(Math.random() * caracteres.length)
    contraseña += caracteres.charAt(indice)
  }
  
  return contraseña
}
