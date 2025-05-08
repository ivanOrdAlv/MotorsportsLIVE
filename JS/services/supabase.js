

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tdyjnlkntgamugcvxczj.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeWpubGtudGdhbXVnY3Z4Y3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTI4OTUsImV4cCI6MjA2MTc4ODg5NX0.R_NQAYiK1eaAB2Ulrhn2xEOwPwsAmxGexGQOmPCSPBY"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase