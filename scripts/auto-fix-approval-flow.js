// Auto-fix script for business approval flow
// This script will automatically detect and fix common issues

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
} catch (error) {
  console.log('Could not load .env.local file');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('❌ Environment variables missing. Please create .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key');
  process.exit(1);
}

const supabase = createClient(url, key);

async function autoFixApprovalFlow() {
  console.log('🔧 Starting automatic fix for business approval flow...\n');

  try {
    // 1. Test connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('businesses')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check for businesses with missing or incorrect approval_status
    console.log('2️⃣ Checking for businesses with incorrect approval_status...');
    const { data: allBusinesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, approval_status, owner_name, created_at');
    
    if (fetchError) {
      console.log('❌ Error fetching businesses:', fetchError.message);
      return;
    }

    console.log(`📊 Found ${allBusinesses?.length || 0} total businesses`);

    // Find businesses with problematic approval_status
    const problematicBusinesses = allBusinesses?.filter(business => 
      !business.approval_status || 
      (business.approval_status !== 'pending' && 
       business.approval_status !== 'approved' && 
       business.approval_status !== 'rejected')
    ) || [];

    console.log(`🔍 Found ${problematicBusinesses.length} businesses with incorrect approval_status`);

    if (problematicBusinesses.length > 0) {
      console.log('\n3️⃣ Fixing businesses with incorrect approval_status...');
      
      for (const business of problematicBusinesses) {
        console.log(`🔧 Fixing business: ${business.name} (ID: ${business.id})`);
        console.log(`   Current status: ${business.approval_status || 'null/undefined'}`);
        
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ approval_status: 'pending' })
          .eq('id', business.id);
        
        if (updateError) {
          console.log(`❌ Failed to fix ${business.name}: ${updateError.message}`);
        } else {
          console.log(`✅ Fixed ${business.name} - set to 'pending'`);
        }
      }
    } else {
      console.log('✅ All businesses have correct approval_status values');
    }

    // 4. Check current status distribution
    console.log('\n4️⃣ Current business status distribution:');
    const pendingCount = allBusinesses?.filter(b => b.approval_status === 'pending').length || 0;
    const approvedCount = allBusinesses?.filter(b => b.approval_status === 'approved').length || 0;
    const rejectedCount = allBusinesses?.filter(b => b.approval_status === 'rejected').length || 0;
    
    console.log(`   📋 Pending: ${pendingCount}`);
    console.log(`   ✅ Approved: ${approvedCount}`);
    console.log(`   ❌ Rejected: ${rejectedCount}`);

    // 5. Verify pending businesses are accessible
    console.log('\n5️⃣ Verifying pending businesses query...');
    const { data: pendingBusinesses, error: pendingError } = await supabase
      .from('businesses')
      .select('id, name, approval_status, owner_name, created_at')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (pendingError) {
      console.log('❌ Error querying pending businesses:', pendingError.message);
      return;
    }

    console.log(`✅ Successfully queried pending businesses: ${pendingBusinesses?.length || 0} found`);
    
    if (pendingBusinesses && pendingBusinesses.length > 0) {
      console.log('\n📋 Pending businesses:');
      pendingBusinesses.forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name} (Owner: ${business.owner_name})`);
        console.log(`      Created: ${new Date(business.created_at).toLocaleDateString()}`);
      });
    }

    // 6. Test admin dashboard query compatibility
    console.log('\n6️⃣ Testing admin dashboard query compatibility...');
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('businesses')
      .select(`
        id, 
        name, 
        category, 
        description, 
        address, 
        phone, 
        hours, 
        price_range, 
        owner_email, 
        owner_name, 
        email, 
        approval_status, 
        created_at, 
        updated_at,
        business_images(image_url, image_type, sort_order, is_primary)
      `)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (dashboardError) {
      console.log('❌ Admin dashboard query failed:', dashboardError.message);
      
      // Try simpler query without business_images
      console.log('🔧 Trying fallback query without images...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('businesses')
        .select('id, name, category, description, address, phone, hours, price_range, owner_email, owner_name, email, approval_status, created_at, updated_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (fallbackError) {
        console.log('❌ Fallback query also failed:', fallbackError.message);
      } else {
        console.log('✅ Fallback query successful - business_images table may be missing');
        console.log('💡 Consider creating business_images table or updating admin dashboard query');
      }
    } else {
      console.log('✅ Admin dashboard query successful');
    }

    console.log('\n🎉 Auto-fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Fixed ${problematicBusinesses.length} businesses with incorrect status`);
    console.log(`   • ${pendingCount} businesses are now pending approval`);
    console.log(`   • Admin dashboard query is ${dashboardError ? 'failing' : 'working'}`);
    
    if (pendingCount > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Go to http://localhost:3001/admin to access admin dashboard');
      console.log('   2. Check the "Pending" tab to see businesses awaiting approval');
      console.log('   3. If businesses still don\'t appear, check browser console for errors');
    }

  } catch (error) {
    // Improved error logging
    let errorString = '';
    if (typeof error === 'object') {
      try {
        errorString = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
      } catch (e) {
        errorString = error.message || String(error);
      }
    } else {
      errorString = String(error);
    }
    console.log('❌ Auto-fix failed with error:', errorString);
    if (error && error.stack) {
      console.log('Stack trace:', error.stack);
    }
  }
}

// Run the auto-fix
autoFixApprovalFlow().then(() => {
  console.log('\n✨ Auto-fix script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
