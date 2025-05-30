const supabase = window.supabase;

/**
 * Servicio para gestionar favoritos de usuarios
 */
const favoritosService = {
  /**
   * Añade un elemento a favoritos
   * @param {string} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de elemento (piloto, equipo, circuito)
   * @param {string} idElemento - ID del elemento
   * @returns {Promise} - Promesa con el resultado
   */
  async agregarFavorito(idUsuario, tipo, idElemento) {
    try {
      const { data, error } = await supabase
        .from("Favoritos")
        .insert([
          {
            idUsuario,
            tipo,
            idElemento,
          },
        ])
        .select()

      if (error) throw error

      return {
        success: true,
        favorito: data[0],
      }
    } catch (error) {
      console.error("Error al agregar favorito:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Elimina un elemento de favoritos
   * @param {string} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de elemento
   * @param {string} idElemento - ID del elemento
   * @returns {Promise} - Promesa con el resultado
   */
  async eliminarFavorito(idUsuario, tipo, idElemento) {
    try {
      const { error } = await supabase.from("Favoritos").delete().match({
        idUsuario,
        tipo,
        idElemento,
      })

      if (error) throw error

      return {
        success: true,
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Obtiene los favoritos de un usuario
   * @param {string} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de elemento (opcional)
   * @returns {Promise} - Promesa con la lista de favoritos
   */
  async obtenerFavoritos(idUsuario, tipo = null) {
    try {
      let query = supabase.from("Favoritos").select("*").eq("idUsuario", idUsuario)

      if (tipo) {
        query = query.eq("tipo", tipo)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        favoritos: data,
      }
    } catch (error) {
      console.error("Error al obtener favoritos:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Verifica si un elemento está en favoritos
   * @param {string} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de elemento
   * @param {string} idElemento - ID del elemento
   * @returns {Promise} - Promesa con el resultado
   */
  async esFavorito(idUsuario, tipo, idElemento) {
    try {
      const { data, error, count } = await supabase.from("Favoritos").select("*", { count: "exact" }).match({
        idUsuario,
        tipo,
        idElemento,
      })

      if (error) throw error

      return {
        success: true,
        esFavorito: count > 0,
      }
    } catch (error) {
      console.error("Error al verificar favorito:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },
}

export default favoritosService
