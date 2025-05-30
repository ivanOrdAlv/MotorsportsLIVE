// Utilidades para debugging de Supabase

// Función para verificar la configuración de Supabase
async function verificarConfiguracionSupabase() {
  try {
    console.log("🔍 Verificando configuración de Supabase...")

    // Verificar que el cliente esté configurado
    if (!window.supabaseClient) {
      console.error("❌ Cliente de Supabase no está configurado")
      return false
    }

    // Verificar conexión básica
    const { data, error } = await window.supabaseClient.from("Usuarios").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Error al conectar con la tabla Usuarios:", error)
      return false
    }

    console.log("✅ Conexión con Supabase exitosa")
    console.log(`📊 Total de usuarios en la tabla: ${data.length || 0}`)
    return true
  } catch (error) {
    console.error("❌ Error al verificar configuración:", error)
    return false
  }
}

// Función para verificar políticas de RLS
async function verificarPoliticasRLS() {
  try {
    console.log("🔍 Verificando políticas de RLS...")

    // Intentar hacer una consulta SELECT
    const { data: selectData, error: selectError } = await window.supabaseClient.from("Usuarios").select("id").limit(1)

    if (selectError) {
      console.error("❌ Error en política SELECT:", selectError)
    } else {
      console.log("✅ Política SELECT funcionando")
    }

    // Intentar hacer una inserción de prueba (que fallará pero nos dirá si la política existe)
    const { error: insertError } = await window.supabaseClient.from("Usuarios").insert([
      {
        id: "test-id-that-will-fail",
        email: "test@test.com",
        nombre: "Test",
        tipoUsuario: "Invitado",
      },
    ])

    if (insertError) {
      if (insertError.message.includes("violates foreign key constraint")) {
        console.log("✅ Política INSERT funcionando (error esperado de foreign key)")
      } else if (insertError.message.includes("new row violates row-level security")) {
        console.error("❌ Política INSERT bloqueando inserción")
      } else {
        console.log("ℹ️ Error de inserción:", insertError.message)
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar políticas:", error)
  }
}

// Función para verificar estructura de tabla
async function verificarEstructuraTabla() {
  try {
    console.log("🔍 Verificando estructura de tabla Usuarios...")

    // Esta consulta nos ayudará a ver si la tabla existe y tiene las columnas correctas
    const { data, error } = await window.supabaseClient
      .from("Usuarios")
      .select("id, email, nombre, apellidos, tipoUsuario")
      .limit(0)

    if (error) {
      console.error("❌ Error en estructura de tabla:", error)
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("❌ La tabla 'Usuarios' no existe")
      }
    } else {
      console.log("✅ Estructura de tabla correcta")
    }
  } catch (error) {
    console.error("❌ Error al verificar estructura:", error)
  }
}

// Función principal de debugging
async function debugSupabase() {
  console.log("🚀 Iniciando debugging de Supabase...")

  await verificarConfiguracionSupabase()
  await verificarEstructuraTabla()
  await verificarPoliticasRLS()

  console.log("🏁 Debugging completado")
}

// Hacer disponible globalmente
window.debugSupabase = debugSupabase
window.verificarConfiguracionSupabase = verificarConfiguracionSupabase
window.verificarEstructuraTabla = verificarEstructuraTabla
window.verificarPoliticasRLS = verificarPoliticasRLS