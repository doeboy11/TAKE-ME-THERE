"use client"

import { useState, useEffect } from "react"
import { useAuth, AuthProvider } from "@/lib/auth"
import { BusinessLogin } from "@/components/business-login"
import { BusinessDashboard } from "@/components/business-dashboard"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { NavigationArrows } from "@/components/navigation-arrows"
import { BusinessPagination } from "@/components/business-pagination"
import { BusinessSidebar } from "@/components/business-sidebar"
import { LogIn, User, MapPin, Star, Phone, Clock, Filter, Navigation, Loader2, List, Menu, X } from 'lucide-react'
import BusinessMap from '@/components/business-map'
import Logo from '@/components/logo'
import StickyHeader from '@/components/sticky-header'
import BusinessCard from '@/components/business-card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { BusinessGallery } from "@/components/business-gallery"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

interface Business {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  hours: string
  distance: number
  image: string
  images?: string[]
  description: string
  priceRange: string
  lat?: number
  lng?: number
}

// Keep mock businesses as fallback
const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "Auntie Muni's Chop Bar",
    category: "Restaurant",
    rating: 4.5,
    reviewCount: 127,
    address: "Oxford Street, Osu, Accra",
    phone: "+233 24 123 4567",
    hours: "8:00 AM - 10:00 PM",
    distance: 0.3,
    image: "/placeholder.svg?height=200&width=300&text=Chop+Bar",
    images: [
      "/placeholder.svg?height=400&width=600&text=Restaurant+Interior",
      "/placeholder.svg?height=400&width=600&text=Local+Dishes",
      "/placeholder.svg?height=400&width=600&text=Dining+Area",
    ],
    description: "Authentic Ghanaian cuisine with jollof rice, banku, and fresh tilapia",
    priceRange: "₵₵",
    lat: 5.5563,
    lng: -0.1969,
  },
  {
    id: "2",
    name: "TechHub Repairs",
    category: "Electronics Repair",
    rating: 4.8,
    reviewCount: 89,
    address: "Adabraka Market, Accra",
    phone: "+233 20 987 6543",
    hours: "9:00 AM - 6:00 PM",
    distance: 0.7,
    image: "/placeholder.svg?height=200&width=300&text=Phone+Repair",
    images: [
      "/placeholder.svg?height=400&width=600&text=Repair+Shop",
      "/placeholder.svg?height=400&width=600&text=Tools+Equipment",
    ],
    description: "Professional phone and laptop repair services in Accra",
    priceRange: "₵",
    lat: 5.56,
    lng: -0.2057,
  },
  {
    id: "3",
    name: "Rose Garden Flowers",
    category: "Florist",
    rating: 4.3,
    reviewCount: 56,
    address: "East Legon, Accra",
    phone: "+233 24 456 7890",
    hours: "7:00 AM - 7:00 PM",
    distance: 1.2,
    image: "/placeholder.svg?height=200&width=300&text=Flower+Shop",
    images: [
      "/placeholder.svg?height=400&width=600&text=Fresh+Flowers",
      "/placeholder.svg?height=400&width=600&text=Wedding+Bouquets",
      "/placeholder.svg?height=400&width=600&text=Shop+Interior",
    ],
    description: "Beautiful flowers and arrangements for weddings and events",
    priceRange: "₵₵",
    lat: 5.6037,
    lng: -0.187,
  },
  {
    id: "4",
    name: "Fitness Palace Gym",
    category: "Fitness Center",
    rating: 4.1,
    reviewCount: 203,
    address: "Airport Residential Area, Accra",
    phone: "+233 30 234 5678",
    hours: "5:00 AM - 11:00 PM",
    distance: 0.9,
    image: "/placeholder.svg?height=200&width=300&text=Fitness+Gym",
    images: [
      "/placeholder.svg?height=400&width=600&text=Gym+Equipment",
      "/placeholder.svg?height=400&width=600&text=Workout+Area",
      "/placeholder.svg?height=400&width=600&text=Personal+Training",
    ],
    description: "Modern gym with personal training and group fitness classes",
    priceRange: "₵₵₵",
    lat: 5.6037,
    lng: -0.187,
  },
  {
    id: "5",
    name: "Café Kwame",
    category: "Coffee Shop",
    rating: 4.6,
    reviewCount: 312,
    address: "Labone, Accra",
    phone: "+233 24 345 6789",
    hours: "6:00 AM - 8:00 PM",
    distance: 0.5,
    image: "/placeholder.svg?height=200&width=300&text=Coffee+Shop",
    images: [
      "/placeholder.svg?height=400&width=600&text=Coffee+Bar",
      "/placeholder.svg?height=400&width=600&text=Cozy+Seating",
      "/placeholder.svg?height=400&width=600&text=Fresh+Pastries",
    ],
    description: "Premium coffee, pastries, and workspace in the heart of Labone",
    priceRange: "₵₵",
    lat: 5.5563,
    lng: -0.1969,
  },
  {
    id: "6",
    name: "Kofi's Auto Care",
    category: "Auto Repair",
    rating: 4.4,
    reviewCount: 78,
    address: "Kaneshie, Accra",
    phone: "+233 20 567 8901",
    hours: "7:00 AM - 6:00 PM",
    distance: 1.5,
    image: "/placeholder.svg?height=200&width=300&text=Auto+Repair",
    images: [
      "/placeholder.svg?height=400&width=600&text=Service+Bay",
      "/placeholder.svg?height=400&width=600&text=Diagnostic+Tools",
    ],
    description: "Complete automotive repair and maintenance services",
    priceRange: "₵₵",
    lat: 5.5563,
    lng: -0.2278,
  },
  {
    id: "7",
    name: "Akosua's Hair Studio",
    category: "Hair Salon",
    rating: 4.7,
    reviewCount: 156,
    address: "Tema Station, Accra",
    phone: "+233 24 789 0123",
    hours: "8:00 AM - 8:00 PM",
    distance: 0.8,
    image: "/placeholder.svg?height=200&width=300&text=Hair+Salon",
    images: [
      "/placeholder.svg?height=400&width=600&text=Salon+Interior",
      "/placeholder.svg?height=400&width=600&text=Styling+Stations",
    ],
    description: "Professional hair styling, braiding, and beauty treatments",
    priceRange: "₵₵",
    lat: 5.5563,
    lng: -0.2057,
  },
  {
    id: "8",
    name: "Accra Dental Clinic",
    category: "Dental Office",
    rating: 4.9,
    reviewCount: 98,
    address: "Ridge, Accra",
    phone: "+233 30 456 7890",
    hours: "8:00 AM - 5:00 PM",
    distance: 1.1,
    image: "/placeholder.svg?height=200&width=300&text=Dental+Office",
    images: [
      "/placeholder.svg?height=400&width=600&text=Reception+Area",
      "/placeholder.svg?height=400&width=600&text=Treatment+Room",
    ],
    description: "Modern dental care with experienced Ghanaian dentists",
    priceRange: "₵₵₵",
    lat: 5.5563,
    lng: -0.1969,
  },
  {
    id: "9",
    name: "Mama Ama's Kitchen",
    category: "Restaurant",
    rating: 4.2,
    reviewCount: 89,
    address: "Circle, Accra",
    phone: "+233 24 321 9876",
    hours: "10:00 AM - 11:00 PM",
    distance: 0.6,
    image: "/placeholder.svg?height=200&width=300&text=Local+Restaurant",
    description: "Traditional Ghanaian dishes including fufu, kenkey, and grilled tilapia",
    priceRange: "₵",
    lat: 5.5563,
    lng: -0.2057,
  },
  {
    id: "10",
    name: "Quick Oil Change Accra",
    category: "Auto Repair",
    rating: 4.0,
    reviewCount: 45,
    address: "Spintex Road, Accra",
    phone: "+233 20 654 3210",
    hours: "8:00 AM - 6:00 PM",
    distance: 1.8,
    image: "/placeholder.svg?height=200&width=300&text=Oil+Change",
    description: "Fast oil changes and basic car maintenance services",
    priceRange: "₵",
    lat: 5.5563,
    lng: -0.15,
  },
  {
    id: "11",
    name: "Golden Crust Bakery",
    category: "Bakery",
    rating: 4.6,
    reviewCount: 234,
    address: "Dansoman, Accra",
    phone: "+233 24 111 2222",
    hours: "5:00 AM - 8:00 PM",
    distance: 0.4,
    image: "/placeholder.svg?height=200&width=300&text=Bakery",
    description: "Fresh bread, meat pies, and traditional Ghanaian pastries",
    priceRange: "₵",
    lat: 5.5563,
    lng: -0.25,
  },
  {
    id: "12",
    name: "Pharmacy Plus",
    category: "Pharmacy",
    rating: 4.3,
    reviewCount: 167,
    address: "Madina, Accra",
    phone: "+233 30 333 4444",
    hours: "7:00 AM - 10:00 PM",
    distance: 0.9,
    image: "/placeholder.svg?height=200&width=300&text=Pharmacy",
    description: "Licensed pharmacy with prescription and over-the-counter medications",
    priceRange: "₵₵",
    lat: 5.689,
    lng: -0.1677,
  },
]

function LocalBusinessSearchContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("all")
  const [maxDistance, setMaxDistance] = useState([5])
  const [minRating, setMinRating] = useState([0])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [selectedBusinessIndex, setSelectedBusinessIndex] = useState<number>(-1)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [isScrolled, setIsScrolled] = useState(false)

  // Banner background images - Real business photos
  const bannerImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center", // Restaurant interior
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center", // Auto repair shop
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&crop=center", // Hair salon
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center", // Electronics store
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center", // Local market
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=400&fit=crop&crop=center", // Beauty products
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center", // Phone repair
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop&crop=center"  // Clothing store
  ]

  // Rotate banner images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [bannerImages.length])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch businesses from database
  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('isActive', true)
        .eq('isVerified', true)
        .order('createdAt', { ascending: false })

      if (fetchError) {
        console.error('Error fetching businesses:', fetchError)
        setError('Failed to load businesses')
        // Fallback to mock data
        setAllBusinesses(mockBusinesses)
        setFilteredBusinesses(mockBusinesses)
        return
      }

      if (businesses && businesses.length > 0) {
        // Transform database data to match Business interface
        const transformedBusinesses: Business[] = businesses.map((business: any) => ({
          id: business.id,
          name: business.name,
          category: business.category,
          rating: business.rating || 0,
          reviewCount: business.reviewCount || 0,
          address: business.address,
          phone: business.phone,
          hours: business.hours,
          distance: business.distance || 0,
          image: business.image || "/placeholder.svg",
          images: business.images || [],
          description: business.description,
          priceRange: business.priceRange || "₵",
          lat: business.lat,
          lng: business.lng,
        }))

        setAllBusinesses(transformedBusinesses)
        setFilteredBusinesses(transformedBusinesses)
        console.log('✅ Loaded', transformedBusinesses.length, 'businesses from database')
      } else {
        console.log('No businesses found in database, using mock data')
        setAllBusinesses(mockBusinesses)
        setFilteredBusinesses(mockBusinesses)
      }
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError('Failed to load businesses')
      // Fallback to mock data
      setAllBusinesses(mockBusinesses)
      setFilteredBusinesses(mockBusinesses)
    } finally {
      setLoading(false)
    }
  }

  // Load businesses on component mount
  useEffect(() => {
    fetchBusinesses()
  }, [])

  // Add these functions after the existing state declarations
  const handleBusinessSearch = (businessId: string) => {
    // This would be called when a business is searched
    console.log(`Business ${businessId} searched`)
  }

  const handleBusinessVisit = (businessId: string) => {
    // This would be called when a business profile is visited
    console.log(`Business ${businessId} visited`)
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const paginatedBusinesses = filteredBusinesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when businesses change
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredBusinesses])

  const openGallery = (business: Business) => {
    const index = filteredBusinesses.findIndex((b) => b.id === business.id)
    setSelectedBusiness(business)
    setSelectedBusinessIndex(index)
    setGalleryOpen(true)
  }

  // Navigation functions for business gallery
  const handlePreviousBusiness = () => {
    if (selectedBusinessIndex > 0) {
      const newIndex = selectedBusinessIndex - 1
      const newBusiness = filteredBusinesses[newIndex]
      setSelectedBusiness(newBusiness)
      setSelectedBusinessIndex(newIndex)
    }
  }

  const handleNextBusiness = () => {
    if (selectedBusinessIndex < filteredBusinesses.length - 1) {
      const newIndex = selectedBusinessIndex + 1
      const newBusiness = filteredBusinesses[newIndex]
      setSelectedBusiness(newBusiness)
      setSelectedBusinessIndex(newIndex)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryOpen) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault()
            handlePreviousBusiness()
            break
          case "ArrowRight":
            e.preventDefault()
            handleNextBusiness()
            break
          case "Escape":
            setGalleryOpen(false)
            break
        }
      } else {
        // Page navigation with arrow keys
        switch (e.key) {
          case "ArrowLeft":
            if (e.ctrlKey && currentPage > 1) {
              e.preventDefault()
              setCurrentPage(currentPage - 1)
            }
            break
          case "ArrowRight":
            if (e.ctrlKey && currentPage < totalPages) {
              e.preventDefault()
              setCurrentPage(currentPage + 1)
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [galleryOpen, selectedBusinessIndex, filteredBusinesses.length, currentPage, totalPages])

  // If user is a business owner, show dashboard
  if (user?.role === "business_owner") {
    return <BusinessDashboard />
  }

  const categories = [
    "all",
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

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        // Update distances based on user location
        const businessesWithUpdatedDistances = allBusinesses.map((business) => ({
          ...business,
          distance:
            business.lat && business.lng
              ? calculateDistance(latitude, longitude, business.lat, business.lng)
              : business.distance,
        }))

        // Sort by distance and update filtered businesses
        businessesWithUpdatedDistances.sort((a, b) => a.distance - b.distance)
        setFilteredBusinesses(businessesWithUpdatedDistances)

        // Reverse geocode to get address (mock implementation)
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)

        setGettingLocation(false)
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location."
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const handleSearch = () => {
    // Track search if there's a query
    if (searchQuery && selectedBusiness) {
      handleBusinessSearch(selectedBusiness.id)
    }

    let filtered = allBusinesses

    // If user location is available, recalculate distances
    if (userLocation) {
      filtered = filtered.map((business) => ({
        ...business,
        distance:
          business.lat && business.lng
            ? calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng)
            : business.distance,
      }))
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (category !== "all") {
      filtered = filtered.filter((business) => business.category === category)
    }

    filtered = filtered.filter((business) => business.distance <= maxDistance[0] && business.rating >= minRating[0])

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance)

    setFilteredBusinesses(filtered)
  }

  // Update the handleBusinessSelect function to track visits
  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(selectedBusiness?.id === business.id ? null : business)
    handleBusinessVisit(business.id) // Track the visit
    // Auto-search when business is selected from autocomplete
    handleSearch()
  }

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory)
    // Auto-search when category is selected
    setTimeout(() => handleSearch(), 100)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Arrows for Gallery */}
      {galleryOpen && (
        <NavigationArrows
          currentIndex={selectedBusinessIndex}
          totalItems={filteredBusinesses.length}
          onPrevious={handlePreviousBusiness}
          onNext={handleNextBusiness}
          showBackToTop={false}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
                              <Logo size="lg" variant="default" />
              <p className="text-sm sm:text-base text-gray-600">Discover local businesses across Ghana</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Sidebar Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Popular</span>
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" passHref legacyBehavior>
                    <Button variant="ghost" size="icon" className="p-0">
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                  <span className="text-sm hidden sm:inline">Welcome, {user.email}</span>
                </div>
              ) : (
                <Button onClick={() => setShowLogin(true)} variant="outline" size="sm">
                  <LogIn className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden" onClick={() => setSidebarOpen(false)}>
              <div
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Popular Businesses</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <BusinessSidebar
                    businesses={allBusinesses}
                    onBusinessSelect={(business) => {
                      handleBusinessSelect(business)
                      setSidebarOpen(false) // Close sidebar on mobile after selection
                    }}
                    selectedBusiness={selectedBusiness}
                    onBusinessSearch={handleBusinessSearch}
                    onBusinessVisit={handleBusinessVisit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Location Error Alert */}
            {locationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <SearchAutocomplete
                    businesses={allBusinesses}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onBusinessSelect={handleBusinessSelect}
                    onCategorySelect={handleCategorySelect}
                    placeholder="Search businesses, services..."
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter city or region in Ghana"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  <span className="hidden sm:inline">{gettingLocation ? "Getting Location..." : "Near Me"}</span>
                  <span className="sm:hidden">GPS</span>
                </Button>
                <Button onClick={handleSearch} className="w-full">
                  Search
                </Button>
              </div>

              {/* User Location Display */}
              {userLocation && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Navigation className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Location detected: {location} - Showing businesses sorted by distance
                    </span>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Distance: {maxDistance[0]} miles
                  </label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating: {minRating[0]} stars
                  </label>
                  <Slider value={minRating} onValueChange={setMinRating} max={5} min={0} step={0.1} className="mt-2" />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleSearch} className="w-full bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>



            {/* Business Owner CTA Banner */}
            {!user && (
              <div className="relative overflow-hidden rounded-xl mb-6 sm:mb-8 shadow-lg">
                {/* Rotating Background Images */}
                <div className="absolute inset-0">
                  {bannerImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Business showcase ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                  ))}
                </div>
                
                {/* Image Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                  {bannerImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 scale-100'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-sm">🚀</span>
                        </div>
                        <span className="text-white text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
                          FREE LISTING
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">
                        Get More Customers Today!
                      </h3>
                      <p className="text-white text-lg mb-4 opacity-100 drop-shadow-md font-medium">
                        Join thousands of Ghanaian businesses already reaching new customers on Take Me There. 
                        <br className="hidden sm:block" />
                        <span className="font-semibold">Free listing • No monthly fees • Start in 5 minutes</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-white text-sm opacity-100 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Reach customers across Ghana
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Get customer reviews & ratings
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Manage your listing anytime
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <Button 
                        onClick={() => setShowLogin(true)} 
                        className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg shadow-lg backdrop-blur-sm"
                      >
                        List Your Business FREE
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
                        onClick={() => window.location.href = '/how-it-works'}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {filteredBusinesses.length} businesses found
                {userLocation && " (sorted by distance)"}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-1" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'map' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard Navigation Hint */}
            {totalPages > 1 && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 text-center">
                💡 Use Ctrl + ← → to navigate between pages, or use the pagination controls below
              </div>
            )}

            {/* Business Listings */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onViewProfile={(business) => router.push(`/business/${business.id}`)}
                    onCall={(phone) => window.open(`tel:${phone}`)}
                    onGetDirections={(address) => window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(address)}`)}
                  />
                ))}
              </div>
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 relative hover:opacity-90 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        openGallery(business)
                      }}
                    >
                      {business.images && business.images.length > 1 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={business.images[0] || business.image || "/placeholder.svg"}
                            alt={business.name}
                            className="w-full h-full object-cover sm:rounded-l-lg"
                          />
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                            +{business.images.length - 1}
                          </div>
                        </div>
                      ) : (
                        <img
                          src={business.image || "/placeholder.svg"}
                          alt={business.name}
                          className="w-full h-full object-cover sm:rounded-l-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <CardHeader className="p-0 mb-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{business.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {business.category}
                            </Badge>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex items-center gap-1">
                              {renderStars(business.rating)}
                              <span className="text-sm text-gray-600 ml-1">
                                {business.rating} ({business.reviewCount})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {business.distance.toFixed(1)} miles • {business.priceRange}
                              {userLocation && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  <Navigation className="w-3 h-3 mr-1" />
                                  GPS
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-sm text-gray-600 mb-3">{business.description}</p>
                        <div className="space-y-2 text-sm text-gray-500 mb-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{business.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{business.hours}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`tel:${business.phone}`)
                            }}
                            className="flex-1 sm:flex-none"
                          >
                            Call Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(business.address)}`)
                            }}
                            className="flex-1 sm:flex-none"
                          >
                            Directions
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 sm:flex-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/business/${business.id}`)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            ) : (
              <BusinessMap
                businesses={filteredBusinesses}
                onBusinessSelect={handleBusinessSelect}
                userLocation={userLocation}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <BusinessPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredBusinesses.length}
                />
              </div>
            )}

            {/* Navigation Arrows for Page Navigation (when not in gallery) */}
            {!galleryOpen && totalPages > 1 && (
              <NavigationArrows
                currentIndex={currentPage - 1}
                totalItems={totalPages}
                onPrevious={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                onNext={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className="hidden sm:block"
              />
            )}

            {selectedBusiness && (
              <BusinessGallery
                images={selectedBusiness.images || [selectedBusiness.image]}
                businessName={selectedBusiness.name}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
              />
            )}

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No businesses found matching your criteria</div>
                <p className="text-gray-400 mt-2">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar */}
          <div className="hidden xl:block">
            <BusinessSidebar
              businesses={allBusinesses}
              onBusinessSelect={handleBusinessSelect}
              selectedBusiness={selectedBusiness}
              onBusinessSearch={handleBusinessSearch}
              onBusinessVisit={handleBusinessVisit}
            />
          </div>
        </div>

        <Footer />
      </div>

      {showLogin && <BusinessLogin onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default function LocalBusinessSearch() {
  return (
    <AuthProvider>
      <LocalBusinessSearchContent />
    </AuthProvider>
  )
}
