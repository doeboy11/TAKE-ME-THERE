"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star, Phone, Clock, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([
    {
      id: "1",
      name: "Sample Restaurant",
      category: "Restaurant",
      rating: 4.5,
      reviewCount: 128,
      address: "123 Main St, Accra",
      phone: "+233 20 123 4567",
      hours: "Mon-Sat: 8AM-10PM",
      description: "A popular local restaurant serving traditional Ghanaian cuisine.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
    },
    {
      id: "2", 
      name: "Tech Repair Shop",
      category: "Electronics",
      rating: 4.2,
      reviewCount: 89,
      address: "456 Tech Ave, Kumasi",
      phone: "+233 24 987 6543",
      hours: "Mon-Fri: 9AM-6PM",
      description: "Professional electronics repair and maintenance services.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
    }
  ])

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-2">Your saved businesses and services</p>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">Start exploring businesses and save your favorites to see them here.</p>
              <Button asChild>
                <Link href="/">Explore Businesses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((business) => (
              <Card key={business.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFavorite(business.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {business.address}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{business.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{business.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({business.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-3 h-3 mr-1" />
                    {business.phone}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {business.hours}
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}






