import supabaseClient from './supabase.js'

/**
 * Servicio para gestionar editores
 */
const editorService = {
  /**
   * Crea un nuevo editor
   * @param {string} email - Correo electrónico
   * @param {string} nombre - Nombre del editor
   * @param {string} password - Contraseña temporal
   * @returns {Promise} - Promesa con el resultado
   */
  async crearEditor(email, nombre, password) {
    try {
      // Verificar si el correo ya existe
      const { data: existingUser, error: checkError } = await supabaseClient
        .from('Usuarios')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        return {
          success: false,
          error: 'Ya existe un usuario con este correo electrónico'
        }
      }

      // Crear usuario en autenticación de Supabase
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
      })

      if (authError) throw authError

      // Crear entrada en la tabla Usuarios
      const { data: userData, error: userError } = await supabaseClient
        .from('Usuarios')
        .insert([
          { 
            id: authData.user.id,
            email,
            nombre,
            tipo: 'Editor'
          }
        ])
        .select()

      if (userError) throw userError

      // Crear entrada en la tabla Editores
      const { data: editorData, error: editorError } = await supabaseClient
        .from('Editores')
        .insert([
          { 
            idEditor: authData.user.id,
            nombre,
            CorreoElectronico: email
          }
        ])
        .select()

      if (editorError) throw editorError

      return {
        success: true,
        editor: editorData[0]
      }
    } catch (error) {
      console.error('Error al crear editor:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene todos los editores
   * @returns {Promise} - Promesa con la lista de editores
   */
  async obtenerEditores() {
    try {
      const { data, error } = await supabaseClient
        .from('Editores')
        .select(`*`)

      if (error) throw error

      return {
        success: true,
        editores: data
      }
    } catch (error) {
      console.error('Error al obtener editores:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene un editor por su ID
   * @param {string} id - ID del editor
   * @returns {Promise} - Promesa con los datos del editor
   */
  async obtenerEditorPorId(id) {
    try {
      const { data, error } = await supabaseClient
        .from('Editores')
        .select(`
          *,
          Usuarios:idUsuario (
            email,
            tipo
            
          ),
          Noticias (
            idNoticia,
            TitularNoticia,
            
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Obtener estadísticas adicionales
      const { data: stats, error: statsError } = await supabaseClient
        .from('EditorEstadisticas')
        .select('*')
        .eq('idEditor', id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') { // No error if not found
        throw statsError
      }

      return {
        success: true,
        editor: data,
        estadisticas: stats || {
          articulos: 0,
          eventos: 0,
          pilotos: 0,
          equipos: 0
        }
      }
    } catch (error) {
      console.error('Error al obtener editor:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Elimina un editor
   * @param {string} id - ID del editor
   * @returns {Promise} - Promesa con el resultado
   */
  async eliminarEditor(id) {
    try {
      // Primero obtenemos el idEditor (que es el id de usuario)
      const { data: editor, error: editorError } = await supabaseClient
        .from('Editores')
        .select('idEditor')
        .eq('id', id)
        .single()

      if (editorError) throw editorError

      // Eliminar de la tabla Editores
      const { error: deleteEditorError } = await supabaseClient
        .from('Editores')
        .delete()
        .eq('id', id)

      if (deleteEditorError) throw deleteEditorError

      // Eliminar de la tabla Usuarios
      const { error: deleteUserError } = await supabaseClient
        .from('Usuarios')
        .delete()
        .eq('id', editor.idEditor)

      if (deleteUserError) throw deleteUserError

      // Eliminar usuario de autenticación
      const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(
        editor.idEditor
      )

      if (deleteAuthError) throw deleteAuthError

      return {
        success: true
      }
    } catch (error) {
      console.error('Error al eliminar editor:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default editorService
