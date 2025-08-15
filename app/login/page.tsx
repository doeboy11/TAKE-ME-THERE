"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Logo from "@/components/logo"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [error, setError] = useState("")
  const [signupError, setSignupError] = useState("")
  const [signupSuccess, setSignupSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const { login, signup, isLoading } = useAuth()

  const handleLogin = async () => {
    setError("")
    // Clear any existing session to avoid cross-account mixing
    try { await supabase.auth.signOut() } catch {}
    const success = await login(email, password)
    if (success) {
      // Ensure session is written
      await supabase.auth.getSession()
      // Fetch the authenticated user and check role from metadata using shared client
      const { data } = await supabase.auth.getUser()
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role
      const target = role === 'admin' ? "/admin" : "/dashboard"
      router.replace(target)
      setTimeout(() => router.refresh(), 0)
      // Hard navigation fallback to guarantee redirect
      setTimeout(() => { try { window.location.assign(target) } catch {} }, 50)
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  const handleSignup = async () => {
    setSignupError("")
    setSignupSuccess("")
    const inferredName = signupEmail?.split("@")[0] || "User"
    const success = await signup(signupEmail, signupPassword, inferredName)
    if (success) {
      setSignupSuccess("Account created! Please check your email to confirm your account.")
      setSignupEmail("")
      setSignupPassword("")
    } else {
      setSignupError("Signup failed. Please try again with a valid email and password.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" variant="default" />
          </div>
          <CardTitle className="text-2xl">Welcome to LocalFind</CardTitle>
          <CardDescription>Sign in to manage your business or access admin features</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/")}
                  className="text-sm"
                >
                  ← Back to Home
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>

              {signupError && (
                <Alert variant="destructive">
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              {signupSuccess && (
                <Alert>
                  <AlertDescription>{signupSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleSignup}
                  disabled={isLoading || !signupEmail || !signupPassword}
                  className="w-full"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/")}
                  className="text-sm"
                >
                  ← Back to Home
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Admin Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Admin Access</span>
            </div>
            <p className="text-xs text-blue-700">
              Admin access is granted based on your account role. If your Supabase user has app metadata {`{ role: "admin" }`}, you will be redirected to the admin dashboard after sign in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 