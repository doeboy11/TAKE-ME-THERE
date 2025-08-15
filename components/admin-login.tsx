"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Logo from "@/components/logo"
import { supabase } from "@/lib/supabaseClient"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = async () => {
    console.debug('[AdminLogin] Sign In clicked')
    setError("")
    setIsLoading(true)
    try {
      console.debug('[AdminLogin] Attempting Supabase signInWithPassword for', email)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.debug('[AdminLogin] signIn result:', { user: data?.user?.id, error: error?.message })
      if (error) {
        setError(error.message)
        return
      }
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role
      console.debug('[AdminLogin] user role:', role)
      if (role !== 'admin') {
        setError('This account does not have admin access.')
        return
      }
      router.push('/admin')
    } catch (e: any) {
      console.error('[AdminLogin] signIn exception:', e)
      setError(e?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdminLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" variant="default" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Sign in with an admin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleAdminLogin} 
            disabled={isLoading || !email || !password}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => router.push("/")}
              className="text-sm"
            >
              Back to Home
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              Use your admin email and password. Admin role is checked on sign-in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 