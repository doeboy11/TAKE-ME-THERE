'use client'

import { useEffect, useState } from 'react'
import { MapPin, Star, Phone, Clock, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface BusinessMapProps {
  businesses: Business[]
  onBusinessSelect?: (business: Business) => void
  userLocation?: { lat: number; lng: number } | null
}

export default function BusinessMap({ businesses, onBusinessSelect, userLocation }: BusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState('map')

  // Filter businesses with coordinates
  const businessesWithCoords = businesses.filter(business => business.lat && business.lng)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business)
    onBusinessSelect?.(business)
  }

  const generateGoogleMapsUrl = () => {
    if (businessesWithCoords.length === 0) return ''
    
    const markers = businessesWithCoords.map(business => 
      `${business.lat},${business.lng}`
    ).join('|')
    
    const center = userLocation 
      ? `${userLocation.lat},${userLocation.lng}`
      : businessesWithCoords.length > 0
        ? `${businessesWithCoords[0].lat},${businessesWithCoords[0].lng}`
        : '5.5600,-0.2057' // Accra, Ghana
    
    return `https://www.google.com/maps/dir/${center}/${markers}`
  }

  const generateStaticMapUrl = () => {
    if (businessesWithCoords.length === 0) return ''
    
    const center = userLocation 
      ? `${userLocation.lat},${userLocation.lng}`
      : businessesWithCoords.length > 0
        ? `${businessesWithCoords[0].lat},${businessesWithCoords[0].lng}`
        : '5.5600,-0.2057'
    
    const markers = businessesWithCoords.map((business, index) => 
      `markers=color:red|label:${index + 1}|${business.lat},${business.lng}`
    ).join('&')
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=12&size=600x400&${markers}&key=YOUR_API_KEY`
  }

  if (businessesWithCoords.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Locations</h3>
          <p className="text-sm text-gray-600">
            No businesses with location data available
          </p>
        </div>
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Business Locations</h3>
            <p className="text-gray-500">Business locations will appear here once they are added to the directory.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Locations</h3>
        <p className="text-sm text-gray-600">
          {businessesWithCoords.length} businesses with locations • 
          {userLocation ? ' Showing distance from your location' : ' Click businesses for details'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="list">Business List</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <div className="relative">
            {/* Google Maps Embed */}
            <div className="w-full h-96 rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${userLocation ? `${userLocation.lat},${userLocation.lng}` : '5.5600,-0.2057'}&zoom=12`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Business markers overlay */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <h4 className="font-semibold text-gray-900 mb-2">Business Locations</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {businessesWithCoords.map((business, index) => (
                    <div
                      key={business.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleBusinessSelect(business)}
                    >
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{business.name}</p>
                        <p className="text-xs text-gray-500 truncate">{business.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 z-10">
              <Button
                onClick={() => window.open(generateGoogleMapsUrl(), '_blank')}
                className="bg-white text-gray-900 hover:bg-gray-50 shadow-lg"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <div className="grid gap-4">
            {businessesWithCoords.map((business) => (
              <Card
                key={business.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBusinessSelect(business)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {business.image && (
                      <img
                        src={business.image}
                        alt={business.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{business.name}</h4>
                          <div className="flex items-center gap-1 mb-2">
                            {renderStars(business.rating)}
                            <span className="text-xs text-gray-500">({business.reviewCount})</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {business.category}
                          </Badge>
                          {business.priceRange && (
                            <Badge variant="outline" className="text-xs">
                              {business.priceRange}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{business.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{business.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{business.hours}</span>
                        </div>
                        <div className="text-green-600 font-medium">
                          {(business.distance / 1000).toFixed(1)} km away
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`tel:${business.phone}`)
                      }}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(business.address)}`, '_blank')
                      }}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected business card */}
      {selectedBusiness && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {selectedBusiness.image && (
                <img
                  src={selectedBusiness.image}
                  alt={selectedBusiness.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedBusiness.name}</h4>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(selectedBusiness.rating)}
                  <span className="text-xs text-gray-500">({selectedBusiness.reviewCount})</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {selectedBusiness.category}
                  </Badge>
                  {selectedBusiness.priceRange && (
                    <Badge variant="outline" className="text-xs">
                      {selectedBusiness.priceRange}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{selectedBusiness.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{selectedBusiness.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{selectedBusiness.hours}</span>
                  </div>
                  <div className="text-green-600 font-medium">
                    {(selectedBusiness.distance / 1000).toFixed(1)} km away
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => window.open(`tel:${selectedBusiness.phone}`)}
              >
                <Phone className="w-3 h-3 mr-1" />
                Call Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(selectedBusiness.address)}`, '_blank')}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 