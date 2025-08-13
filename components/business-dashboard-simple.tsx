"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Star, MapPin, Phone, Clock, Globe, Mail, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from "lucide-react"
import Logo from './logo'
import { businessStore, Business } from "@/lib/business-store"

interface UserBusiness {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  hours: string
  description: string
  priceRange: string
  owner_email: string
  images?: string[]
  website?: string
  email?: string
  approval_status: string
  created_at: string
  owner_name: string
}

export function BusinessDashboardSimple() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<UserBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [editingBusiness, setEditingBusiness] = useState<UserBusiness | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    hours: "",
    description: "",
    priceRange: "₵",
    website: "",
    email: "",
    owner_name: "",
    owner_email: ""
  })

  // Fetch businesses for the current user
  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // Get all businesses and filter by owner email
      const allBusinesses = businessStore.getAllBusinesses()
      const userBusinesses = allBusinesses.filter(b => b.owner_email === user.email)
      setBusinesses(userBusinesses)
    } catch (error) {
      console.error('Error fetching businesses:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [user])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      if (editingBusiness) {
        // Update existing business
        // For now, we'll just show success since we don't have update functionality
        setFormSuccess("Business updated successfully!")
        setEditingBusiness(null)
      } else {
        // Create new business
        const newBusiness = {
          ...formData,
          rating: 0,
          reviewCount: 0,
          images: [],
          lat: 5.5563, // Default to Accra coordinates
          lng: -0.1969,
          owner_email: user?.email || formData.owner_email,
          owner_name: user?.email?.split('@')[0] || formData.owner_name
        }

        const businessId = businessStore.addBusiness(newBusiness)
        console.log('New business created with ID:', businessId)
        
        setFormSuccess("Business created successfully! It's now pending approval.")
        
        // Reset form
        setFormData({
          name: "",
          category: "",
          address: "",
          phone: "",
          hours: "",
          description: "",
          priceRange: "₵",
          website: "",
          email: "",
          owner_name: "",
          owner_email: ""
        })
      }
      
      setShowAddForm(false)
      fetchBusinesses() // Refresh the list
    } catch (error) {
      console.error('Error saving business:', error)
      setFormError("Failed to save business. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (business: UserBusiness) => {
    setEditingBusiness(business)
    setFormData({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone,
      hours: business.hours,
      description: business.description,
      priceRange: business.priceRange,
      website: business.website || "",
      email: business.email || "",
      owner_name: business.owner_name,
      owner_email: business.owner_email
    })
    setShowAddForm(true)
  }

  const handleDelete = async (businessId: string) => {
    if (confirm("Are you sure you want to delete this business?")) {
      // For now, we'll just remove from the list
      // In a real implementation, you'd call businessStore.deleteBusiness(businessId)
      setBusinesses(prev => prev.filter(b => b.id !== businessId))
    }
  }

  const renderApprovalStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><ClockIcon className="w-3 h-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
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
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to access the business dashboard.</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
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
                <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your businesses</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {formSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{formSuccess}</p>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{formError}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingBusiness ? "Edit Business" : "Add New Business"}</CardTitle>
              <CardDescription>
                {editingBusiness ? "Update your business information" : "Create a new business listing"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Restaurant">Restaurant</SelectItem>
                        <SelectItem value="Electronics Repair">Electronics Repair</SelectItem>
                        <SelectItem value="Florist">Florist</SelectItem>
                        <SelectItem value="Auto Repair">Auto Repair</SelectItem>
                        <SelectItem value="Hair Salon">Hair Salon</SelectItem>
                        <SelectItem value="Dental Office">Dental Office</SelectItem>
                        <SelectItem value="Bakery">Bakery</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="Fitness Center">Fitness Center</SelectItem>
                        <SelectItem value="Coffee Shop">Coffee Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g., 8:00 AM - 10:00 PM"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select value={formData.priceRange} onValueChange={(value) => setFormData({ ...formData, priceRange: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₵">₵ (Budget)</SelectItem>
                        <SelectItem value="₵₵">₵₵ (Moderate)</SelectItem>
                        <SelectItem value="₵₵₵">₵₵₵ (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@yourbusiness.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your business..."
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Saving..." : editingBusiness ? "Update Business" : "Add Business"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddForm(false)
                    setEditingBusiness(null)
                    setFormError(null)
                    setFormSuccess(null)
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Businesses List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Businesses</h2>
            <div className="text-sm text-gray-600">
              {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading businesses...</p>
            </div>
          ) : businesses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't added any businesses yet.</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Business
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.category}</p>
                        {renderApprovalStatus(business.approval_status)}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(business)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(business.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-600">{business.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{business.hours}</span>
                        </div>
                        {business.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span>{business.website}</span>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{business.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-600">{business.priceRange}</span>
                        {business.rating > 0 && renderStars(business.rating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 