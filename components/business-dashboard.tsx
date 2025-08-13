"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Star, MapPin, Phone, Clock, Globe, Mail, Users, Calendar, Home, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from "lucide-react"
import Logo from './logo'
import { businessStore } from "@/lib/business-store"

interface Business {
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
  ownerId: string
  images?: string[]
  // Enhanced company information
  website?: string
  email?: string
  foundedYear?: string
  employeeCount?: string
  specialties?: string[]
  awards?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  amenities?: string[]
  paymentMethods?: string[]
  languages?: string[]
  accessibility?: boolean
  parking?: boolean
  wifi?: boolean
  aboutCompany?: string
  mission?: string
  services?: string[]
  // Approval status
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'requires_more_info'
  adminNotes?: string
  approvedAt?: string
  approvedBy?: string
  // Additional fields for business store compatibility
  owner_email?: string
  owner_name?: string
  approval_status?: string
  created_at?: string
  lat?: number
  lng?: number
}

const mockUserBusinesses: Business[] = [
  {
    id: "1",
    name: "Auntie Muni's Chop Bar",
    category: "Restaurant",
    rating: 4.5,
    reviewCount: 127,
    address: "Oxford Street, Osu, Accra",
    phone: "+233 24 123 4567",
    hours: "8:00 AM - 10:00 PM",
    description: "Authentic Ghanaian cuisine with jollof rice, banku, and fresh tilapia",
    priceRange: "₵₵",
    ownerId: "1",
    images: [
      "/placeholder.svg?height=400&width=600&text=Restaurant+Interior",
      "/placeholder.svg?height=400&width=600&text=Local+Dishes",
      "/placeholder.svg?height=400&width=600&text=Dining+Area",
    ],
    website: "https://auntiemuni.com.gh",
    email: "info@auntiemuni.com.gh",
    foundedYear: "2010",
    employeeCount: "15-25",
    specialties: ["Jollof Rice", "Banku & Tilapia", "Kelewele"],
    awards: "Best Local Restaurant 2023 - Accra Food Awards",
    aboutCompany:
      "Family-owned chop bar serving authentic Ghanaian cuisine for over 10 years. We use traditional recipes and fresh local ingredients.",
    mission:
      "To bring the authentic taste of Ghana to our community through fresh ingredients and traditional cooking methods.",
    services: ["Dine-in", "Takeaway", "Catering", "Private Events"],
    amenities: ["Outdoor Seating", "Local Music", "Private Dining Area"],
    paymentMethods: ["Cash", "Mobile Money", "Credit Cards"],
    languages: ["English", "Twi", "Ga"],
    accessibility: true,
    parking: true,
    wifi: true,
  },
]

