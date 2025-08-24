"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, LogOut, Mail, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth-utils"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

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
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [forgotError, setForgotError] = useState("")
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const { user, isInitializing, signOut: signOutUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setError("")
    try {
      const { error } = await signInWithEmail(email, password)
      if (error) throw error
      
      // The auth state change listener will handle the rest
      onClose()
      router.push("/dashboard")
    } catch (error) {
      console.error('Login error:', error)
      setError("Invalid email or password")
    }
  }

  const handleSignup = async () => {
    setSignupError("")
    setSignupSuccess("")
    if (!signupName.trim()) {
      setSignupError("Please enter your name.")
      return
    }
    try {
      const { error } = await signUpWithEmail(signupEmail, signupPassword, signupName)
      if (error) throw error
      
      setSignupSuccess("Account created! Please check your email to verify your account.")
      setSignupError("")
      setActiveTab("login")
    } catch (error) {
      console.error('Signup error:', error)
      setSignupError("Error creating account. Please try again.")
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

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setIsOAuthLoading(true)
      setError('')
      
      const { error } = await signInWithGoogle()
      
      if (error) {
        throw error
      }
      
      // The OAuth flow will handle the redirect and auth state update
      
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setIsOAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      onClose()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show loading state while initializing auth
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>You're now signed in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || 'User'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to user icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="text-center">
              {user.name && (
                <h3 className="text-xl font-semibold mb-1">
                  Welcome back, {user.name.split(' ')[0]}!
                </h3>
              )}
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                You're now signed in
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 w-full">
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
            <Button 
              onClick={() => {
                onClose();
                router.push('/dashboard');
              }}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
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

              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing in..." : "Continue with Email"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isOAuthLoading}
                  className="w-full"
                >
                  {isOAuthLoading ? (
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Image 
                      src="/google-logo.svg" 
                      alt="Google" 
                      width={16} 
                      height={16} 
                      className="mr-2"
                    />
                  )}
                  Continue with Google
                </Button>
              </div>

              {/* Extra visible link for better discoverability on homepage modal */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setShowForgot(true)
                    setForgotSubmitted(false)
                    setForgotError("")
                    setForgotEmail(email)
                  }}
                  className="text-sm"
                >
                  Forgot password?
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

              <div className="space-y-4">
                <Button 
                  onClick={handleSignup} 
                  disabled={isLoading || !signupEmail || !signupPassword || !signupName.trim()} 
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? "Creating Account..." : "Sign up with Email"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isOAuthLoading}
                  className="w-full"
                >
                  {isOAuthLoading ? (
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Image 
                      src="/google-logo.svg" 
                      alt="Google" 
                      width={16} 
                      height={16} 
                      className="mr-2"
                    />
                  )}
                  Continue with Google
                </Button>
              </div>
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
