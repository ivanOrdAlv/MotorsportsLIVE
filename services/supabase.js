import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Utilizar las variables de entorno para la configuración de Supabase
const supabaseUrl = 'https://tdyjnlkntgamugcvxczj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeWpubGtudGdhbXVnY3Z4Y3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTI4OTUsImV4cCI6MjA2MTc4ODg5NX0.R_NQAYiK1eaAB2Ulrhn2xEOwPwsAmxGexGQOmPCSPBY'

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Variables de entorno de Supabase no definidas")
}

// Crear el cliente de Supabase
 const supabaseClient = createClient(supabaseUrl, supabaseKey); // ✅ así sí

window.supabaseClient = supabaseClient;

export default supabaseClient;
