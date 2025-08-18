"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"

interface BusinessLoginProps {
  onClose: () => void
}

export function BusinessLogin({ onClose }: BusinessLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [error, setError] = useState("")
  const [signupError, setSignupError] = useState("")
  const [signupSuccess, setSignupSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const { login, signup, isLoading } = useAuth()
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [forgotError, setForgotError] = useState("")

  const handleLogin = async () => {
    setError("")
    const success = await login(email, password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  const handleSignup = async () => {
    setSignupError("")
    setSignupSuccess("")
    if (!signupName.trim()) {
      setSignupError("Please enter your name.")
      return
    }
    const success = await signup(signupEmail, signupPassword, signupName.trim())
    if (success) {
      setSignupSuccess("Account created! Please check your email to confirm your account.")
      setSignupEmail("")
      setSignupPassword("")
      setSignupName("")
    } else {
      setSignupError("Signup failed. Please try again with a valid email and password.")
    }
  }

  // Build a safe redirect URL for Supabase reset emails
  const getRedirectUrl = () => {
    let base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "")
    if (!process.env.NEXT_PUBLIC_SITE_URL && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('NEXT_PUBLIC_SITE_URL is not set. Falling back to window.location.origin:', base)
    }
    // Normalize: remove trailing slash
    if (base.endsWith('/')) base = base.slice(0, -1)
    const redirect = `${base}/reset-password`
    // eslint-disable-next-line no-console
    console.log('Supabase reset redirect URL:', redirect)
    return redirect
  }

  // Submit forgot password request
  const handleForgotSubmit = async (e?: any) => {
    if (e?.preventDefault) e.preventDefault()
    setForgotError("")
    setForgotSubmitted(false)
    if (!forgotEmail) {
      setForgotError("Please enter your email.")
      return
    }
    try {
      setForgotSending(true)
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: getRedirectUrl(),
      })
      if (error) {
        // Log internally; keep user messaging generic to avoid enumeration
        console.error("resetPasswordForEmail error:", error)
      }
      setForgotSubmitted(true)
    } catch (err) {
      console.error("Forgot password submit error:", err)
      setForgotSubmitted(true)
    } finally {
      setForgotSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Welcome to LocalFind</CardTitle>
          <CardDescription>Sign in to manage your business or browse listings</CardDescription>
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

              <div className="flex items-center justify-between">
                <div className="h-5" />
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setShowForgot(true)
                    setForgotSubmitted(false)
                    setForgotError("")
                    setForgotEmail(email)
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
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
                  placeholder="Create a password"
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

              <Button onClick={handleSignup} disabled={isLoading || !signupEmail || !signupPassword || !signupName.trim()} className="w-full">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </TabsContent>
          </Tabs>

          <Button variant="ghost" onClick={onClose} className="w-full mt-4">
            Cancel
          </Button>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
          </DialogHeader>
          {!forgotSubmitted ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              {forgotError && (
                <Alert variant="destructive">
                  <AlertDescription>{forgotError}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowForgot(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotSending || !forgotEmail}>
                  {forgotSending ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  If an account exists for that email, we sent a password reset link. Please check your inbox.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button onClick={() => setShowForgot(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
