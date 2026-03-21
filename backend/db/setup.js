/**
 * Database setup script — creates tables via Supabase SQL Editor API
 * Usage: node db/setup.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

async function setup() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  console.log('🔧 Creating database tables...\n');

  // Execute SQL via Supabase's REST SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: schema }),
  });

  // The REST RPC endpoint may not support raw SQL.
  // Fallback: use the management API or instruct user to run in SQL editor.
  if (!res.ok) {
    console.log('⚠️  Cannot run SQL via API — this is normal for Supabase.\n');
    console.log('📋 Please run the schema manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/pryxfblgsvhexpbxsznn/sql');
    console.log('2. Click "New query"');
    console.log('3. Paste the contents of: backend/db/schema.sql');
    console.log('4. Click "Run"\n');
    console.log('The schema file is at:', path.join(__dirname, 'schema.sql'));

    // Also try creating the storage bucket
    await createBucket();
    return;
  }

  console.log('✅ Tables created successfully!\n');
  await createBucket();
}

async function createBucket() {
  console.log('📦 Creating storage bucket...');

  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'amazonlens',
      name: 'amazonlens',
      public: false,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('✅ Storage bucket "amazonlens" created!\n');
  } else if (data?.message?.includes('already exists')) {
    console.log('✅ Storage bucket "amazonlens" already exists.\n');
  } else {
    console.log('⚠️  Bucket creation response:', data.message || JSON.stringify(data));
    console.log('   You can create it manually: Supabase Dashboard → Storage → New Bucket → "amazonlens"\n');
  }

  console.log('🚀 Setup complete! You can now start the app:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev');
}

setup().catch(e => {
  console.error('Setup failed:', e.message);
  process.exit(1);
});
