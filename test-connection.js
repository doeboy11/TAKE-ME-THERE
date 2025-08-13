// =====================================================
// TEST SUPABASE CONNECTION
// Diagnose the "Failed to fetch" error
// =====================================================

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🔍 Running in browser environment');
  
  // Test 1: Check environment variables
  console.log('🔍 Environment Variables Check:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  
  // Test 2: Try to import and create Supabase client
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing environment variables');
      console.error('Please check your .env.local file');
      return;
    }
    
    console.log('✅ Environment variables are set');
    console.log('🔍 Supabase URL:', supabaseUrl);
    console.log('🔍 Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test 3: Try a simple query
    console.log('🔍 Testing simple query...');
    supabase
      .from('businesses')
      .select('count')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Query failed:', error);
        } else {
          console.log('✅ Query successful:', data);
        }
      })
      .catch(err => {
        console.error('❌ Connection failed:', err);
      });
      
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
  }
} else {
  console.log('🔍 Running in Node.js environment');
}

// Test 4: Check network connectivity
console.log('🔍 Testing network connectivity...');
fetch('https://httpbin.org/get')
  .then(response => {
    console.log('✅ Network connectivity OK');
  })
  .catch(error => {
    console.error('❌ Network connectivity failed:', error);
  }); 