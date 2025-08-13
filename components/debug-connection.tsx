"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function DebugConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [businessCount, setBusinessCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [envVars, setEnvVars] = useState<{url: string, key: string} | null>(null)

  const testConnection = async () => {
    setConnectionStatus('testing')
    setError(null)
    setBusinesses([])
    setBusinessCount(null)

    try {
      // Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setEnvVars({
        url: url || 'NOT SET',
        key: key ? `${key.substring(0, 10)}...` : 'NOT SET'
      })

      if (!url || !key) {
        throw new Error('Supabase environment variables not configured')
      }

      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('businesses')
        .select('count')
        .limit(1)

      if (testError) {
        throw new Error(`Connection failed: ${testError.message}`)
      }

      // Get business count
      const { count, error: countError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw new Error(`Count failed: ${countError.message}`)
      }

      setBusinessCount(count || 0)

      // Get visible businesses
      const { data: visibleBusinesses, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('isActive', true)
        .eq('isVerified', true)
        .order('createdAt', { ascending: false })

      if (fetchError) {
        throw new Error(`Fetch failed: ${fetchError.message}`)
      }

      setBusinesses(visibleBusinesses || [])
      setConnectionStatus('success')

    } catch (err: any) {
      setError(err.message)
      setConnectionStatus('error')
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Variables */}
        <div className="space-y-2">
          <h3 className="font-medium">Environment Variables:</h3>
          <div className="text-sm space-y-1">
            <div>URL: {envVars?.url || 'Loading...'}</div>
            <div>Key: {envVars?.key || 'Loading...'}</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <h3 className="font-medium">Connection Status:</h3>
          <div className="flex items-center gap-2">
            {connectionStatus === 'idle' && <div className="text-gray-500">Idle</div>}
            {connectionStatus === 'testing' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Testing connection...</span>
              </>
            )}
            {connectionStatus === 'success' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Connected successfully</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">Connection failed</span>
              </>
            )}
          </div>
        </div>

        {/* Business Count */}
        {businessCount !== null && (
          <div className="space-y-2">
            <h3 className="font-medium">Database Status:</h3>
            <div className="text-sm">
              Total businesses in database: <strong>{businessCount}</strong>
            </div>
            <div className="text-sm">
              Visible businesses (active + verified): <strong>{businesses.length}</strong>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Visible Businesses */}
        {businesses.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Visible Businesses:</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {businesses.map((business) => (
                <div key={business.id} className="text-sm p-2 bg-gray-50 rounded">
                  <strong>{business.name}</strong> - {business.category}
                  <br />
                  <span className="text-gray-600">
                    Active: {business.isActive ? 'Yes' : 'No'} | 
                    Verified: {business.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>If you see 0 businesses:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Run the database scripts in Supabase SQL Editor</li>
            <li>Add some businesses through the dashboard</li>
            <li>Check if businesses have isActive=true and isVerified=true</li>
          </ul>
          <p><strong>If connection fails:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Check your .env.local file has correct Supabase credentials</li>
            <li>Verify your Supabase project is active</li>
            <li>Check RLS policies are not blocking access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 