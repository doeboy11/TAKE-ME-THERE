/**
 * Business Detail Page
 * Responsibilities:
 * - Fetch a single business by id via `businessStore.getById()` and render full details
 * - Provide image gallery, reviews, and quick contact/actions
 * - Track a lightweight view via `businessStore.trackView()` (fire-and-forget)
 *
 * Notes for future edits:
 * - Do not change data-shaping here; prefer mapping inside `lib/business-store.ts`
 * - `images` is an array of public URLs; `image` is the primary thumbnail
 * - Keep loading/error states explicit to avoid hydration issues
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, AuthProvider } from "@/lib/auth"
import { businessStore } from "@/lib/business-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BusinessReviews } from "@/components/business-reviews"
import { BusinessGallery } from "@/components/business-gallery"
import { Footer } from "@/components/footer"
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  Mail, 
  Users, 
  Calendar,
  Award,
  Building,
  Navigation
} from "lucide-react"

interface Business {
  id: string
  name: string
  category: string
  rating?: number
  reviewCount?: number
  address: string
  phone: string
  hours: string
  description: string
  priceRange?: string
  distance?: number
  images?: string[]
  website?: string
  email?: string
  foundedYear?: string
  employeeCount?: string
  specialties?: string[]
  awards?: string
  aboutCompany?: string
  mission?: string
  services?: string[]
  amenities?: string[]
  paymentMethods?: string[]
  languages?: string[]
  accessibility?: boolean
  parking?: boolean
  wifi?: boolean
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

function BusinessDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const businessId = params.id as string

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await businessStore.getById(businessId)

        if (fetchError) {
          console.error('Error fetching business:', fetchError)
          setError('Business not found')
          return
        }

        if (!data) {
          setError('Business not found')
          return
        }

        setBusiness(data)
        // Fire-and-forget view tracking
        try {
          await businessStore.trackView(data.id, 'direct')
        } catch {}
      } catch (error) {
        console.error('Error:', error)
        setError('Failed to load business details')
      } finally {
        setLoading(false)
      }
    }

    if (businessId) {
      fetchBusiness()
    }
  }, [businessId])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <span>Loading business details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The business you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
          </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try { await businessStore.trackContact(business.id, 'phone') } catch {}
                  window.open(`tel:${business.phone}`)
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button
                onClick={async () => {
                  try { await businessStore.trackContact(business.id, 'directions') } catch {}
                  window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(business.address)}`)
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Business Image */}
                  <div className="w-full sm:w-48 h-48 flex-shrink-0">
                <div
                      className="w-full h-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setGalleryOpen(true)}
                >
                      <img
                        src={business.images?.[0] || "/placeholder.svg"}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                      {business.images && business.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          +{business.images.length - 1} more
                      </div>
                      )}
                    </div>
                </div>

                  {/* Business Info */}
                    <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                        <Badge variant="secondary" className="mb-2">
                          {business.category}
                        </Badge>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(business.rating || 0)}
                          <span className="text-gray-600">
                            {(business.rating ?? 0).toFixed(1)} ({business.reviewCount ?? 0} reviews)
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {business.priceRange} • {(business.distance ?? 0).toFixed(1)} miles away
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{business.description}</p>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{business.address}</span>
                    </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{business.phone}</span>
                  </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{business.hours}</span>
                  </div>
                  {business.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                        <a 
                          href={business.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                    </div>
                  )}
                  {business.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`mailto:${business.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {business.email}
                        </a>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            {business.aboutCompany && (
              <Card>
                <CardHeader>
                  <CardTitle>About {business.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{business.aboutCompany}</p>
                  {business.mission && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Our Mission</h4>
                      <p className="text-blue-800">{business.mission}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Services & Amenities */}
            {(business.services?.length || business.amenities?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle>Services & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {business.services?.length && (
                      <div>
                        <h4 className="font-semibold mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                      </div>
                    )}
                    {business.amenities?.length && (
                      <div>
                        <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                          {business.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline">
                              {amenity}
                      </Badge>
                    ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <BusinessReviews
              businessId={business.id}
              businessName={business.name}
              currentRating={business.rating || 0}
              reviewCount={business.reviewCount || 0}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    try { await businessStore.trackContact(business.id, 'phone') } catch {}
                    window.open(`tel:${business.phone}`)
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try { await businessStore.trackContact(business.id, 'directions') } catch {}
                    window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(business.address)}`)
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                {business.website && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      try { await businessStore.trackContact(business.id, 'website') } catch {}
                      window.open(business.website, '_blank')
                    }}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                {business.email && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      try { await businessStore.trackContact(business.id, 'email') } catch {}
                      window.open(`mailto:${business.email}`)
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.foundedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Founded: {business.foundedYear}</span>
                  </div>
                )}
                {business.employeeCount && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{business.employeeCount} employees</span>
                  </div>
                )}
                {business.specialties?.length && (
                    <div>
                    <h4 className="font-semibold text-sm mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {business.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {business.awards && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{business.awards}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment & Languages */}
            {(business.paymentMethods?.length || business.languages?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.paymentMethods?.length && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Payment Methods</h4>
                      <div className="flex flex-wrap gap-1">
                    {business.paymentMethods.map((method, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                    </div>
                  )}
                  {business.languages?.length && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1">
                    {business.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {business.images && business.images.length > 0 && (
        <BusinessGallery
          images={business.images}
          businessName={business.name}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <Footer />
    </div>
  )
}

export default function BusinessDetailPage() {
  return (
    <AuthProvider>
      <BusinessDetailPageContent />
    </AuthProvider>
  )
} 