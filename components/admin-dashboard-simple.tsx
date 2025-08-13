"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, CheckCircle } from "lucide-react"

export function AdminDashboardSimple() {
  const { user, isLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      // Simple admin check - any logged in user is admin for testing
      setIsAdmin(true)
      console.log('User logged in:', user.email)
      console.log('Admin access granted')
    }
  }, [user])

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to access the admin dashboard.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Current email:</strong> {user.email}
            </p>
          </div>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In with Admin Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>Welcome to the admin panel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">✅ Admin Access Granted</h3>
                <p className="text-green-700">You have successfully logged in as an admin.</p>
                <p className="text-sm text-green-600 mt-2">
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">🔧 Next Steps</h3>
                <ul className="text-blue-700 mt-2 space-y-1">
                  <li>• Set up your database tables</li>
                  <li>• Create test businesses for approval</li>
                  <li>• Configure your Supabase environment</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Go to Business Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 