"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Copy, CheckCircle } from "lucide-react"

export function TestEnv() {
  const [showKeys, setShowKeys] = useState(false)
  const [copied, setCopied] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Environment Variables Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Supabase URL:</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
              {supabaseUrl || 'NOT SET'}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(supabaseUrl || '')}
              disabled={!supabaseUrl}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Supabase Anon Key:</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
              {showKeys ? (supabaseKey || 'NOT SET') : (supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(supabaseKey || '')}
              disabled={!supabaseKey}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {(!supabaseUrl || !supabaseKey) && (
          <Alert variant="destructive">
            <AlertDescription>
              Missing environment variables! Create a <code>.env.local</code> file in your project root with:
              <br />
              <br />
              <code>
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
              </code>
            </AlertDescription>
          </Alert>
        )}

        {supabaseUrl && supabaseKey && (
          <Alert>
            <AlertDescription>
              ✅ Environment variables are configured. If you're still getting "Failed to fetch", 
              the issue might be with network connectivity or Supabase project status.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Troubleshooting steps:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verify the URL and key match your Supabase project settings</li>
            <li>Check if your Supabase project is active (not paused)</li>
            <li>Try accessing the Supabase dashboard to verify project status</li>
            <li>Check if your network/firewall is blocking the connection</li>
            <li>Restart your development server after changing .env.local</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 