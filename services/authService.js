const supabase = window.supabase;

/**
 * Servicio de autenticación para gestionar usuarios
 */
const authService = {
  /**
   * Registra un nuevo usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @param {string} nombre - Nombre del usuario
   * @param {string} apellidos - Apellidos del usuario
   * @param {string} tipoUsuario - Tipo de usuario (Invitado, Editor, Administrador)
   * @returns {Promise} - Promesa con el resultado
   */
  async registrarUsuario(email, password, nombre, apellidos, tipoUsuario = "Invitado") {
    try {
      // 1. Registrar el usuario en la autenticación de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellidos,
            tipoUsuario,
          },
        },
      })

      if (authError) throw authError

      // 2. Crear entrada en la tabla Usuarios
      const { data: userData, error: userError } = await supabase
        .from("Usuarios")
        .insert([
          {
            id: authData.user.id,
            email,
            nombre,
            apellidos,
            tipoUsuario,
          },
        ])
        .select()

      if (userError) throw userError

      // 3. Si es un Editor, crear entrada en la tabla Editores
      let editorData = null
      let editorError = null

      if (tipoUsuario === "Editor") {
        const result = await supabase
          .from("Editores")
          .insert([
            {
              idEditor: authData.user.id,
              nombre: `${nombre} ${apellidos}`,
              correo_electronico: email,
            },
          ])
          .select()

        editorData = result.data
        editorError = result.error

        if (editorError) throw editorError
      }

      return {
        success: true,
        user: authData.user,
        userData: userData[0],
        editorData: editorData ? editorData[0] : null,
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      return {
        success: false,
        error: error.message,
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
        password,
      })

      if (authError) throw authError

      // 2. Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (userError) throw userError

      // 3. Obtener datos específicos si es un Editor
      let editorData = null

      if (userData.tipoUsuario === "Editor") {
        const { data, error } = await supabase.from("Editores").select("*").eq("idEditor", authData.user.id).single()

        if (!error) {
          editorData = data
        }
      }

      // 4. Guardar datos en localStorage para uso en la aplicación
      localStorage.setItem("token", authData.session.access_token)
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          nombre: userData.nombre,
          apellidos: userData.apellidos,
          tipoUsuario: userData.tipoUsuario,
          editorData,
        }),
      )

      return {
        success: true,
        user: authData.user,
        userData,
        editorData,
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return {
        success: false,
        error: error.message,
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
      localStorage.removeItem("token")
      localStorage.removeItem("userData")

      return { success: true }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      return {
        success: false,
        error: error.message,
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

      // Obtener datos adicionales del usuario desde la tabla Usuarios
      const { data: userData, error: userError } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        console.warn("No se encontraron datos adicionales del usuario:", userError)
      }

      return {
        success: true,
        user: data.user,
        userData: userData || null,
      }
    } catch (error) {
      console.error("Error al obtener usuario actual:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} tipoUsuario - Tipo de usuario a verificar (Invitado, Editor, Administrador)
   * @returns {boolean} - True si tiene el rol, false en caso contrario
   */
  tieneRol(tipoUsuario) {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    return userData.tipoUsuario === tipoUsuario
  },

  /**
   * Actualiza los datos del perfil de usuario
   * @param {Object} datosUsuario - Datos a actualizar
   * @returns {Promise} - Promesa con el resultado
   */
  async actualizarPerfil(datosUsuario) {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser()

      if (authError) throw authError

      if (!authUser.user) {
        throw new Error("Usuario no autenticado")
      }

      // Actualizar datos en la tabla Usuarios
      const { data, error } = await supabase.from("Usuarios").update(datosUsuario).eq("id", authUser.user.id).select()

      if (error) throw error

      // Actualizar localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...userData,
          ...datosUsuario,
        }),
      )

      return {
        success: true,
        userData: data[0],
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },
}

export default authService
