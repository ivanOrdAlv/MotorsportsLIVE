import supabase from './supabase.js'

/**
 * Servicio para gestionar administradores
 */
const administradorService = {
  /**
   * Obtiene todos los administradores
   * @returns {Promise} - Promesa con la lista de administradores
   */
  async obtenerAdministradores() {
    try {
      const { data, error } = await supabase
        .from('Administradores')
        .select(`
          *,
          Usuarios:idAdministrador (
            email,
            tipo,
            created_at
          )
        `)
        .order('id', { ascending: true })

      if (error) throw error

      return {
        success: true,
        administradores: data
      }
    } catch (error) {
      console.error('Error al obtener administradores:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene un administrador por su ID
   * @param {string} id - ID del administrador
   * @returns {Promise} - Promesa con los datos del administrador
   */
  async obtenerAdministradorPorId(id) {
    try {
      const { data, error } = await supabase
        .from('Administradores')
        .select(`
          *,
          Usuarios:idAdministrador (
            email,
            tipo,
            created_at
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        success: true,
        administrador: data
      }
    } catch (error) {
      console.error('Error al obtener administrador:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Crea un nuevo administrador
   * @param {string} email - Correo electrónico
   * @param {string} nombre - Nombre del administrador
   * @param {string} password - Contraseña temporal
   * @returns {Promise} - Promesa con el resultado
   */
  async crearAdministrador(email, nombre, password) {
    try {
      // Verificar si el correo ya existe
      const { data: existingUser, error: checkError } = await supabase
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
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (authError) throw authError

      // Crear entrada en la tabla Usuarios
      const { data: userData, error: userError } = await supabase
        .from('Usuarios')
        .insert([
          { 
            id: authData.user.id,
            email,
            nombre,
            tipo: 'administrador'
          }
        ])
        .select()

      if (userError) throw userError

      // Crear entrada en la tabla Administradores
      const { data: adminData, error: adminError } = await supabase
        .from('Administradores')
        .insert([
          { 
            idAdministrador: authData.user.id,
            nombre,
            correo_electronico: email
          }
        ])
        .select()

      if (adminError) throw adminError

      return {
        success: true,
        administrador: adminData[0]
      }
    } catch (error) {
      console.error('Error al crear administrador:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default administradorService
