import supabase from './supabase.js'

/**
 * Servicio de autenticación para gestionar usuarios
 */
const authService = {
  /**
   * Registra un nuevo usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @param {string} nombre - Nombre del usuario
   * @param {string} tipo - Tipo de usuario (invitado, editor, administrador)
   * @returns {Promise} - Promesa con el resultado
   */
  async registrarUsuario(email, password, nombre, tipo = 'invitado') {
    try {
      // 1. Registrar el usuario en la autenticación de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Crear entrada en la tabla Usuarios
      const { data: userData, error: userError } = await supabase
        .from('Usuarios')
        .insert([
          { 
            id: authData.user.id,
            email,
            nombre,
            tipo
          }
        ])
        .select()

      if (userError) throw userError

      // 3. Crear entrada en la tabla correspondiente según el tipo
      let rolData = null
      let rolError = null

      if (tipo === 'invitado') {
        const result = await supabase
          .from('Invitados')
          .insert([
            { 
              idUsuario: authData.user.id,
              nombre,
              correo_electronico: email
            }
          ])
          .select()
        
        rolData = result.data
        rolError = result.error
      } 
      else if (tipo === 'editor') {
        const result = await supabase
          .from('Editores')
          .insert([
            { 
              idEditor: authData.user.id,
              nombre,
              correo_electronico: email
            }
          ])
          .select()
        
        rolData = result.data
        rolError = result.error
      }
      else if (tipo === 'administrador') {
        const result = await supabase
          .from('Administradores')
          .insert([
            { 
              idAdministrador: authData.user.id,
              nombre,
              correo_electronico: email
            }
          ])
          .select()
        
        rolData = result.data
        rolError = result.error
      }

      if (rolError) throw rolError

      return {
        success: true,
        user: authData.user,
        userData: userData[0],
        rolData: rolData ? rolData[0] : null
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} - Promesa con el resultado
   */
  async iniciarSesion(email, password) {
    try {
      // 1. Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // 2. Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      // 3. Obtener datos específicos según el tipo de usuario
      let rolData = null
      
      if (userData.tipo === 'invitado') {
        const { data, error } = await supabase
          .from('Invitados')
          .select('*')
          .eq('idUsuario', authData.user.id)
          .single()
        
        if (error) throw error
        rolData = data
      } 
      else if (userData.tipo === 'editor') {
        const { data, error } = await supabase
          .from('Editores')
          .select('*')
          .eq('idEditor', authData.user.id)
          .single()
        
        if (error) throw error
        rolData = data
      }
      else if (userData.tipo === 'administrador') {
        const { data, error } = await supabase
          .from('Administradores')
          .select('*')
          .eq('idAdministrador', authData.user.id)
          .single()
        
        if (error) throw error
        rolData = data
      }

      // 4. Guardar datos en localStorage para uso en la aplicación
      localStorage.setItem('token', authData.session.access_token)
      localStorage.setItem('userData', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        nombre: userData.nombre,
        tipo: userData.tipo,
        rolData
      }))

      return {
        success: true,
        user: authData.user,
        userData,
        rolData
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Cierra la sesión del usuario actual
   * @returns {Promise} - Promesa con el resultado
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Limpiar datos de localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      
      return { success: true }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene el usuario actualmente autenticado
   * @returns {Promise} - Promesa con el usuario actual
   */
  async obtenerUsuarioActual() {
    try {
      const { data, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      if (!data.user) {
        return { success: false, user: null }
      }
      
      return { 
        success: true, 
        user: data.user 
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} rol - Rol a verificar (invitado, editor, administrador)
   * @returns {boolean} - True si tiene el rol, false en caso contrario
   */
  tieneRol(rol) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData.tipo === rol
  }
}

export default authService
