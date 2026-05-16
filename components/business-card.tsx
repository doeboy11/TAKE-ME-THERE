"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Star } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"

interface BusinessCardProps {
  business: {
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
    distance: number
    image: string
    images: string[]
  }
  selected?: boolean
  onSelect?: () => void
  onGalleryOpen?: () => void
  userLocation?: { lat: number; lng: number } | null
  index?: number
}

export function BusinessCard({ business, selected, onSelect, onGalleryOpen, userLocation, index = 0 }: BusinessCardProps) {
  const router = useRouter()

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
      />
    ))
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border ${
        selected
          ? "border-primary ring-1 ring-primary shadow-md"
          : "border-border hover:border-primary/50"
      } animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row">
        <div
          className="w-full sm:w-40 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-muted"
          onClick={(e) => {
            e.stopPropagation()
            onGalleryOpen?.()
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
              <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-lg backdrop-blur-sm font-medium">
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

        <div className="flex-1 p-5">
          <CardHeader className="p-0 mb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold mb-1.5 truncate">{business.name}</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                  {business.category}
                </Badge>
              </div>
              <FavoriteButton businessId={business.id} />
              <div className="flex items-center gap-1 text-sm">
                <div className="flex items-center gap-0.5">
                  {renderStars(business.rating)}
                </div>
                <span className="font-semibold ml-1">{business.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({business.reviewCount})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{business.description}</p>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm truncate">{business.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm">{business.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm">{business.hours}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{business.priceRange}</span>
                {userLocation && business.distance > 0 && (
                  <span className="text-sm text-muted-foreground">{business.distance.toFixed(1)} miles</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
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
  )
}