export function BusinessDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [customCategory, setCustomCategory] = useState("")
  const [priceAmount, setPriceAmount] = useState<string>("")

  const [visitorRows, setVisitorRows] = useState<{
    id: string
    business: { id: string; name: string }
    user_id: string | null
    session_id: string | null
    user_agent: string | null
    viewed_at: string
  }[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    hours: "",
    description: "",
    priceRange: "$",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    images: [] as string[],
    website: "",
    email: "",
    foundedYear: "",
    employeeCount: "",
    specialties: [] as string[],
    awards: "",
    aboutCompany: "",
    mission: "",
    services: [] as string[],
    amenities: [] as string[],
    paymentMethods: [] as string[],
    languages: [] as string[],
    accessibility: false,
    parking: false,
    wifi: false,
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  })

  const [uploadingImages, setUploadingImages] = useState(false)

  const categories = [
    "Restaurant",
    "Fast Food",
    "Cafe",
    "Bar & Grill",
    "Bakery",
    "Food Truck",
    "Electronics Repair",
    "Computer Repair",
    "Phone Repair",
    "Appliance Repair",
    "Florist",
    "Garden Center",
    "Landscaping",
    "Fitness Center",
    "Yoga Studio",
    "Personal Training",
    "Martial Arts",
    "Dance Studio",
    "Coffee Shop",
    "Tea House",
    "Juice Bar",
    "Auto Repair",
    "Car Wash",
    "Auto Parts",
    "Tire Shop",
    "Oil Change",
    "Hair Salon",
    "Barber Shop",
    "Nail Salon",
    "Spa",
    "Massage Therapy",
    "Clothing Store",
    "Shoe Store",
    "Jewelry Store",
    "Accessories",
    "Grocery Store",
    "Convenience Store",
    "Pharmacy",
    "Health Food Store",
    "Bank",
    "Credit Union",
    "Insurance",
    "Real Estate",
    "Legal Services",
    "Medical Clinic",
    "Dental Office",
    "Veterinary Clinic",
    "Optometry",
    "Hotel",
    "Bed & Breakfast",
    "Vacation Rental",
    "Gas Station",
    "Car Rental",
    "Moving Services",
    "Storage",
    "Pet Store",
    "Pet Grooming",
    "Pet Boarding",
    "Home Improvement",
    "Plumbing",
    "Electrical",
    "HVAC",
    "Roofing",
    "Photography",
    "Event Planning",
    "Catering",
    "Entertainment",
    "Education",
    "Tutoring",
    "Music Lessons",
    "Art Classes",
    "Other",
  ]

  const priceRanges = ["₵", "₵₵", "₵₵₵", "₵₵₵₵"]
  const employeeCountOptions = ["1-5", "6-10", "11-25", "26-50", "51-100", "100+"]

  const commonServices = [
    "Dine-in",
    "Takeout",
    "Delivery",
    "Catering",
    "Private Events",
    "Online Ordering",
    "Consultation",
    "Installation",
    "Maintenance",
    "Repair",
    "Emergency Service",
    "Appointment Only",
    "Walk-ins Welcome",
    "Home Service",
    "Mobile Service",
  ]

  const commonAmenities = [
    "Parking",
    "WiFi",
    "Wheelchair Accessible",
    "Outdoor Seating",
    "Air Conditioning",
    "Restrooms",
    "Waiting Area",
    "Kids Friendly",
    "Pet Friendly",
    "Private Rooms",
    "Music",
    "TV",
    "Bar",
    "Gift Cards",
    "Loyalty Program",
  ]

  const paymentOptions = [
    "Cash",
    "Mobile Money",
    "Credit Cards",
    "Debit Cards",
    "Bank Transfer",
    "Cheque",
    "MTN Mobile Money",
    "Vodafone Cash",
    "AirtelTigo Money",
  ]

  const languageOptions = ["English", "Twi", "Ga", "Ewe", "Fante", "Hausa", "Dagbani", "French", "Other"]

  // Fetch businesses from Supabase
  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([])
      setLoading(false)
      return
    }
    setLoading(true)
    console.log('🔍 Fetching businesses for user:', user.id)
    const { data, error } = await businessStore.getByOwnerId(user.id)
    
    console.log('🔍 Business query result:', { data, error, userCount: data?.length || 0 })
    
    if (data) {
      // Map database fields to interface
      const mappedBusinesses = data.map((business: any) => ({
        ...business,
        ownerId: business.owner_id,
        approvalStatus: business.approval_status,
        adminNotes: business.admin_notes,
        approvedAt: business.approved_at,
        approvedBy: business.approved_by,
        // Map other fields that might be in snake_case
        reviewCount: business.review_count || 0,
        priceRange: business.price_range || "₵",
        aboutCompany: business.about_company,
        employeeCount: business.employee_count,
        foundedYear: business.founded_year,
        lat: business.lat,
        lng: business.lng,
      }))
      console.log('🔍 Mapped businesses:', mappedBusinesses)
      setBusinesses(mappedBusinesses)
    } else {
      console.log('🔍 No businesses found for user')
      setBusinesses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return
      setAnalyticsLoading(true)
      try {
        const views = await businessStore.getBusinessViewsForOwner(user.id)
        setVisitorRows(views)
      } catch (e) {
        console.error('Error loading analytics:', e)
        setVisitorRows([])
      } finally {
        setAnalyticsLoading(false)
      }
    }
    loadAnalytics()
  }, [user])

  // CREATE or UPDATE business
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    // Prevent submit while images are still uploading or when blob URLs are present
    const hasBlobImages = (formData.images || []).some((u) => typeof u === 'string' && u.startsWith('blob:'))
    if (uploadingImages || hasBlobImages) {
      setFormError('Please wait for images to finish uploading before submitting.');
      setFormLoading(false);
      return;
    }
    try {
      if (editingBusiness) {
        // UPDATE
        const { id, ...rest } = editingBusiness;
        const { lat: _lat, lng: _lng, ...safeForm } = formData;
        // Ensure only persisted (non-blob) URLs are sent
        const imagesClean = (safeForm.images || []).filter((u) => typeof u === 'string' && !u.startsWith('blob:'))
        const updatedBusiness = { ...safeForm, images: imagesClean, id: editingBusiness.id };
        const { data, error, status } = await businessStore.update(updatedBusiness);
        console.log("Update response:", { data, error, status });
        if (error) {
          const msg = (error as any)?.message || (error as any)?.hint || (error as any)?.details || 'Update failed'
          setFormError(msg);
        } else if (data && data.length > 0) {
          await fetchBusinesses();
          setEditingBusiness(null);
          setShowAddForm(false);
          setFormSuccess("Business updated successfully!");
          setFormData({
            name: "",
            category: "",
            address: "",
            phone: "",
            hours: "",
            description: "",
            priceRange: "",
            lat: undefined,
            lng: undefined,
            images: [],
            website: "",
            email: "",
            foundedYear: "",
            employeeCount: "",
            specialties: [],
            awards: "",
            aboutCompany: "",
            mission: "",
            services: [],
            amenities: [],
            paymentMethods: [],
            languages: [],
            accessibility: false,
            parking: false,
            wifi: false,
            socialMedia: {
              facebook: "",
              instagram: "",
              twitter: "",
              linkedin: "",
            },
          });
        } else {
          setFormError("Update failed. No data returned.");
        }
      } else {
        // CREATE
        // Always set approval_status to 'pending' for new businesses
        // Ensure only persisted (non-blob) URLs are sent
        const imagesClean = (formData.images || []).filter((u) => typeof u === 'string' && !u.startsWith('blob:'))
        const businessToCreate = { ...formData, images: imagesClean, ownerId: user?.id, approval_status: 'pending' };
        console.log('🔍 Creating new business with data:', businessToCreate)
        const { data, error, status } = await businessStore.create(businessToCreate);
        console.log("Insert response:", { data, error, status });
        if (error) {
          const msg = (error as any)?.message || (error as any)?.hint || (error as any)?.details || 'Insert failed'
          setFormError(msg);
        } else if (data && data.length > 0) {
          console.log('🔍 Business created successfully, fetching updated list...')
          await fetchBusinesses();
          setFormSuccess("Business submitted for approval! We'll review it and get back to you soon.");
          // Show success message for 3 seconds before closing form
          setTimeout(() => {
            setShowAddForm(false);
            setFormSuccess(null);
            setFormData({
              name: "",
              category: "",
              address: "",
              phone: "",
              hours: "",
              description: "",
              priceRange: "$",
              lat: undefined,
              lng: undefined,
              images: [],
              website: "",
              email: "",
              foundedYear: "",
              employeeCount: "",
              specialties: [],
              awards: "",
              aboutCompany: "",
              mission: "",
              services: [],
              amenities: [],
              paymentMethods: [],
              languages: [],
              accessibility: false,
              parking: false,
              wifi: false,
              socialMedia: {
                facebook: "",
                instagram: "",
                twitter: "",
                linkedin: "",
              },
            });
          }, 3000);
        } else {
          setFormError("Insert failed. No data returned.");
        }
      }
    } catch (err) {
      console.error('handleSubmit exception:', err)
      const msg = (err as any)?.message || 'Unexpected error'
      setFormError(msg)
    } finally {
      setFormLoading(false);
    }
  };

  // EDIT business
  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setShowAddForm(true)
    setFormData({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone,
      hours: business.hours,
      description: business.description,
      priceRange: business.priceRange,
      lat: business.lat,
      lng: business.lng,
      images: business.images || [],
      website: business.website || "",
      email: business.email || "",
      foundedYear: business.foundedYear || "",
      employeeCount: business.employeeCount || "",
      specialties: business.specialties || [],
      awards: business.awards || "",
      aboutCompany: business.aboutCompany || "",
      mission: business.mission || "",
      services: business.services || [],
      amenities: business.amenities || [],
      paymentMethods: business.paymentMethods || [],
      languages: business.languages || [],
      accessibility: business.accessibility || false,
      parking: business.parking || false,
      wifi: business.wifi || false,
      socialMedia: {
        facebook: business.socialMedia?.facebook || "",
        instagram: business.socialMedia?.instagram || "",
        twitter: business.socialMedia?.twitter || "",
        linkedin: business.socialMedia?.linkedin || "",
      },
    })
    // Prefill helpers
    setCustomCategory("")
    const amount = (business.priceRange || "").replace(/[^0-9.,]/g, "").replace(",", ".")
    setPriceAmount(amount)
  }

  // DELETE business
  const handleDelete = async (businessId: string) => {
    setLoading(true)
    
    try {
      // First, get the business to find its images
      const { data: businessData } = await businessStore.getById(businessId);

      // Delete the business
      const { error: deleteError } = await businessStore.delete(businessId);

      if (deleteError) {
        console.error('Error deleting business:', deleteError)
        const msg = (deleteError as any)?.message || (deleteError as any)?.hint || (deleteError as any)?.details || JSON.stringify(deleteError)
        setFormError(`Failed to delete business: ${msg}`)
        return
      }

      // Clean up images from storage if they exist
      if (businessData?.images && businessData.images.length > 0) {
        const imageFiles = businessData.images
          .filter((url: string) => url.includes('supabase.co'))
          .map((url: string) => {
            const urlParts = url.split('/')
            return urlParts[urlParts.length - 1]
          })

        if (imageFiles.length > 0) {
          const { error: storageError } = await businessStore.deleteImages(imageFiles);

          if (storageError) {
            console.error('Error deleting images from storage:', storageError)
            // Don't fail the business deletion if image cleanup fails
          }
        }
      }

    await fetchBusinesses()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      setFormError('Failed to delete business. Please try again.')
    } finally {
    setLoading(false)
    }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Limit to max 5 total
    const remainingSlots = Math.max(0, 5 - formData.images.length)
    const toProcess = Math.min(files.length, remainingSlots)
    if (toProcess === 0) return

    setUploadingImages(true)

    // 1) Create local preview URLs immediately
    const tempUrls: string[] = []
    for (let i = 0; i < toProcess; i++) {
      const file = files[i]
      if (file && file.type.startsWith("image/")) {
        const tempUrl = URL.createObjectURL(file)
        tempUrls.push(tempUrl)
      }
    }

    // Append temp previews to form state now
    const baseIndex = formData.images.length
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...tempUrls].slice(0, 5) }))

    // 2) Upload and replace temp URLs with final public URLs
    try {
      for (let i = 0; i < toProcess; i++) {
        const file = files[i]
        if (!file || !file.type.startsWith("image/")) continue

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data, error } = await businessStore.uploadImage(fileName, file)
        if (error) {
          console.error('Error uploading image:', error)
          setFormError(`Failed to upload image: ${error.message || 'Unknown error'}`)
          // Keep temp preview visible; move to next
          continue
        }

        if (data?.url) {
          const targetIndex = baseIndex + i
          setFormData((prev) => {
            const next = [...prev.images]
            // Replace the temp blob URL at the corresponding index
            next[targetIndex] = data.url
            return { ...prev, images: next }
          })
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      setFormError('Failed to upload images. Please try again.')
    } finally {
      // Revoke object URLs to avoid memory leaks
      setTimeout(() => {
        tempUrls.forEach((u) => {
          try { if (u.startsWith('blob:')) URL.revokeObjectURL(u) } catch {}
        })
      }, 1000)
      setUploadingImages(false)
    }
  }

  // Use browser geolocation to fill address and lat/lng
  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      return
    }
    setLocationLoading(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        // Reverse geocode via OpenStreetMap Nominatim (no key required)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
          headers: { "Accept": "application/json" }
        })
        const data = await res.json()
        const display = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        setFormData((prev) => ({ ...prev, address: display, lat: latitude, lng: longitude }))
      } catch (e) {
        setLocationError("Failed to fetch address from location. Please enter manually.")
      } finally {
        setLocationLoading(false)
      }
    }, (err) => {
      setLocationError(err.message || "Unable to get your location.")
      setLocationLoading(false)
    }, { enableHighAccuracy: true, timeout: 15000 })
  }

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = formData.images[indexToRemove]
    
    // If it's a local preview URL, just revoke and skip storage deletion
    if (imageToRemove?.startsWith('blob:')) {
      try { URL.revokeObjectURL(imageToRemove) } catch {}
    } else if (imageToRemove && imageToRemove.includes('supabase.co')) {
      // If it's a Supabase Storage URL, delete the file
      try {
        const urlParts = imageToRemove.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const { error } = await businessStore.deleteImage(fileName)
        if (error) {
          console.error('Error deleting image from storage:', error)
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleArrayFieldChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) }
      }
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const renderApprovalStatus = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'requires_more_info':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs Info
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  // In the render, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span>Loading your businesses...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-6">
                <Logo size="lg" variant="white" />
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Business Dashboard</h1>
                  <p className="text-blue-100">Manage your business listings and grow your customer base</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
              <Button 
                onClick={() => router.push('/')} 
                variant="default"
                className="bg-white text-slate-900 hover:bg-blue-50 font-medium border border-white/20"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Main Page</span>
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const bucket = 'business-images'
                    // Try to fetch a known-nonexistent object to trigger useful error if bucket missing
                    const { data, error } = await (async () => {
                      try {
                        const res = await fetch('/no-op', { method: 'HEAD' })
                        return { data: null, error: null }
                      } catch {
                        return { data: null, error: null }
                      }
                    })()
                    alert('Storage diagnostics: Ensure bucket "business-images" exists and policies are applied. If uploads fail, run create_storage_bucket.sql in Supabase SQL editor.')
                  } catch (e) {
                    alert('Storage diagnostics could not run. Please verify bucket and policies in Supabase.')
                  }
                }} 
                variant="default"
                className="bg-white text-slate-900 hover:bg-blue-50 font-medium border border-white/20"
              >
                <span>Storage Help</span>
              </Button>
              <Button 
                onClick={logout} 
                variant="default"
                className="bg-red-600 text-white hover:bg-red-700 font-medium border border-red-600"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stat/Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Businesses */}
          <Card className="bg-white dark:bg-slate-900/80 border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <Home className="w-8 h-8 text-blue-500 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.length}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">Total Businesses</div>
              </div>
            </CardContent>
          </Card>
          {/* Pending Approval */}
          <Card className="bg-white dark:bg-slate-900/80 border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <Clock className="w-8 h-8 text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-1" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.filter(b => b.approvalStatus === 'pending').length}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">Pending Approval</div>
              </div>
            </CardContent>
          </Card>
          {/* Total Reviews */}
          <Card className="bg-white dark:bg-slate-900/80 border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <Star className="w-8 h-8 text-purple-500 bg-purple-100 dark:bg-purple-900/30 rounded-full p-1" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0)}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">Total Reviews</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8">
          <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">My Businesses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            {/* Add Business Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Business Listings</h2>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Button>
            </div>

            {/* Add/Edit Business Form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingBusiness ? "Edit Business" : "Add New Business"}</CardTitle>
                  <CardDescription>
                    {editingBusiness
                      ? "Update your business information"
                      : "Fill in the details for your business listing. New businesses will be reviewed and approved before appearing on the main page."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                      <div className="text-red-600 mb-2 text-sm">{formError}</div>
                    )}
                    {formSuccess && (
                      <div className="text-green-700 mb-4 text-sm bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">{formSuccess}</div>
                          <div className="text-green-600 text-xs mt-1">
                            Your business will appear on the main page once approved by our team.
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Business Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => {
                              setFormData({ ...formData, category: value })
                              if (value !== 'Other') setCustomCategory('')
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formData.category === 'Other' && (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Enter custom category"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const value = customCategory.trim()
                                  if (value) {
                                    if (!categories.includes(value)) {
                                      // no state for categories list; set on form only
                                    }
                                    setFormData({ ...formData, category: value })
                                    setCustomCategory('')
                                  }
                                }}
                              >
                                Use
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                          />
                          <Button type="button" variant="outline" onClick={() => {
                            // inline call to avoid TS name lookup issues
                            if (!navigator.geolocation) {
                              setLocationError("Geolocation is not supported by your browser.")
                              return
                            }
                            setLocationLoading(true)
                            setLocationError(null)
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                              const { latitude, longitude } = pos.coords
                              try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, { headers: { "Accept": "application/json" } })
                                const data = await res.json()
                                const display = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                                setFormData((prev) => ({ ...prev, address: display, lat: latitude, lng: longitude }))
                              } catch (e) {
                                setLocationError("Failed to fetch address from location. Please enter manually.")
                              } finally {
                                setLocationLoading(false)
                              }
                            }, (err) => {
                              setLocationError(err.message || "Unable to get your location.")
                              setLocationLoading(false)
                            }, { enableHighAccuracy: true, timeout: 15000 })
                          }} disabled={locationLoading}>
                            {locationLoading ? 'Locating...' : 'Use my location'}
                          </Button>
                        </div>
                        {locationError && (
                          <p className="text-xs text-red-600">{locationError}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hours">Hours *</Label>
                          <Input
                            id="hours"
                            placeholder="e.g., 9:00 AM - 6:00 PM"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priceRange">Typical Price (₵)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">₵</span>
                            <Input
                              id="priceRange"
                              inputMode="decimal"
                              placeholder="e.g., 50"
                              value={priceAmount}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.,]/g, '')
                                setPriceAmount(val)
                                setFormData({ ...formData, priceRange: val ? `₵${val.replace(',', '.')}` : '' })
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">Enter an average price customers can expect.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Business Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="info@yourbusiness.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* About Company */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">About Your Company</h3>
                      <div className="space-y-2">
                        <Label htmlFor="description">Short Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of your business..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aboutCompany">About Company</Label>
                        <Textarea
                          id="aboutCompany"
                          placeholder="Tell customers more about your company history, values, and what makes you unique..."
                          value={formData.aboutCompany}
                          onChange={(e) => setFormData({ ...formData, aboutCompany: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mission">Mission Statement</Label>
                        <Textarea
                          id="mission"
                          placeholder="Your company's mission and goals..."
                          value={formData.mission}
                          onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="foundedYear">Founded Year</Label>
                          <Input
                            id="foundedYear"
                            placeholder="e.g., 1995"
                            value={formData.foundedYear}
                            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeCount">Number of Employees</Label>
                          <Select
                            value={formData.employeeCount}
                            onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeCountOptions.map((count) => (
                                <SelectItem key={count} value={count}>
                                  {count}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="awards">Awards & Recognition</Label>
                        <Textarea
                          id="awards"
                          placeholder="List any awards, certifications, or recognition your business has received..."
                          value={formData.awards}
                          onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Services & Specialties */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Services & Specialties</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Services Offered</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {commonServices.map((service) => (
                              <div key={service} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`service-${service}`}
                                  checked={formData.services.includes(service)}
                                  onCheckedChange={(checked) =>
                                    handleArrayFieldChange("services", service, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`service-${service}`} className="text-sm">
                                  {service}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialties-input">Specialties (comma-separated)</Label>
                          <Input
                            id="specialties-input"
                            placeholder="e.g., Wood-fired Pizza, Fresh Pasta, Italian Wine"
                            value={formData.specialties.join(", ")}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specialties: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities & Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Amenities & Features</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Amenities</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {commonAmenities.map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={formData.amenities.includes(amenity)}
                                  onCheckedChange={(checked) =>
                                    handleArrayFieldChange("amenities", amenity, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Payment Methods</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {paymentOptions.map((payment) => (
                              <div key={payment} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`payment-${payment}`}
                                  checked={formData.paymentMethods.includes(payment)}
                                  onCheckedChange={(checked) =>
                                    handleArrayFieldChange("paymentMethods", payment, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`payment-${payment}`} className="text-sm">
                                  {payment}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Languages Spoken</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {languageOptions.map((language) => (
                              <div key={language} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`language-${language}`}
                                  checked={formData.languages.includes(language)}
                                  onCheckedChange={(checked) =>
                                    handleArrayFieldChange("languages", language, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`language-${language}`} className="text-sm">
                                  {language}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Social Media</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            placeholder="https://facebook.com/yourbusiness"
                            value={formData.socialMedia.facebook}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                socialMedia: { ...formData.socialMedia, facebook: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            placeholder="https://instagram.com/yourbusiness"
                            value={formData.socialMedia.instagram}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                socialMedia: { ...formData.socialMedia, instagram: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            placeholder="https://twitter.com/yourbusiness"
                            value={formData.socialMedia.twitter}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                socialMedia: { ...formData.socialMedia, twitter: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/company/yourbusiness"
                            value={formData.socialMedia.linkedin}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                socialMedia: { ...formData.socialMedia, linkedin: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Business Photos</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e.target.files)}
                            disabled={uploadingImages || formData.images.length >= 5}
                            className="flex-1"
                          />
                          {uploadingImages && (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-500">Uploading...</span>
                            </div>
                          )}
                        </div>

                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Business photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                  onClick={() => removeImage(index)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          <p>Upload up to 5 photos of your business. Supported formats: JPG, PNG, GIF</p>
                          <p className="mt-1">Images are automatically uploaded to secure cloud storage and will persist after saving.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={formLoading} className="w-full">
                        {formLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {editingBusiness ? "Updating..." : "Submitting for Approval..."}
                          </>
                        ) : (
                          editingBusiness ? "Update Business" : "Submit for Approval"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false)
                          setEditingBusiness(null)
                       setFormData({
                            name: "",
                            category: "",
                            address: "",
                            phone: "",
                            hours: "",
                            description: "",
                            priceRange: "$",
                         lat: undefined,
                         lng: undefined,
                            images: [],
                            website: "",
                            email: "",
                            foundedYear: "",
                            employeeCount: "",
                            specialties: [],
                            awards: "",
                            aboutCompany: "",
                            mission: "",
                            services: [],
                            amenities: [],
                            paymentMethods: [],
                            languages: [],
                            accessibility: false,
                            parking: false,
                            wifi: false,
                            socialMedia: {
                              facebook: "",
                              instagram: "",
                              twitter: "",
                              linkedin: "",
                            },
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Business Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {business.category}
                          </Badge>
                          {renderApprovalStatus(business.approvalStatus)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(business)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(business.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(business.rating)}
                        <span className="text-gray-600 ml-1">
                          {business.rating} ({business.reviewCount} reviews)
                        </span>
                      </div>

                      <p className="text-gray-600">{business.description}</p>

                      {business.aboutCompany && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">About</h4>
                          <p className="text-gray-600 text-xs">{business.aboutCompany}</p>
                        </div>
                      )}

                      {(business.approvalStatus === 'rejected' || business.approvalStatus === 'requires_more_info') && business.adminNotes && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-1">Admin Notes</h4>
                          <p className="text-red-700 text-xs">{business.adminNotes}</p>
                        </div>
                      )}

                      {business.images && business.images.length > 0 && (
                        <div className="mt-3">
                          <div className="flex gap-2 overflow-x-auto">
                            {business.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`${business.name} photo ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border flex-shrink-0"
                              />
                            ))}
                            {business.images.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                +{business.images.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {business.address}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone className="w-4 h-4" />
                          {business.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          {business.hours}
                        </div>
                        {business.website && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Globe className="w-4 h-4" />
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail className="w-4 h-4" />
                            {business.email}
                          </div>
                        )}
                      </div>

                      {business.specialties && business.specialties.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Specialties</h4>
                          <div className="flex flex-wrap gap-1">
                            {business.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {business.services && business.services.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Services</h4>
                          <div className="flex flex-wrap gap-1">
                            {business.services.slice(0, 3).map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {business.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{business.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {business.foundedYear && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Est. {business.foundedYear}
                          </div>
                        )}
                        {business.employeeCount && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {business.employeeCount} employees
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {businesses.length === 0 && !showAddForm && (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first business listing</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Business
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Visitors</CardTitle>
                <CardDescription>People who viewed your business listings</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-sm text-gray-600">Loading visitors…</div>
                ) : visitorRows.length === 0 ? (
                  <div className="text-sm text-gray-600">No visits yet.</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business</TableHead>
                          <TableHead>When</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Session</TableHead>
                          <TableHead className="hidden md:table-cell">User Agent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visitorRows.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.business?.name || '—'}</TableCell>
                            <TableCell>{new Date(v.viewed_at).toLocaleString()}</TableCell>
                            <TableCell>{v.user_id ? v.user_id.slice(0, 8) + '…' : 'Guest'}</TableCell>
                            <TableCell>{v.session_id ? v.session_id.slice(0, 8) + '…' : '—'}</TableCell>
                            <TableCell className="hidden md:table-cell truncate max-w-[280px]">{v.user_agent || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Manage and respond to customer reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Review management system would be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
