// supabaseClient.js
// URL from Settings → API → Project URL
const SUPABASE_URL = "https://plzlzvpfnudsoemloswx.supabase.co";

// anon public key from Settings → API → Project API keys → "anon public"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsemx6dnBmbnVkc29lbWxvc3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDAyMzQsImV4cCI6MjA3OTcxNjIzNH0.DTZvLblHHxLbuPld3pq9ijmoD3ztU_TWyhuLLnoyMzM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
