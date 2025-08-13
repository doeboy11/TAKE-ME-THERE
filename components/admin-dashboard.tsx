"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, MapPin, Phone, Mail, Globe, Shield } from "lucide-react"
import Logo from './logo'

interface PendingBusiness {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  approval_status: string
  admin_notes: string
  created_at: string
  owner_email: string
  owner_name: string
}

export function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  // TEMPORARY: Set this to true to grant admin access to any logged-in user for testing
  const TEMP_ADMIN_OVERRIDE = true // Set to false in production
  
  // Special admin email for dedicated admin access
  const SPECIAL_ADMIN_EMAIL = 'admin@localfind.gh'
  
  // Add your own email here for admin access
  const YOUR_ADMIN_EMAIL = 'your-email@example.com' // Replace with your actual email
  
  const isAdmin = TEMP_ADMIN_OVERRIDE || 
                  user?.email === SPECIAL_ADMIN_EMAIL ||
                  user?.email === YOUR_ADMIN_EMAIL ||
                  user?.email?.includes('admin') || 
                  user?.email?.includes('@yourdomain.com') // Adjust as needed

  const fetchPendingBusinesses = async () => {
    try {
      console.log('Fetching pending businesses...')
      const { data, error } = await supabase
        .from('pending_business_approvals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending businesses:', error)
        // Try fetching from businesses table directly as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('businesses')
          .select('*')
          .eq('approval_status', 'pending')
          .order('createdAt', { ascending: false })
        
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
        } else {
          console.log('Fallback query successful, found businesses:', fallbackData?.length || 0)
          setPendingBusinesses(fallbackData || [])
        }
      } else {
        console.log('Successfully fetched pending businesses:', data?.length || 0)
        setPendingBusinesses(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchPendingBusinesses()
    }
  }, [user, isAdmin])

  const handleApprove = async (businessId: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          admin_notes: adminNotes || null
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error approving business:', error)
      } else {
        await fetchPendingBusinesses()
        setSelectedBusiness(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (businessId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          approval_status: 'rejected',
          admin_notes: adminNotes
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error rejecting business:', error)
      } else {
        await fetchPendingBusinesses()
        setSelectedBusiness(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRequestMoreInfo = async (businessId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide details about what information is needed')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          approval_status: 'requires_more_info',
          admin_notes: adminNotes
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error requesting more info:', error)
      } else {
        await fetchPendingBusinesses()
        setSelectedBusiness(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const renderApprovalStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'requires_more_info':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Needs Info</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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
          <div className="space-y-2">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <div>
              <Button variant="link" onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </div>
          </div>
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
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current email:</strong> {user.email}
              </p>
              <p className="text-xs text-blue-700">
                To get admin access, your email must contain "admin" or be from your domain.
              </p>
              {TEMP_ADMIN_OVERRIDE && (
                <p className="text-xs text-green-700 mt-2">
                  <strong>Note:</strong> Admin override is currently enabled for testing.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/login'}>
                Sign In with Admin Account
              </Button>
              <div>
                <Button variant="link" onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="lg" variant="default" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage business approvals</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Site
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({pendingBusinesses.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Approved</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Rejected</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Loading pending businesses...</p>
              </div>
            ) : pendingBusinesses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                  <p className="text-gray-600">All businesses have been reviewed!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-2">
                            <span>{business.name}</span>
                            {renderApprovalStatus(business.approval_status)}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {business.description}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBusiness(business)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            {business.address}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Phone className="w-4 h-4" />
                            {business.phone}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail className="w-4 h-4" />
                            {business.email}
                          </div>
                          {business.website && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Globe className="w-4 h-4" />
                              {business.website}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Owner:</span>
                            <div className="text-gray-600">{business.owner_name}</div>
                            <div className="text-gray-500">{business.owner_email}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Submitted:</span>
                            <div className="text-gray-600">
                              {new Date(business.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Approved Businesses</h3>
                <p className="text-gray-600">View approved businesses on the main site</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Rejected Businesses</h3>
                <p className="text-gray-600">Businesses that were not approved</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Review Business</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBusiness(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Business Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Name:</strong> {selectedBusiness.name}</div>
                    <div><strong>Description:</strong> {selectedBusiness.description}</div>
                    <div><strong>Address:</strong> {selectedBusiness.address}</div>
                    <div><strong>Phone:</strong> {selectedBusiness.phone}</div>
                    <div><strong>Email:</strong> {selectedBusiness.email}</div>
                    {selectedBusiness.website && (
                      <div><strong>Website:</strong> {selectedBusiness.website}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Owner Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div><strong>Name:</strong> {selectedBusiness.owner_name}</div>
                    <div><strong>Email:</strong> {selectedBusiness.owner_email}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApprove(selectedBusiness.id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRequestMoreInfo(selectedBusiness.id)}
                  disabled={processing}
                  variant="outline"
                  className="flex-1"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Request Info
                </Button>
                <Button
                  onClick={() => handleReject(selectedBusiness.id)}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 