const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — DB calls will fail');
}

// Service role client for server-side operations (bypasses RLS)
// Use a dummy URL when not configured so the module still loads
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

module.exports = { supabase };
