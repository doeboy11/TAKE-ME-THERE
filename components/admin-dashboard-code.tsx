"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, MapPin, Phone, Mail, Globe, Shield, LogOut, Home, Building } from "lucide-react"
import Logo from './logo'
import { businessStore } from "@/lib/business-store"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Business } from "@/lib/business-store"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminDashboardCode() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([])
  const [approvedBusinesses, setApprovedBusinesses] = useState<Business[]>([])
  const [rejectedBusinesses, setRejectedBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data } = await supabase.auth.getUser()
        const user = data.user
        if (!user) {
          setIsAdmin(false)
          return
        }
        const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role
        // Allow role-based admin only
        if (role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClientComponentClient()
      await supabase.auth.signOut()
    } catch {}
    window.location.href = "/login"
  }

  const fetchPendingBusinesses = async () => {
    try {
      console.log('🔍 Admin: Fetching pending businesses...')
      const pending = await businessStore.getPendingBusinesses()
      console.log('🔍 Admin: Pending businesses result:', pending)
      setPendingBusinesses(pending)
      console.log('🔍 Admin: Loaded pending businesses:', pending.length)
    } catch (error) {
      console.error('❌ Admin: Error fetching businesses:', error)
    }
  }

  const fetchAllBusinesses = async () => {
    try {
      const [pending, approved, rejected, all] = await Promise.all([
        businessStore.getPendingBusinesses(),
        businessStore.getApprovedBusinesses(),
        businessStore.getRejectedBusinesses(),
        businessStore.getAllBusinesses()
      ])
      
      setPendingBusinesses(pending)
      setApprovedBusinesses(approved)
      setRejectedBusinesses(rejected)
      setStats({
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        total: all.length
      })
    } catch (error) {
      console.error('Error fetching businesses:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchAllBusinesses()
    }
  }, [isAdmin])

  const handleApprove = async (businessId: string) => {
    setProcessing(true)
    try {
      const success = await businessStore.approveBusiness(businessId)
      if (success) {
        // Refresh the list
        await fetchAllBusinesses()
        console.log(`Business ${businessId} approved`)
      }
    } catch (error) {
      console.error('Error approving business:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (businessId: string) => {
    setProcessing(true)
    try {
      const success = await businessStore.rejectBusiness(businessId)
      if (success) {
        // Refresh the list
        await fetchAllBusinesses()
        console.log(`Business ${businessId} rejected`)
      }
    } catch (error) {
      console.error('Error rejecting business:', error)
    } finally {
      setProcessing(false)
    }
  }

  // Filter businesses based on search term and category
  const filterBusinesses = (businesses: Business[]) => {
    return businesses.filter(business => {
      const matchesSearch = searchTerm === "" || 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || business.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }

  const renderApprovalStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Show loading while checking admin status
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

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">Please sign in with an admin account.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
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
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  const pendingCount = stats.pending;
                  if (pendingCount > 0) {
                    alert(`You have ${pendingCount} pending business${pendingCount > 1 ? 'es' : ''} to review.`);
                  } else {
                    alert('No pending businesses to review.');
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Check Pending
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  alert(`Total businesses in directory: ${stats.total}`);
                }}
              >
                <Building className="h-4 w-4 mr-2" />
                View Stats
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  if (confirm('This will reset all data to initial state. Are you sure?')) {
                    try {
                      await businessStore.reset();
                      await fetchAllBusinesses();
                      alert('Data reset successfully!');
                    } catch (error) {
                      alert('Error resetting data: ' + error);
                    }
                  }
                }}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Reset Data
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const testBusiness = await businessStore.getAllBusinesses();
                    alert(`Supabase connection working! Found ${testBusiness.length} businesses.`);
                  } catch (error) {
                    alert('Supabase connection error: ' + error);
                  }
                }}
              >
                Test Connection
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                  alert(`Environment Check:\nURL: ${url ? 'Set' : 'Missing'}\nKey: ${key ? 'Set' : 'Missing'}`);
                }}
              >
                Check Env Vars
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    // Test environment variables
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                    
                    let result = `🔍 Supabase Configuration Check:\n\n`;
                    result += `URL: ${url ? '✅ Set' : '❌ Missing'}\n`;
                    result += `Key: ${key ? '✅ Set' : '❌ Missing'}\n\n`;
                    
                    if (!url || !key) {
                      result += `❌ Environment variables are missing!\n\n`;
                      result += `Please create a .env.local file in your buss directory with:\n`;
                      result += `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n`;
                      result += `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\n\n`;
                      result += `Then restart your development server.`;
                      alert(result);
                      return;
                    }
                    
                    // Test connection
                    const testBusiness = await businessStore.getAllBusinesses();
                    result += `✅ Connection successful!\n`;
                    result += `Found ${testBusiness.length} businesses in database.`;
                    alert(result);
                    
                  } catch (error) {
                    alert(`❌ Connection failed:\n${error}`);
                  }
                }}
              >
                Full Diagnostic
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await businessStore.testTableStructure();
                    if (result.success) {
                      alert('✅ Table structure is correct!');
                    } else {
                      alert(`❌ Table structure error:\n${result.error}\n\nThis might mean:\n1. The 'businesses' table doesn't exist\n2. The table has wrong column names\n3. Row Level Security (RLS) is blocking access`);
                    }
                  } catch (error) {
                    alert(`❌ Test failed:\n${error}`);
                  }
                }}
              >
                Test Table
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await businessStore.testConnection();
                    if (result.success) {
                      alert('✅ Supabase connection successful!');
                    } else {
                      alert(`❌ Connection failed:\n${result.error}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`);
                    }
                  } catch (error) {
                    alert(`❌ Connection test failed:\n${error}`);
                  }
                }}
              >
                Test Connection
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    // Test creating a business
                    const testBusiness = {
                      name: 'Test Business ' + Date.now(),
                      category: 'Test',
                      description: 'This is a test business',
                      address: 'Test Address',
                      phone: '+1234567890',
                      hours: '9-5',
                      price_range: '₵₵',
                      owner_email: 'test@example.com',
                      owner_name: 'Test Owner',
                      email: 'test@business.com'
                    };
                    
                    const { data, error, status } = await businessStore.create(testBusiness);
                    
                    if (error) {
                      alert(`❌ Create test failed:\n${error}`);
                    } else {
                      alert(`✅ Create test successful!\nCreated business: ${data?.[0]?.name}\nStatus: ${status}`);
                    }
                  } catch (error) {
                    alert(`❌ Create test failed:\n${error}`);
                  }
                }}
              >
                Test Create
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
                <Badge variant="secondary" className="ml-1">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Approved</span>
                <Badge variant="secondary" className="ml-1">
                  {stats.approved}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Rejected</span>
                <Badge variant="secondary" className="ml-1">
                  {stats.rejected}
                </Badge>
              </TabsTrigger>
          </TabsList>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search businesses by name, owner, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {filterBusinesses(pendingBusinesses).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== "all" 
                      ? "No businesses match your search criteria." 
                      : "No pending businesses to review."}
                  </p>
                  {(searchTerm || selectedCategory !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filterBusinesses(pendingBusinesses).map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                          {renderApprovalStatus(business.approval_status)}
                          <Badge variant="outline" className="text-xs">
                            {business.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{business.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Owner: {business.owner_name}</span>
                          <span>Created: {new Date(business.created_at).toLocaleDateString()}</span>
                          <span>Price: {business.price_range}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(business.id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(business.id)}
                          disabled={processing}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{business.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{business.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{business.email}</span>
                          </div>
                          {business.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span>{business.website}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p><strong>Owner:</strong> {business.owner_name}</p>
                          <p><strong>Owner Email:</strong> {business.owner_email}</p>
                          <p><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                          <p><strong>Category:</strong> {business.category}</p>
                          <p><strong>Price Range:</strong> {business.price_range}</p>
                        </div>
                      </div>

                      {/* Images */}
                      {business.images && business.images.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Business Images</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {business.images.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Business photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* About Company */}
                      {business.aboutCompany && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">About Company</h4>
                          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.aboutCompany}</p>
                        </div>
                      )}

                      {/* Mission */}
                      {business.mission && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.mission}</p>
                        </div>
                      )}

                      {/* Company Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
                          <div className="space-y-2 text-sm">
                            {business.foundedYear && <p><strong>Founded:</strong> {business.foundedYear}</p>}
                            {business.employeeCount && <p><strong>Employees:</strong> {business.employeeCount}</p>}
                            {business.awards && <p><strong>Awards:</strong> {business.awards}</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Accessibility:</strong> {business.accessibility ? 'Yes' : 'No'}</p>
                            <p><strong>Parking:</strong> {business.parking ? 'Yes' : 'No'}</p>
                            <p><strong>WiFi:</strong> {business.wifi ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      {business.specialties && business.specialties.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {business.services && business.services.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Amenities */}
                      {business.amenities && business.amenities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Methods */}
                      {business.paymentMethods && business.paymentMethods.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.paymentMethods.map((method, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {business.languages && business.languages.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.languages.map((language, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Media */}
                      {business.socialMedia && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {business.socialMedia.facebook && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Facebook:</span>
                                <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              </div>
                            )}
                            {business.socialMedia.instagram && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Instagram:</span>
                                <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              </div>
                            )}
                            {business.socialMedia.twitter && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Twitter:</span>
                                <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              </div>
                            )}
                            {business.socialMedia.linkedin && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">LinkedIn:</span>
                                <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes Section */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Admin Notes</h4>
                        <Textarea
                          placeholder="Add notes about this business..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{business.name}</h3>
                        {renderApprovalStatus(business.approval_status)}
                      </div>
                      <p className="text-gray-600">{business.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(business.id)}
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{business.email}</span>
                        </div>
                        {business.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span>{business.website}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p><strong>Owner:</strong> {business.owner_name}</p>
                        <p><strong>Owner Email:</strong> {business.owner_email}</p>
                        <p><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                        <p><strong>Category:</strong> {business.category}</p>
                         <p><strong>Price Range:</strong> {business.price_range}</p>
                      </div>
                    </div>

                    {/* Images */}
                    {business.images && business.images.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Business Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {business.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Business photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* About Company */}
                    {business.aboutCompany && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">About Company</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.aboutCompany}</p>
                      </div>
                    )}

                    {/* Mission */}
                    {business.mission && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.mission}</p>
                      </div>
                    )}

                    {/* Company Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
                        <div className="space-y-2 text-sm">
                          {business.foundedYear && <p><strong>Founded:</strong> {business.foundedYear}</p>}
                          {business.employeeCount && <p><strong>Employees:</strong> {business.employeeCount}</p>}
                          {business.awards && <p><strong>Awards:</strong> {business.awards}</p>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Accessibility:</strong> {business.accessibility ? 'Yes' : 'No'}</p>
                          <p><strong>Parking:</strong> {business.parking ? 'Yes' : 'No'}</p>
                          <p><strong>WiFi:</strong> {business.wifi ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    {business.specialties && business.specialties.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {business.services && business.services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {business.amenities && business.amenities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Methods */}
                    {business.paymentMethods && business.paymentMethods.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.paymentMethods.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {business.languages && business.languages.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media */}
                    {business.socialMedia && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {business.socialMedia.facebook && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Facebook:</span>
                              <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.instagram && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Instagram:</span>
                              <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.twitter && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Twitter:</span>
                              <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.linkedin && (
                  <div className="flex items-center space-x-2">
                              <span className="font-medium">LinkedIn:</span>
                              <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes Section */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Notes</h4>
                      <Textarea
                        placeholder="Add notes about this business..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    {renderApprovalStatus(business.approval_status)}
                      </div>
                      <p className="text-gray-600">{business.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(business.id)}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{business.email}</span>
                        </div>
                        {business.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span>{business.website}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p><strong>Owner:</strong> {business.owner_name}</p>
                        <p><strong>Owner Email:</strong> {business.owner_email}</p>
                        <p><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                        <p><strong>Category:</strong> {business.category}</p>
                         <p><strong>Price Range:</strong> {business.price_range}</p>
                      </div>
                    </div>

                    {/* Images */}
                    {business.images && business.images.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Business Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {business.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Business photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* About Company */}
                    {business.aboutCompany && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">About Company</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.aboutCompany}</p>
                      </div>
                    )}

                    {/* Mission */}
                    {business.mission && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{business.mission}</p>
                      </div>
                    )}

                    {/* Company Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
                        <div className="space-y-2 text-sm">
                          {business.foundedYear && <p><strong>Founded:</strong> {business.foundedYear}</p>}
                          {business.employeeCount && <p><strong>Employees:</strong> {business.employeeCount}</p>}
                          {business.awards && <p><strong>Awards:</strong> {business.awards}</p>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Accessibility:</strong> {business.accessibility ? 'Yes' : 'No'}</p>
                          <p><strong>Parking:</strong> {business.parking ? 'Yes' : 'No'}</p>
                          <p><strong>WiFi:</strong> {business.wifi ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    {business.specialties && business.specialties.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {business.services && business.services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {business.amenities && business.amenities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Methods */}
                    {business.paymentMethods && business.paymentMethods.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.paymentMethods.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {business.languages && business.languages.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {business.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media */}
                    {business.socialMedia && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {business.socialMedia.facebook && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Facebook:</span>
                              <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.instagram && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Instagram:</span>
                              <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.twitter && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Twitter:</span>
                              <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {business.socialMedia.linkedin && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">LinkedIn:</span>
                              <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes Section */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Notes</h4>
                      <Textarea
                        placeholder="Add notes about this business..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 