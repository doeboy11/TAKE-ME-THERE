// Test Supabase Connection
// Run this with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Configuration...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('✅ Environment variables found:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Test connection
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('businesses').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\nPossible issues:');
      console.log('1. Invalid Supabase URL or key');
      console.log('2. Database tables not created');
      console.log('3. Network connectivity issues');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Database is accessible');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testConnection(); 