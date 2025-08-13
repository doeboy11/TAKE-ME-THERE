"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react"

interface NavigationArrowsProps {
  currentIndex?: number
  totalItems?: number
  onPrevious?: () => void
  onNext?: () => void
  showBackToTop?: boolean
  className?: string
}

export function NavigationArrows({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  showBackToTop = true,
  className = "",
}: NavigationArrowsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const hasPrevious = currentIndex !== undefined && currentIndex > 0
  const hasNext = currentIndex !== undefined && totalItems !== undefined && currentIndex < totalItems - 1

  return (
    <>
      {/* Fixed Navigation Arrows */}
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 space-y-2 ${className}`}>
        {/* Previous Button */}
        {onPrevious && (
          <Button
            onClick={onPrevious}
            disabled={!hasPrevious}
            variant="outline"
            size="sm"
            className={`w-10 h-10 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all duration-200 ${
              !hasPrevious ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Next Button */}
        {onNext && (
          <Button
            onClick={onNext}
            disabled={!hasNext}
            variant="outline"
            size="sm"
            className={`w-10 h-10 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all duration-200 ${
              !hasNext ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Current Position Indicator */}
        {currentIndex !== undefined && totalItems !== undefined && totalItems > 1 && (
          <div className="bg-white rounded-full px-2 py-1 shadow-lg text-xs text-gray-600 text-center min-w-[60px]">
            {currentIndex + 1} / {totalItems}
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showBackToTop && showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full shadow-lg bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </>
  )
}
