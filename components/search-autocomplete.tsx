"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Building2, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface SearchSuggestion {
  id: string
  type: "business" | "category" | "location" | "recent"
  title: string
  subtitle?: string
  category?: string
  address?: string
  rating?: number
  distance?: number
  business?: Business
}

interface SearchAutocompleteProps {
  businesses: Business[]
  value: string
  onChange: (value: string) => void
  onBusinessSelect?: (business: Business) => void
  onCategorySelect?: (category: string) => void
  placeholder?: string
  className?: string
}

export function SearchAutocomplete({
  businesses,
  value,
  onChange,
  onBusinessSelect,
  onCategorySelect,
  placeholder = "Search businesses, services...",
  className = "",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, [])

  // Generate suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      // Show recent searches when input is empty
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        type: "recent",
        title: search,
        subtitle: "Recent search",
      }))

      // Show popular categories
      const popularCategories = [
        "Restaurant",
        "Chop Bar",
        "Hair Salon",
        "Auto Repair",
        "Pharmacy",
        "Electronics Repair",
      ]
      const categorySuggestions: SearchSuggestion[] = popularCategories.map((cat) => ({
        id: `category-${cat}`,
        type: "category",
        title: cat,
        subtitle: `Browse ${cat.toLowerCase()}s in Ghana`,
      }))

      setSuggestions([...recentSuggestions, ...categorySuggestions])
      return
    }

    const query = value.toLowerCase().trim()
    const newSuggestions: SearchSuggestion[] = []

    // Business name matches
    const businessMatches = businesses
      .filter((business) => business.name.toLowerCase().includes(query))
      .slice(0, 5)
      .map((business) => ({
        id: `business-${business.id}`,
        type: "business" as const,
        title: business.name,
        subtitle: business.description,
        category: business.category,
        address: business.address,
        rating: business.rating,
        distance: business.distance,
        business,
      }))

    // Category matches
    const categories = Array.from(new Set(businesses.map((b) => b.category)))
    const categoryMatches = categories
      .filter((category) => category.toLowerCase().includes(query))
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category}`,
        type: "category" as const,
        title: category,
        subtitle: `Browse all ${category.toLowerCase()}s`,
      }))

    // Location matches (addresses)
    const locationMatches = businesses
      .filter((business) => business.address.toLowerCase().includes(query))
      .slice(0, 3)
      .map((business) => ({
        id: `location-${business.id}`,
        type: "location" as const,
        title: business.address,
        subtitle: `${business.name} - ${business.category}`,
        business,
      }))

    // Service/description matches
    const serviceMatches = businesses
      .filter(
        (business) =>
          business.description.toLowerCase().includes(query) && !business.name.toLowerCase().includes(query), // Avoid duplicates
      )
      .slice(0, 3)
      .map((business) => ({
        id: `service-${business.id}`,
        type: "business" as const,
        title: business.name,
        subtitle: business.description,
        category: business.category,
        address: business.address,
        rating: business.rating,
        distance: business.distance,
        business,
      }))

    // Combine and prioritize suggestions
    newSuggestions.push(...businessMatches, ...categoryMatches, ...locationMatches, ...serviceMatches)

    // Remove duplicates and limit total suggestions
    const uniqueSuggestions = newSuggestions
      .filter((suggestion, index, self) => self.findIndex((s) => s.id === suggestion.id) === index)
      .slice(0, 8)

    setSuggestions(uniqueSuggestions)
  }, [value, businesses, recentSearches])

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  // Handle input blur
  const handleBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => setIsOpen(false), 200)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case "business":
      case "location":
        if (suggestion.business) {
          onChange(suggestion.business.name)
          onBusinessSelect?.(suggestion.business)
          addToRecentSearches(suggestion.business.name)
        }
        break
      case "category":
        onChange(suggestion.title)
        onCategorySelect?.(suggestion.title)
        addToRecentSearches(suggestion.title)
        break
      case "recent":
        onChange(suggestion.title)
        break
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Add to recent searches
  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xs ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ))
  }

  // Get suggestion icon
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case "business":
        return <Building2 className="w-4 h-4 text-blue-500" />
      case "category":
        return <Search className="w-4 h-4 text-green-500" />
      case "location":
        return <MapPin className="w-4 h-4 text-red-500" />
      case "recent":
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`pl-10 ${className}`}
          autoComplete="off"
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            <div ref={suggestionsRef} className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex-shrink-0 mt-0.5">{getSuggestionIcon(suggestion)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{suggestion.title}</p>
                        {suggestion.subtitle && (
                          <p className="text-sm text-gray-500 truncate mt-0.5">{suggestion.subtitle}</p>
                        )}
                      </div>

                      {/* Business-specific info */}
                      {suggestion.type === "business" && suggestion.rating && (
                        <div className="flex-shrink-0 ml-2 text-right">
                          <div className="flex items-center gap-1">
                            {renderStars(suggestion.rating)}
                            <span className="text-xs text-gray-500 ml-1">{suggestion.rating}</span>
                          </div>
                          {suggestion.distance !== undefined && (
                            <p className="text-xs text-gray-400 mt-0.5">{suggestion.distance.toFixed(1)} mi</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Additional info row */}
                    <div className="flex items-center gap-2 mt-1">
                      {suggestion.category && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      )}
                      {suggestion.address && suggestion.type === "business" && (
                        <span className="text-xs text-gray-400 truncate">{suggestion.address}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with tips */}
            <div className="border-t border-gray-100 p-2 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">Use ↑↓ to navigate, Enter to select, Esc to close</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
