"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, ArrowLeft, Trash2, Filter } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const { user } = useAuth()
  const [searchHistory, setSearchHistory] = useState([
    {
      id: "1",
      query: "restaurants near me",
      location: "Accra, Ghana",
      category: "Restaurant",
      timestamp: "2024-01-15T10:30:00Z",
      results: 24
    },
    {
      id: "2",
      query: "electronics repair",
      location: "Kumasi, Ghana", 
      category: "Electronics",
      timestamp: "2024-01-14T15:45:00Z",
      results: 12
    },
    {
      id: "3",
      query: "hair salon",
      location: "Accra, Ghana",
      category: "Beauty",
      timestamp: "2024-01-13T09:20:00Z",
      results: 18
    },
    {
      id: "4",
      query: "auto repair",
      location: "Tema, Ghana",
      category: "Automotive",
      timestamp: "2024-01-12T14:15:00Z",
      results: 8
    }
  ])

  const removeHistoryItem = (id: string) => {
    setSearchHistory(searchHistory.filter(item => item.id !== id))
  }

  const clearAllHistory = () => {
    setSearchHistory([])
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search History</h1>
              <p className="text-gray-600 mt-2">Your recent searches and discoveries</p>
            </div>
            {searchHistory.length > 0 && (
              <Button variant="outline" onClick={clearAllHistory}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {searchHistory.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No search history</h3>
              <p className="text-gray-600 mb-6">Your search history will appear here once you start exploring businesses.</p>
              <Button asChild>
                <Link href="/">Start Searching</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-lg">{item.query}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(item.timestamp)}
                        </div>
                        <div className="flex items-center">
                          <Filter className="w-3 h-3 mr-1" />
                          {item.results} results
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button size="sm" asChild>
                          <Link href={`/?q=${encodeURIComponent(item.query)}&location=${encodeURIComponent(item.location)}`}>
                            Search Again
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/?q=${encodeURIComponent(item.query)}&location=${encodeURIComponent(item.location)}`}>
                            View Results
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHistoryItem(item.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        {searchHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Search Statistics</CardTitle>
              <CardDescription>Overview of your search activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{searchHistory.length}</div>
                  <div className="text-sm text-gray-600">Total Searches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {searchHistory.reduce((sum, item) => sum + item.results, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Results</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(searchHistory.map(item => item.category)).size}
                  </div>
                  <div className="text-sm text-gray-600">Categories Explored</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





