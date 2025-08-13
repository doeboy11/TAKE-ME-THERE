"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wrench } from 'lucide-react'
import { businessStore } from '@/lib/business-store'

interface DiagnosticResult {
  test: string
  status: 'pass' | 'fail' | 'warning' | 'running'
  message: string
  details?: any
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [autoFixResults, setAutoFixResults] = useState<string[]>([])

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test)
      const newResult = { test, status, message, details }
      
      if (existing) {
        return prev.map(r => r.test === test ? newResult : r)
      } else {
        return [...prev, newResult]
      }
    })
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    setAutoFixResults([])

    // Test 1: Environment Variables
    updateResult('env', 'running', 'Checking environment variables...')
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        updateResult('env', 'fail', 'Environment variables missing', { url: !!url, key: !!key })
      } else {
        updateResult('env', 'pass', 'Environment variables configured')
      }
    } catch (error) {
      updateResult('env', 'fail', 'Error checking environment variables', error)
    }

    // Test 2: Database Connection
    updateResult('connection', 'running', 'Testing database connection...')
    try {
      const testResult = await businessStore.testConnection()
      if (testResult.success) {
        updateResult('connection', 'pass', 'Database connection successful')
      } else {
        updateResult('connection', 'fail', 'Database connection failed', testResult)
      }
    } catch (error) {
      updateResult('connection', 'fail', 'Database connection error', error)
    }

    // Test 3: Table Structure
    updateResult('table', 'running', 'Checking table structure...')
    try {
      const tableResult = await businessStore.testTableStructure()
      if (tableResult.success) {
        updateResult('table', 'pass', 'Table structure is correct')
      } else {
        updateResult('table', 'fail', 'Table structure issues', tableResult)
      }
    } catch (error) {
      updateResult('table', 'fail', 'Table structure check failed', error)
    }

    // Test 4: Existing Pending Businesses
    updateResult('pending', 'running', 'Checking existing pending businesses...')
    try {
      const pendingBusinesses = await businessStore.getPendingBusinesses()
      updateResult('pending', 'pass', `Found ${pendingBusinesses.length} pending businesses`, { count: pendingBusinesses.length, businesses: pendingBusinesses.slice(0, 3) })
    } catch (error) {
      updateResult('pending', 'fail', 'Error fetching pending businesses', error)
    }

    // Test 5: Create Test Business
    updateResult('create', 'running', 'Creating test business...')
    try {
      const testBusiness = {
        name: `Diagnostic Test Business ${Date.now()}`,
        category: 'Test',
        description: 'This is a diagnostic test business',
        address: 'Test Address',
        phone: '+1234567890',
        hours: '9-5',
        price_range: '₵₵',
        owner_email: 'diagnostic@test.com',
        owner_name: 'Diagnostic Test',
        email: 'diagnostic@business.com',
        ownerId: 'diagnostic-test-user'
      }

      const { data, error } = await businessStore.create(testBusiness)
      
      if (error) {
        updateResult('create', 'fail', 'Failed to create test business', error)
      } else if (data && data.length > 0) {
        const createdBusiness = data[0]
        updateResult('create', 'pass', 'Test business created successfully', { id: createdBusiness.id, approval_status: createdBusiness.approval_status })
        
        // Test 6: Verify in Pending List
        updateResult('verify', 'running', 'Verifying test business appears in pending list...')
        
        // Wait a moment for database consistency
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const updatedPending = await businessStore.getPendingBusinesses()
        const testBusinessFound = updatedPending.find(b => b.id === createdBusiness.id)
        
        if (testBusinessFound) {
          updateResult('verify', 'pass', 'Test business found in pending list')
        } else {
          updateResult('verify', 'fail', 'Test business NOT found in pending list', { 
            created_id: createdBusiness.id, 
            pending_count: updatedPending.length,
            pending_ids: updatedPending.map(b => b.id)
          })
        }
        
        // Clean up test business
        try {
          await businessStore.delete(createdBusiness.id)
          updateResult('cleanup', 'pass', 'Test business cleaned up')
        } catch (cleanupError) {
          updateResult('cleanup', 'warning', 'Could not clean up test business', cleanupError)
        }
      } else {
        updateResult('create', 'fail', 'Create returned no data')
      }
    } catch (error) {
      updateResult('create', 'fail', 'Error creating test business', error)
    }

    setIsRunning(false)
  }

  const autoFix = async () => {
    const fixes: string[] = []
    
    // Check for common issues and apply fixes
    const failedResults = results.filter(r => r.status === 'fail')
    
    for (const result of failedResults) {
      switch (result.test) {
        case 'env':
          fixes.push('⚠️ Environment variables missing - Please create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
          break
          
        case 'connection':
          fixes.push('🔧 Database connection failed - Check your Supabase credentials and network connection')
          break
          
        case 'table':
          fixes.push('🔧 Table structure issues - Verify your Supabase businesses table has the correct schema')
          break
          
        case 'verify':
          // This is the main issue - business not appearing in pending list
          fixes.push('🔧 Attempting to fix business approval flow...')
          
          try {
            // Check if there are any businesses with incorrect approval_status
            const allBusinesses = await businessStore.getAllBusinesses()
            const businessesWithWrongStatus = allBusinesses.filter(b => 
              !b.approval_status || 
              (b.approval_status !== 'pending' && b.approval_status !== 'approved' && b.approval_status !== 'rejected')
            )
            
            if (businessesWithWrongStatus.length > 0) {
              fixes.push(`Found ${businessesWithWrongStatus.length} businesses with incorrect approval_status`)
              
              // Fix them by setting to 'pending'
              for (const business of businessesWithWrongStatus) {
                try {
                  await businessStore.update({ ...business, approval_status: 'pending' })
                  fixes.push(`✅ Fixed approval_status for business: ${business.name}`)
                } catch (updateError) {
                  fixes.push(`❌ Failed to fix business: ${business.name} - ${updateError}`)
                }
              }
            } else {
              fixes.push('✅ All existing businesses have correct approval_status values')
            }
          } catch (error) {
            fixes.push(`❌ Error during auto-fix: ${error}`)
          }
          break
      }
    }
    
    if (fixes.length === 0) {
      fixes.push('✅ No issues found that can be automatically fixed')
    }
    
    setAutoFixResults(fixes)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARN</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">RUNNING</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Approval Flow Diagnostics</h1>
          <p className="text-gray-600">Test and automatically fix issues with the business approval system</p>
        </div>

        <div className="space-y-6">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Control Panel</CardTitle>
              <CardDescription>Run diagnostics and apply automatic fixes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
                </Button>
                
                <Button 
                  onClick={autoFix} 
                  disabled={isRunning || results.length === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  Auto Fix Issues
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.status === 'pass').length} passed, {' '}
                  {results.filter(r => r.status === 'fail').length} failed, {' '}
                  {results.filter(r => r.status === 'warning').length} warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.test.toUpperCase()}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-gray-700">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-500 cursor-pointer">Show details</summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto Fix Results */}
          {autoFixResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Auto Fix Results</CardTitle>
                <CardDescription>Automatic fixes applied to resolve issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {autoFixResults.map((fix, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {fix}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common troubleshooting actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/admin'}
                  className="justify-start"
                >
                  Go to Admin Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="justify-start"
                >
                  Go to Business Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="justify-start"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="justify-start"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
