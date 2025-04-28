import { createClient } from '@supabase/supabase-js'
import { Constants } from '@/config/constants'

// Create and export the Supabase client instance
// It's safe to use || '' here for the types, but the checks above handle the runtime logic.
export const supabase = createClient(Constants.SUPABASE_URL || '', Constants.SUPABASE_ANON_KEY || '')

// Optional: Add a check function if needed elsewhere, though the initial checks are often sufficient
export function checkSupabaseCredentials() {
  if (!Constants.SUPABASE_URL || !Constants.SUPABASE_ANON_KEY) {
    console.error('Supabase URL and/or Anon Key are missing in environment variables.');
    return false;
  }
  return true;
} 