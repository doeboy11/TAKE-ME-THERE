"use client"

import { useEffect, useState } from "react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface BusinessGalleryProps {
  images: string[]
  businessName: string
  isOpen: boolean
  onClose: () => void
}

export function BusinessGallery({ images, businessName, isOpen, onClose }: BusinessGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  if (!isOpen || !images.length) return null

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Reset error state when image index changes
  useEffect(() => {
    setImgError(false)
  }, [currentIndex])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="relative w-full h-[70vh]">
          <Image
            src={imgError ? "/placeholder.svg?height=400&width=600&text=Image+Not+Found" : (images[currentIndex] || "/placeholder.svg")}
            alt={`${businessName} - Photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain rounded-lg"
            onError={() => setImgError(true)}
          />

          {images.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={nextImage}
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-4 text-white">
          <p className="text-sm">
            {currentIndex + 1} of {images.length} - {businessName}
          </p>
        </div>
      </div>
    </div>
  )
}
