// Test script to verify database connection and approval system
const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing database connection and approval system...\n')

  try {
    // Test 1: Check if businesses table exists
    console.log('1. Checking businesses table...')
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)

    if (businessesError) {
      console.error('❌ Error accessing businesses table:', businessesError)
      return
    }
    console.log('✅ Businesses table accessible')

    // Test 2: Check table structure
    console.log('\n2. Checking table structure...')
    const { data: structure, error: structureError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)

    if (structureError) {
      console.error('❌ Error checking structure:', structureError)
      return
    }

    if (structure && structure.length > 0) {
      const sample = structure[0]
      console.log('✅ Sample business fields:', Object.keys(sample))
      
      // Check for approval fields
      const hasApprovalStatus = 'approval_status' in sample
      const hasAdminNotes = 'admin_notes' in sample
      const hasApprovedAt = 'approved_at' in sample
      
      console.log(`   - approval_status: ${hasApprovalStatus ? '✅' : '❌'}`)
      console.log(`   - admin_notes: ${hasAdminNotes ? '✅' : '❌'}`)
      console.log(`   - approved_at: ${hasApprovedAt ? '✅' : '❌'}`)
    }

    // Test 3: Count businesses by approval status
    console.log('\n3. Checking approval status counts...')
    const { data: approved, error: approvedError } = await supabase
      .from('businesses')
      .select('id')
      .eq('approval_status', 'approved')

    const { data: pending, error: pendingError } = await supabase
      .from('businesses')
      .select('id')
      .eq('approval_status', 'pending')

    if (approvedError || pendingError) {
      console.error('❌ Error counting businesses:', approvedError || pendingError)
      return
    }

    console.log(`✅ Approved businesses: ${approved?.length || 0}`)
    console.log(`⏳ Pending businesses: ${pending?.length || 0}`)

    // Test 4: Show sample businesses
    console.log('\n4. Sample businesses:')
    const { data: sampleBusinesses, error: sampleError } = await supabase
      .from('businesses')
      .select('name, category, approval_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (sampleError) {
      console.error('❌ Error fetching sample businesses:', sampleError)
      return
    }

    if (sampleBusinesses && sampleBusinesses.length > 0) {
      sampleBusinesses.forEach((business, index) => {
        const status = business.approval_status || 'unknown'
        const statusIcon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❓'
        console.log(`${index + 1}. ${statusIcon} ${business.name} (${business.category}) - ${status}`)
      })
    } else {
      console.log('   No businesses found in database')
    }

    // Test 5: Test the main page query
    console.log('\n5. Testing main page query (approved + active businesses)...')
    const { data: mainPageBusinesses, error: mainPageError } = await supabase
      .from('businesses')
      .select('name, category, approval_status, is_active')
      .eq('is_active', true)
      .eq('approval_status', 'approved')

    if (mainPageError) {
      console.error('❌ Error testing main page query:', mainPageError)
      return
    }

    console.log(`✅ Main page will show ${mainPageBusinesses?.length || 0} businesses`)

    console.log('\n🎉 Database test completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - Total businesses: ${(approved?.length || 0) + (pending?.length || 0)}`)
    console.log(`   - Approved: ${approved?.length || 0}`)
    console.log(`   - Pending: ${pending?.length || 0}`)
    console.log(`   - Will appear on main page: ${mainPageBusinesses?.length || 0}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDatabase() 