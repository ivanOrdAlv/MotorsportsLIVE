// Configuración de Supabase usando el objeto global cargado desde CDN
const supabaseUrl = "https://tdyjnlkntgamugcvxczj.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeWpubGtudGdhbXVnY3Z4Y3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTI4OTUsImV4cCI6MjA2MTc4ODg5NX0.R_NQAYiK1eaAB2Ulrhn2xEOwPwsAmxGexGQOmPCSPBY"

// Verificar que supabase esté disponible globalmente
if (typeof supabase === "undefined" && typeof supabaseClient === "undefined") {
  console.error("Error: Supabase no está cargado correctamente")
}

// Crear el cliente de Supabase
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null

// Exponer el cliente globalmente para que otros scripts puedan usarlo
window.supabaseClient = supabaseClient
