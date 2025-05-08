import editorService from './services/editorService.js'
import authService from './services/authService.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si el usuario es administrador
  if (!authService.tieneRol('administrador')) {
    window.location.href = '/HTML/auth/login.html'
    return
  }
  
  // Verificar si viene de eliminar un editor
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('deleted') === 'true') {
    mostrarAlerta('success', 'Editor eliminado correctamente')
  }
  
  // Cargar lista de editores
  cargarEditores()
  
  // Event listeners
  document.getElementById('buscarEditor').addEventListener('input', filtrarEditores)
  document.getElementById('cerrarSesionBtn').addEventListener('click', cerrarSesion)
})

/**
 * Carga la lista de editores
 */
async function cargarEditores() {
  try {
    // Mostrar indicador de carga
    document.getElementById('editoresLoading').classList.remove('d-none')
    document.getElementById('editoresTable').classList.add('d-none')
    
    const result = await editorService.obtenerEditores()
    
    if (result.success) {
      mostrarEditores(result.editores)
    } else {
      mostrarAlerta('danger', result.error || 'Error al cargar editores')
    }
  } catch (error) {
    console.error('Error al cargar editores:', error)
    mostrarAlerta('danger', 'Error al cargar editores')
  } finally {
    // Ocultar indicador de carga
    document.getElementById('editoresLoading').classList.add('d-none')
    document.getElementById('editoresTable').classList.remove('d-none')
  }
}

/**
 * Muestra la lista de editores en la tabla
 * @param {Array} editores - Lista de editores
 */
function mostrarEditores(editores) {
  const tbody = document.getElementById('editoresTableBody')
  tbody.innerHTML = ''
  
  if (editores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No hay editores registrados</td>
      </tr>
    `
    return
  }
  
  editores.forEach(editor => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${editor.id}</td>
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar-circle me-2">${editor.nombre.charAt(0)}</div>
          ${editor.nombre}
        </div>
      </td>
      <td>${editor.correo_electronico}</td>
      <td>${new Date(editor.Usuarios.created_at).toLocaleDateString()}</td>
      <td>
        <a href="/HTML/admin/confirmarEditor.html?id=${editor.id}" class="btn btn-sm btn-danger">
          <i class="bi bi-trash"></i> Eliminar
        </a>
      </td>
    `
    tbody.appendChild(tr)
  })
  
  // Actualizar contador
  document.getElementById('totalEditores').textContent = editores.length
}

/**
 * Filtra la lista de editores según el texto de búsqueda
 */
function filtrarEditores() {
  const busqueda = document.getElementById('buscarEditor').value.toLowerCase()
  const filas = document.querySelectorAll('#editoresTableBody tr')
  
  let contadorVisible = 0
  
  filas.forEach(fila => {
    const texto = fila.textContent.toLowerCase()
    
    if (texto.includes(busqueda)) {
      fila.style.display = ''
      contadorVisible++
    } else {
      fila.style.display = 'none'
    }
  })
  
  // Actualizar contador
  document.getElementById('totalEditores').textContent = contadorVisible
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
