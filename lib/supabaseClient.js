import { createClient } from '@supabase/supabase-js'

// Ensure your environment variables are named correctly in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Basic check to ensure variables are set during build/runtime
if (!supabaseUrl) {
  console.error("Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
  // Optionally throw an error during build time or handle appropriately
  // throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  console.error("Error: Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
  // Optionally throw an error during build time or handle appropriately
  // throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client instance
// It's safe to use || '' here for the types, but the checks above handle the runtime logic.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Optional: Add a check function if needed elsewhere, though the initial checks are often sufficient
export function checkSupabaseCredentials() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL and/or Anon Key are missing in environment variables.');
    return false;
  }
  return true;
} 