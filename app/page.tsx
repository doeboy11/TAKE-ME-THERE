/**
 * Main Search & Listing Page
 * Responsibilities:
 * - Fetch and display approved businesses (`businessStore.getApprovedBusinesses()`)
 * - Provide search/filter (query, category, distance, rating) and list/map toggle
 * - Handle selection, pagination, and lightweight analytics (track visits)
 *
 * Notes for future edits:
 * - Avoid logic changes in this file unless needed; prefer updating `lib/business-store.ts`
 * - Images come from `business.images` (array) or `business.image` (primary) with safe fallbacks
 * - `filteredBusinesses` should be initialized from fetched results to render initial list
 */
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useAuth, AuthProvider } from "@/lib/auth"
import { BusinessLogin } from "@/components/business-login"
import { BusinessDashboard } from "@/components/business-dashboard"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { NavigationArrows } from "@/components/navigation-arrows"
import { BusinessPagination } from "@/components/business-pagination"
import { BusinessSidebar } from "@/components/business-sidebar"
import { LogIn, User, MapPin, Star, Phone, Clock, Filter, Navigation, Loader2, List, Menu, X, Search, Building2 } from 'lucide-react'
// Dynamically import heavy components to reduce initial JS
const BusinessMap = dynamic(() => import('@/components/business-map'), { ssr: false, loading: () => null })
const BusinessGallery = dynamic(() => import('@/components/business-gallery').then(m => m.BusinessGallery), { ssr: false, loading: () => null })
import Logo from '@/components/logo'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { businessStore, Business as StoreBusiness } from "@/lib/business-store"
import { UserMenu } from "@/components/user-menu"

// Only fetch approved businesses from Supabase
// ([] removed, see below for fetch logic)

type UiBusiness = StoreBusiness & {
  priceRange: string
  image: string
  images: string[]
  rating: number
  reviewCount: number
  distance: number
}

function LocalBusinessSearchContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [allBusinesses, setAllBusinesses] = useState<UiBusiness[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");
  const [maxDistance, setMaxDistance] = useState([5]);
  const [minRating, setMinRating] = useState([0]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<UiBusiness[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<UiBusiness | null>(null);
  const [selectedBusinessIndex, setSelectedBusinessIndex] = useState<number>(-1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [compactHeader, setCompactHeader] = useState(false);
  const searchDebounceRef = useRef<number | undefined>(undefined);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const scrollToSearch = () => {
    try {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {}
  }

  // Incremental loading to avoid large initial payloads
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true)
      const nextPage = pageIndex + 1
      const next = await businessStore.getApprovedBusinessesPage(nextPage, 30)
      const normalized: UiBusiness[] = (next || []).map((b) => ({
        ...b,
        priceRange: (b as any).priceRange ?? (b as any).price_range ?? "₵",
        image: (b as any).image || "/placeholder.svg",
        images: (b as any).images || [],
        rating: (b as any).rating ?? 0,
        reviewCount: (b as any).reviewCount ?? 0,
        distance: (b as any).distance ?? 0,
      }))
      if (normalized.length > 0) {
        const appended = [...allBusinesses, ...normalized]
        setAllBusinesses(appended)
        setFilteredBusinesses(appended)
        setPageIndex(nextPage)
      }
    } catch (e) {
      console.error('Error loading more businesses:', e)
    } finally {
      setLoadingMore(false)
    }
  }
  // Mobile search overlay (non-modal, fixed top)
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const scrollCloseStateRef = useRef<{ touchStartY: number }>({ touchStartY: 0 })
  const closeOverlayOnSearch = false

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent_searches')
      if (raw) setRecentSearches(JSON.parse(raw))
    } catch {}
  }, [])

  // Debounce search query for lightweight suggestions
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery), 200)
    return () => clearTimeout(handle)
  }, [searchQuery])

  const addRecentSearch = (q: string) => {
    const v = q.trim()
    if (!v) return
    setRecentSearches((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8)
      try { localStorage.setItem('recent_searches', JSON.stringify(next)) } catch {}
      return next
    })
  }

  useEffect(() => {
    if (searchOverlayOpen) {
      // Focus input shortly after opening
      const t = setTimeout(() => searchInputRef.current?.focus(), 50)
      // Close overlay when user scrolls beyond a small threshold
      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaY) > 24) setSearchOverlayOpen(false)
      }
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
          scrollCloseStateRef.current.touchStartY = e.touches[0].clientY
        }
      }
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
          const dy = Math.abs(e.touches[0].clientY - scrollCloseStateRef.current.touchStartY)
          if (dy > 24) setSearchOverlayOpen(false)
        }
      }
      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: true })
      return () => {
        clearTimeout(t)
        window.removeEventListener('wheel', onWheel as any)
        window.removeEventListener('touchstart', onTouchStart as any)
        window.removeEventListener('touchmove', onTouchMove as any)
      }
    }
  }, [searchOverlayOpen])

  // Lightweight live suggestions for overlay (client side)
  const liveSuggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return [] as UiBusiness[]
    return allBusinesses
      .filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [debouncedQuery, allBusinesses])

  // Derived primitive values for stable effect dependencies
  const maxDistanceValue = (Array.isArray(maxDistance) && maxDistance.length > 0 ? maxDistance[0] : 5)
  const minRatingValue = (Array.isArray(minRating) && minRating.length > 0 ? minRating[0] : 0)
  const userLocationKey = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''

  useEffect(() => {
    async function fetchApprovedBusinesses() {
      setIsLoading(true);
      try {
        // Only fetch businesses with approval_status === 'approved'
        const approved = await businessStore.getApprovedBusinessesPage(0, 30);
        const normalized: UiBusiness[] = (approved || []).map((b) => ({
          ...b,
          priceRange: (b as any).priceRange ?? b.price_range ?? "₵",
          image: b.image || "/placeholder.svg",
          images: b.images || [],
          rating: b.rating ?? 0,
          reviewCount: b.reviewCount ?? 0,
          distance: b.distance ?? 0,
        }))
        setAllBusinesses(normalized);
        setFilteredBusinesses(normalized); // show businesses on initial load
        setPageIndex(1);
        if (!normalized || normalized.length === 0) {
          setError("No approved businesses found yet. Try adjusting filters or check back later.")
        } else {
          setError(null)
        }
      } catch (error) {
        console.error('Error loading approved businesses:', error)
        setAllBusinesses([]);
        setFilteredBusinesses([]);
        setError("Error fetching approved businesses. Please check your connection and try again.")
      }
      setIsLoading(false);
    }
    fetchApprovedBusinesses();
  }, []);

  // Handle sticky compact header on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setCompactHeader(y > 100)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Live search as user types (debounced)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = window.setTimeout(() => {
      handleSearch()
    }, 250)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchQuery, location, category, maxDistanceValue, minRatingValue, userLocationKey])

  // Banner background images - Real business photos
  const bannerImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&h=1000&q=85", // Restaurant interior (4K-ready)
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=2400&h=1000&q=85", // Auto repair shop (4K-ready)
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=2400&h=1000&q=85", // Hair salon (4K-ready)
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2400&h=1000&q=85", // Electronics store (4K-ready)
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2400&h=1000&q=85", // Local market (4K-ready)
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=2400&h=1000&q=85", // Beauty products (4K-ready)
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=2400&h=1000&q=85", // Phone repair (4K-ready)
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2400&h=1000&q=85"  // Clothing store (4K-ready)
  ]


  const categories = [
    // Core
    "all",
    "Restaurant",
    "Local Restaurant",
    "Fast Food",
    "Cafe",
    "Bar & Grill",
    "Bakery",
    "Food Truck",
    "Street Food",
    // Ghanaian food spots
    "Chop Bar",
    "Waakye Joint",
    "Kenkey & Fish",
    "Fufu Spot",
    "Banku & Tilapia",
    "Jollof & Grills",
    "Khebab / Suya",
    "Fruit Seller",
    // Beauty & fashion
    "Hair Salon",
    "Barber Shop",
    "Hair Braiding",
    "Makeup Artist",
    "Nail Salon",
    "Spa",
    "Clothing Store",
    "Boutique",
    "Tailor / Seamstress",
    "Fashion Designer",
    "Shoe Store",
    "Cobbler / Shoe Repair",
    "Jewelry Store",
    "Fabric / Textiles",
    // Groceries & household
    "Grocery Store",
    "Provision Shop",
    "Convenience Store",
    "Cold Store",
    "Butchery / Meat Shop",
    "Fishmonger",
    // Health
    "Pharmacy",
    "Licensed Chemical Seller",
    "Herbal Clinic",
    "Medical Clinic",
    "Dental Office",
    "Optometry",
    "Veterinary Clinic",
    // Financial & telco
    "Bank",
    "Credit Union",
    "Microfinance",
    "Forex Bureau",
    "Mobile Money Agent (MoMo)",
    "Telecom / Phone Airtime",
    // Repairs & electronics
    "Electronics Repair",
    "Computer Repair",
    "Phone Repair",
    "Appliance Repair",
    "Mobile Phone Shop",
    // Auto & transport
    "Auto Repair",
    "Mechanic / Fitting Shop",
    "Vulcanizer",
    "Auto Parts",
    "Car Wash",
    "Tire Shop",
    "Oil Change",
    "Car Rental",
    "Driving School",
    "Trotro / Transport Station",
    // Building & trades
    "Building Materials",
    "Plumbing",
    "Electrical",
    "HVAC",
    "Roofing",
    "Welding / Fabrication",
    "Carpentry",
    "Masonry",
    "Sand & Stone Supplier",
    // Home & services
    "Laundry / Dry Cleaning",
    "Water Delivery / Sachet Water",
    "Gas Refill / LPG",
    "Printing / Photocopy",
    "Printing Shop",
    "Internet Cafe",
    "Event Rentals (Canopies, Chairs)",
    "Event Planning",
    "Catering",
    "Photography",
    "Videography",
    "Game Center",
    // Pets & others
    "Pet Store",
    "Pet Grooming",
    "Pet Boarding",
    // Real estate & legal
    "Real Estate",
    "Legal Services",
    // Lodging & travel
    "Hotel",
    "Guest House",
    "Bed & Breakfast",
    "Vacation Rental",
    "Hostel",
    "Hostels",
    // Fuel & logistics
    "Gas Station",
    "LPG Filling Station",
    "Moving Services",
    "Storage",
    // Education
    "Education",
    "Creche / Nursery",
    "Private School",
    "Tutoring",
    "Music Lessons",
    "Art Classes",
    // Agriculture
    "Agrochemicals",
    "Fertilizer Dealer",
    "Poultry Farm",
  ]

  const fetchBusinesses = async () => {
    try {
      const businesses = await businessStore.getAllBusinesses()
      const normalized: UiBusiness[] = (businesses || []).map((b) => ({
        ...b,
        priceRange: (b as any).priceRange ?? b.price_range ?? "₵",
        image: b.image || "/placeholder.svg",
        images: b.images || [],
        rating: b.rating ?? 0,
        reviewCount: b.reviewCount ?? 0,
        distance: b.distance ?? 0,
      }))

      if (normalized && normalized.length > 0) {
        setAllBusinesses(normalized)
        setFilteredBusinesses(normalized)
        console.log('✅ Loaded', normalized.length, 'approved businesses')
      } else {
        setAllBusinesses([])
        setFilteredBusinesses([])
        console.log('⚠️ No businesses found')
      }
    } catch (error) {
      console.error('❌ Error fetching businesses:', error)
      setAllBusinesses([])
      setFilteredBusinesses([])
    }
  }

  const handleBusinessSearch = (businessId: string) => {
    const business = allBusinesses.find(b => b.id === businessId)
    if (business) {
      handleBusinessSelect(business)
    }
  }

  const handleBusinessVisit = (businessId: string) => {
    // Handle business visit (e.g., analytics tracking)
    console.log('Business visited:', businessId)
  }

  const openGallery = (business: UiBusiness) => {
    setSelectedBusiness(business)
    setSelectedBusinessIndex(filteredBusinesses.findIndex(b => b.id === business.id))
    setGalleryOpen(true)
  }

  const handlePreviousBusiness = () => {
    if (selectedBusinessIndex > 0) {
      const newIndex = selectedBusinessIndex - 1
      setSelectedBusinessIndex(newIndex)
      setSelectedBusiness(filteredBusinesses[newIndex])
    }
  }

  const handleNextBusiness = () => {
    if (selectedBusinessIndex < filteredBusinesses.length - 1) {
      const newIndex = selectedBusinessIndex + 1
      setSelectedBusinessIndex(newIndex)
      setSelectedBusiness(filteredBusinesses[newIndex])
    }
  }

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryOpen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePreviousBusiness()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNextBusiness()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setGalleryOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [galleryOpen, selectedBusinessIndex, filteredBusinesses])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      return
    }

    setGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        try {
          // Reverse geocoding to get location name
          const response = await fetch(
            `/api/reverse-geocode?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10`,
            { cache: 'no-store' }
          )
          if (!response.ok) {
            throw new Error(`Reverse geocode failed: ${response.status}`)
          }
          const data = await response.json()
          const locationName =
            (data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state) ??
            (typeof data?.display_name === 'string' ? data.display_name.split(',')[0] : undefined) ??
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setLocation(locationName)
        } catch (error) {
          console.error('Error getting location name:', error)
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }

        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError("Unable to get your location. Please enter manually.")
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const handleSearch = () => {
    let results = allBusinesses

    // --- Natural-language relevance scoring ---
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      const tokens = q.split(/[^a-z0-9+]+/i).filter(Boolean)

      const scoreFor = (b: UiBusiness) => {
        // Combine searchable text fields
        const fields: string[] = [
          b.name,
          b.category,
          b.description,
          b.address,
          // Optional arrays from store: services, specialties, amenities
          ...(Array.isArray((b as any).services) ? (b as any).services : []),
          ...(Array.isArray((b as any).specialties) ? (b as any).specialties : []),
          ...(Array.isArray((b as any).amenities) ? (b as any).amenities : []),
        ].filter(Boolean).map((s) => String(s).toLowerCase())

        const fullText = fields.join(' \n ')
        let score = 0
        // Exact phrase boost
        if (fullText.includes(q)) score += 5
        // Token matches with field-based weights
        for (const t of tokens) {
          if (!t) continue
          // Name/category strong weight
          if (b.name.toLowerCase().includes(t)) score += 3
          if (b.category.toLowerCase().includes(t)) score += 2
          // Description/address medium
          if (b.description.toLowerCase().includes(t)) score += 2
          if (b.address.toLowerCase().includes(t)) score += 1
          // Services/specialties/amenities light
          if (((b as any).services || []).join(' ').toLowerCase().includes(t)) score += 2
          if (((b as any).specialties || []).join(' ').toLowerCase().includes(t)) score += 2
          if (((b as any).amenities || []).join(' ').toLowerCase().includes(t)) score += 1
        }
        return score
      }

      // Keep only relevant and sort by score desc
      results = results
        .map((b) => ({ b, s: scoreFor(b) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.b)
    }

    // Filter by location text if provided
    if (location.trim()) {
      const locationQuery = location.toLowerCase()
      results = results.filter(business =>
        business.address.toLowerCase().includes(locationQuery)
      )
    }

    // Filter by selected category
    if (category !== 'all') {
      results = results.filter(business => business.category === category)
    }

    // Distance filtering and sort by proximity when user location is known
    if (userLocation) {
      results = results.map(business => ({
        ...business,
        distance: business.lat && business.lng
          ? calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng)
          : 0
      }))
      .filter(business => business.distance <= maxDistance[0])
      .sort((a, b) => a.distance - b.distance)
    }

    // Minimum rating filter
    results = results.filter(business => business.rating >= minRating[0])

    setFilteredBusinesses(results)

    // Save query to recent searches (only if we had a non-empty query)
    if (q) {
      addRecentSearch(searchQuery)
    }

    // Close overlay and scroll to results for a smooth flow on mobile
    if (closeOverlayOnSearch) {
      try { setSearchOverlayOpen(false) } catch {}
      try { scrollToSearch() } catch {}
    }
  }

  const handleBusinessSelect = (business: UiBusiness) => {
    setSelectedBusiness(business)
    setSelectedBusinessIndex(filteredBusinesses.findIndex(b => b.id === business.id))
  }

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory)
    setSearchQuery("")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Show isLoading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Discovering Local Businesses</h3>
          <p className="text-gray-600">Loading the best businesses in your area...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
      <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 transition-shadow duration-300 ${compactHeader ? 'shadow-md' : ''}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${compactHeader ? 'py-2' : 'py-4'}`}>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <Logo size="lg" variant="default" />
                <div className="hidden sm:block">
                  <div className="h-6 w-px bg-gray-300"></div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600 font-medium">Discover local businesses across Ghana</p>
                  <p className="text-xs text-gray-500">Find the best services in your area</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Search Trigger - Always visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                className="rounded-full sm:hidden"
                onClick={() => setSearchOverlayOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              {/* Mobile Sidebar Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden border-gray-300 hover:bg-gray-50"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Popular</span>
              </Button>

              {user ? (
                <div className="flex items-center gap-3">
                  <Button 
                    ref={userMenuTriggerRef}
                    variant="ghost" 
                    size="icon" 
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  <span className="text-sm hidden sm:inline font-medium text-gray-700">
                    Welcome, {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowLogin(true)} 
                  variant="outline" 
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  <LogIn className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </div>

          {/* Inline search in compact mode */}
          <div className={`mt-3 transition-all duration-300 ${compactHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'} `}>
            {/* Mobile compact icons */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                className="rounded-full"
                onClick={() => setSearchOverlayOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Use my location"
                className="rounded-full"
                disabled={gettingLocation}
                onClick={getCurrentLocation}
              >
                {gettingLocation ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open filters"
                className="rounded-full"
                onClick={() => setSidebarOpen(true)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {/* Full inputs for sm+ */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <SearchAutocomplete
                  businesses={allBusinesses as any}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onBusinessSelect={handleBusinessSelect as any}
                  onCategorySelect={handleCategorySelect}
                  placeholder="Search businesses, services..."
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="City or region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                variant="outline"
                className="h-10 border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Near Me</span>
                <span className="sm:hidden">GPS</span>
              </Button>
              <Button onClick={handleSearch} className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Top Overlay (like sample) */}
      {searchOverlayOpen && (
        <div className="sm:hidden fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200">
          <div className="pt-[env(safe-area-inset-top)]" />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  className="w-full h-11 pl-10 pr-10 rounded-none border-0 border-b border-gray-300 focus:border-gray-400 focus:ring-0 text-[15px] placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                aria-label="Close"
                onClick={() => setSearchOverlayOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Category tabs */}
            <div className="mt-3 overflow-x-auto">
              <div className="flex gap-5 text-sm text-gray-700">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); handleSearch(); }}
                    className={`pb-2 whitespace-nowrap ${category === cat ? 'border-b-2 border-gray-800 font-semibold' : 'text-gray-500'}`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent searches (when no query) */}
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">Recent searches</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setSearchQuery(r); handleSearch(); }}
                      className="px-3 py-1.5 rounded-full border text-xs border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live suggestions (when typing) */}
            {searchQuery.trim() && liveSuggestions.length > 0 && (
              <div className="mt-3 -mx-4 px-4 pb-2 max-h-72 overflow-y-auto">
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                  {liveSuggestions.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => { setSearchQuery(b.name); handleSearch(); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900 text-sm">{b.name}</div>
                        <div className="text-xs text-gray-500">
                          {b.category}
                          {b.address ? ` • ${b.address}` : ''}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Unified Hero (single image with combined messaging) */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl h-[340px] sm:h-[420px] lg:h-[520px] pb-2">
          <Image
            src={bannerImages[0]}
            alt="Ghana local businesses"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/30" />
          <div className="relative z-10 h-full flex items-end p-4 sm:p-10">
            <div className="max-w-3xl bg-black/60 sm:bg-black/35 backdrop-blur-md sm:backdrop-blur-sm rounded-2xl p-4 sm:p-7 border border-white/10 mb-2 w-full sm:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs tracking-wide mx-auto sm:mx-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                Trusted local directory
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md leading-tight text-center sm:text-left">
                Discover great local businesses — and grow yours
              </h1>
              <p className="mt-2 text-white/90 text-sm sm:text-base max-w-2xl mx-auto sm:mx-0">
                Find restaurants, salons, repair shops and more near you. List your business for free and reach more customers across Ghana.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:flex-nowrap gap-3 sm:items-center max-w-xl mx-auto sm:mx-0">
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30 w-full sm:w-auto"
                >
                  List Your Business FREE
                </Button>
                <Button
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30 w-full sm:w-auto"
                  onClick={() => router.push('/how-it-works')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 xl:hidden" onClick={() => setSidebarOpen(false)}>
              <div
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Popular Businesses</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <BusinessSidebar
                    businesses={allBusinesses as any}
                    onBusinessSelect={(business: any) => {
                      handleBusinessSelect(business)
                      setSidebarOpen(false) // Close sidebar on mobile after selection
                    }}
                    selectedBusiness={selectedBusiness as any}
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
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Location Error Alert */}
            {locationError && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{locationError}</AlertDescription>
              </Alert>
            )}

            {/* Search Section */}
            <div
              ref={searchSectionRef}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 mb-8 transition-all duration-300 ease-in-out 
                ${compactHeader
                  ? 'md:opacity-0 md:-translate-y-2 md:pointer-events-none'
                  : 'opacity-100 translate-y-0'
                }
              `}
            >
              <div className="space-y-6">
                {/* Mobile: Inputs are now inline above; keep section for anchor/filters */}
                <div className="sm:hidden" />

                {/* Desktop/Tablet: Full Search Row */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <SearchAutocomplete
                      businesses={allBusinesses as any}
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onBusinessSelect={handleBusinessSelect as any}
                      onCategorySelect={handleCategorySelect}
                      placeholder="Search businesses, services..."
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter city or region in Ghana"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    variant="outline"
                    className="h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {gettingLocation ? "Getting Location..." : "Near Me"}
                    </span>
                    <span className="sm:hidden">GPS</span>
                  </Button>
                  <Button 
                    onClick={handleSearch} 
                    className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* User Location Display */}
                {userLocation && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3 text-green-800">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold">
                          Location detected: {location}
                        </span>
                        <p className="text-xs text-green-600">Showing businesses sorted by distance</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Min Rating: {minRating[0]} stars
                    </label>
                    <Slider 
                      value={minRating} 
                      onValueChange={setMinRating} 
                      max={5} 
                      min={0} 
                      step={0.1} 
                      className="mt-2" 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={handleSearch} 
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Owner CTA Banner - removed (merged into hero) */}

            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {filteredBusinesses.length} businesses found
                </h2>
                {userLocation && (
                  <p className="text-sm text-gray-600">Sorted by distance from your location</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-2" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'map' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard Navigation Hint */}
            {totalPages > 1 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 text-center">
                <span className="font-semibold">💡 Tip:</span> Use Ctrl + ← → to navigate between pages, or use the pagination controls below
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <Building2 className="w-4 h-4" />
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            {/* Business Listings */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 gap-6">
                {paginatedBusinesses.map((business) => (
                <Card
                  key={business.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-300 ${
                    selectedBusiness?.id === business.id ? "ring-2 ring-blue-500 shadow-lg" : ""
                  }`}
                  onClick={() => handleBusinessSelect(business)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className="w-full sm:w-40 h-48 sm:h-32 flex-shrink-0 relative hover:opacity-90 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        openGallery(business)
                      }}
                    >
                      {business.images && business.images.length > 1 ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={business.images[0] || business.image || "/placeholder.svg"}
                            alt={business.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 320px"
                            className="object-cover sm:rounded-l-lg"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                            +{business.images.length - 1}
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={business.image || "/placeholder.svg"}
                          alt={business.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover sm:rounded-l-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{business.name}</CardTitle>
                            <Badge variant="secondary" className="mb-3 bg-blue-100 text-blue-800 border-blue-200">
                              {business.category}
                            </Badge>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex items-center gap-1 mb-1">
                              {renderStars(business.rating)}
                              <span className="text-sm font-semibold text-gray-700 ml-1">
                                {business.rating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {business.reviewCount} reviews
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{business.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{business.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{business.hours}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">
                              {business.priceRange}
                            </span>
                            {userLocation && business.distance > 0 && (
                              <span className="text-sm text-gray-500">
                                {business.distance.toFixed(1)} miles away
                              </span>
                            )}
                          </div>
                          <Button 
  variant="outline" 
  size="sm"
  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/business/${business.id}`);
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <BusinessPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredBusinesses.length}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <BusinessMap businesses={filteredBusinesses as any} />
              </div>
            )}

            {/* Load More for incremental fetch */}
            <div className="mt-6 flex justify-center">
              <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>

            {/* Gallery Modal */}
            {galleryOpen && selectedBusiness && (
              <BusinessGallery
                images={
                  selectedBusiness.images && selectedBusiness.images.length > 0
                    ? selectedBusiness.images
                    : (selectedBusiness.image ? [selectedBusiness.image] : [])
                }
                businessName={selectedBusiness.name}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
              />
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <BusinessSidebar
                businesses={allBusinesses as any}
                onBusinessSelect={handleBusinessSelect as any}
                selectedBusiness={selectedBusiness as any}
                onBusinessSearch={handleBusinessSearch}
                onBusinessVisit={handleBusinessVisit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Menu */}
      {userMenuOpen && (
        <UserMenu
          isOpen={userMenuOpen}
          onClose={() => setUserMenuOpen(false)}
          triggerRef={userMenuTriggerRef}
        />
      )}

      {/* Login Modal */}
      {showLogin && <BusinessLogin onClose={() => setShowLogin(false)} />}

      <Footer />
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
