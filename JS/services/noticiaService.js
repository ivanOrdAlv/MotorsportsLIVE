import supabase from './supabase.js'

/**
 * Servicio para gestionar noticias
 */
const noticiaService = {
  /**
   * Crea una nueva noticia
   * @param {Object} noticia - Datos de la noticia
   * @param {string} noticia.idEditor - ID del editor
   * @param {string} noticia.titularNoticia - Titular de la noticia
   * @param {string} noticia.contenidoNoticia - Contenido de la noticia
   * @param {string} noticia.categoria - Categoría de la noticia
   * @param {File} noticia.imagenPrincipal - Imagen principal
   * @returns {Promise} - Promesa con el resultado
   */
  async crearNoticia(noticia) {
    try {
      let imagenUrl = null

      // Si hay imagen, subirla al storage
      if (noticia.imagenPrincipal) {
        const fileName = `noticias/${Date.now()}_${noticia.imagenPrincipal.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagenes')
          .upload(fileName, noticia.imagenPrincipal)

        if (uploadError) throw uploadError

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('imagenes')
          .getPublicUrl(fileName)

        imagenUrl = urlData.publicUrl
      }

      // Crear la noticia en la base de datos
      const { data, error } = await supabase
        .from('Noticias')
        .insert([
          {
            idEditor: noticia.idEditor,
            TitularNoticia: noticia.titularNoticia,
            ContenidoNoticia: noticia.contenidoNoticia,
            categoria: noticia.categoria,
            imagenPrincipal: imagenUrl,
            subtitulo: noticia.subtitulo || null,
            autor: noticia.autor || null,
            estado: noticia.estado || 'publicado'
          }
        ])
        .select()

      if (error) throw error

      return {
        success: true,
        noticia: data[0]
      }
    } catch (error) {
      console.error('Error al crear noticia:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene todas las noticias
   * @param {Object} options - Opciones de filtrado
   * @param {string} options.categoria - Filtrar por categoría
   * @param {number} options.limit - Límite de resultados
   * @param {number} options.offset - Desplazamiento para paginación
   * @returns {Promise} - Promesa con la lista de noticias
   */
  async obtenerNoticias(options = {}) {
    try {
      let query = supabase
        .from('Noticias')
        .select(`
          *,
          Editores (
            nombre
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros si existen
      if (options.categoria) {
        query = query.eq('categoria', options.categoria)
      }

      if (options.estado) {
        query = query.eq('estado', options.estado)
      }

      // Aplicar paginación
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        success: true,
        noticias: data,
        total: count
      }
    } catch (error) {
      console.error('Error al obtener noticias:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Obtiene una noticia por su ID
   * @param {string} id - ID de la noticia
   * @returns {Promise} - Promesa con los datos de la noticia
   */
  async obtenerNoticiaPorId(id) {
    try {
      const { data, error } = await supabase
        .from('Noticias')
        .select(`
          *,
          Editores (
            nombre
          )
        `)
        .eq('idNoticia', id)
        .single()

      if (error) throw error

      return {
        success: true,
        noticia: data
      }
    } catch (error) {
      console.error('Error al obtener noticia:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Actualiza una noticia existente
   * @param {string} id - ID de la noticia
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise} - Promesa con el resultado
   */
  async actualizarNoticia(id, datos) {
    try {
      let imagenUrl = datos.imagenPrincipal

      // Si hay una nueva imagen (objeto File), subirla
      if (datos.imagenPrincipal instanceof File) {
        const fileName = `noticias/${Date.now()}_${datos.imagenPrincipal.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagenes')
          .upload(fileName, datos.imagenPrincipal)

        if (uploadError) throw uploadError

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('imagenes')
          .getPublicUrl(fileName)

        imagenUrl = urlData.publicUrl
      }

      // Actualizar la noticia
      const { data, error } = await supabase
        .from('Noticias')
        .update({
          TitularNoticia: datos.titularNoticia,
          ContenidoNoticia: datos.contenidoNoticia,
          categoria: datos.categoria,
          imagenPrincipal: imagenUrl,
          subtitulo: datos.subtitulo,
          autor: datos.autor,
          estado: datos.estado
        })
        .eq('idNoticia', id)
        .select()

      if (error) throw error

      return {
        success: true,
        noticia: data[0]
      }
    } catch (error) {
      console.error('Error al actualizar noticia:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Elimina una noticia
   * @param {string} id - ID de la noticia
   * @returns {Promise} - Promesa con el resultado
   */
  async eliminarNoticia(id) {
    try {
      // Primero obtenemos la URL de la imagen para eliminarla del storage
      const { data: noticia, error: getError } = await supabase
        .from('Noticias')
        .select('imagenPrincipal')
        .eq('idNoticia', id)
        .single()

      if (getError) throw getError

      // Eliminar la noticia
      const { error: deleteError } = await supabase
        .from('Noticias')
        .delete()
        .eq('idNoticia', id)

      if (deleteError) throw deleteError

      // Si hay imagen, eliminarla del storage
      if (noticia.imagenPrincipal) {
        // Extraer el nombre del archivo de la URL
        const fileName = noticia.imagenPrincipal.split('/').pop()
        
        const { error: storageError } = await supabase.storage
          .from('imagenes')
          .remove([`noticias/${fileName}`])

        if (storageError) {
          console.warn('Error al eliminar imagen:', storageError)
          // No interrumpimos el flujo si falla la eliminación de la imagen
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Error al eliminar noticia:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default noticiaService
