import supabase from './supabase.js'

/**
 * Servicio para gestionar invitados
 */
const invitadoService = {
  /**
   * Obtiene todos los invitados
   * @returns {Promise} - Promesa con la lista de invitados
   */
  async obtenerInvitados() {
    try {
      const { data, error } = await supabase
        .from('Invitados')
        .select(`
          *,
          Usuarios:idUsuario (
            email,
            tipo,
            created_at
          )
        `)
        .order('idInvitado', { ascending: true })

      if (error) throw error

      return {
        success: true,
        invitados: data
      }
    } catch (error) {
      console.error('Error al obtener invitados:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene un invitado por su ID
   * @param {string} id - ID del invitado
   * @returns {Promise} - Promesa con los datos del invitado
   */
  async obtenerInvitadoPorId(id) {
    try {
      const { data, error } = await supabase
        .from('Invitados')
        .select(`
          *,
          Usuarios:idUsuario (
            email,
            tipo,
            created_at
          )
        `)
        .eq('idInvitado', id)
        .single()

      if (error) throw error

      return {
        success: true,
        invitado: data
      }
    } catch (error) {
      console.error('Error al obtener invitado:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Actualiza el estado de un invitado (activo/bloqueado)
   * @param {string} id - ID del invitado
   * @param {boolean} activo - Estado activo
   * @returns {Promise} - Promesa con el resultado
   */
  async actualizarEstadoInvitado(id, activo) {
    try {
      const { data, error } = await supabase
        .from('Invitados')
        .update({ activo })
        .eq('idInvitado', id)
        .select()

      if (error) throw error

      return {
        success: true,
        invitado: data[0]
      }
    } catch (error) {
      console.error('Error al actualizar estado del invitado:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Añade un elemento a favoritos
   * @param {string} idInvitado - ID del invitado
   * @param {string} tipo - Tipo de elemento (piloto, equipo, circuito)
   * @param {string} idElemento - ID del elemento
   * @returns {Promise} - Promesa con el resultado
   */
  async agregarFavorito(idInvitado, tipo, idElemento) {
    try {
      const { data, error } = await supabase
        .from('Favoritos')
        .insert([
          {
            idInvitado,
            tipo,
            idElemento
          }
        ])
        .select()

      if (error) throw error

      return {
        success: true,
        favorito: data[0]
      }
    } catch (error) {
      console.error('Error al agregar favorito:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Elimina un elemento de favoritos
   * @param {string} idInvitado - ID del invitado
   * @param {string} tipo - Tipo de elemento
   * @param {string} idElemento - ID del elemento
   * @returns {Promise} - Promesa con el resultado
   */
  async eliminarFavorito(idInvitado, tipo, idElemento) {
    try {
      const { error } = await supabase
        .from('Favoritos')
        .delete()
        .match({
          idInvitado,
          tipo,
          idElemento
        })

      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene los favoritos de un invitado
   * @param {string} idInvitado - ID del invitado
   * @param {string} tipo - Tipo de elemento (opcional)
   * @returns {Promise} - Promesa con la lista de favoritos
   */
  async obtenerFavoritos(idInvitado, tipo = null) {
    try {
      let query = supabase
        .from('Favoritos')
        .select('*')
        .eq('idInvitado', idInvitado)

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        favoritos: data
      }
    } catch (error) {
      console.error('Error al obtener favoritos:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default invitadoService
