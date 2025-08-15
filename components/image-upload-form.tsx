'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useImageUpload, UploadedImage } from '@/hooks/use-image-upload'

interface ImageUploadFormProps {
  businessId?: string
  maxImages?: number
  onImagesChange?: (images: UploadedImage[]) => void
  initialImages?: UploadedImage[]
  className?: string
}

export function ImageUploadForm({ 
  businessId, 
  maxImages = 5, 
  onImagesChange,
  initialImages = [],
  className = '' 
}: ImageUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const { 
    images, 
    isUploading, 
    error, 
    uploadImage, 
    removeImage, 
    setImages 
  } = useImageUpload(maxImages)

  // Initialize with existing images
  React.useEffect(() => {
    if (initialImages.length > 0) {
      setImages(initialImages)
    }
  }, [initialImages, setImages])

  // Notify parent of changes
  React.useEffect(() => {
    onImagesChange?.(images)
  }, [images, onImagesChange])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    const filesToProcess = Math.min(files.length, remainingSlots)

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i]
      if (file && file.type.startsWith('image/')) {
        await uploadImage(file, businessId)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value to allow re-selecting the same file
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={images.length < maxImages ? openFileDialog : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {images.length >= maxImages 
                    ? `Maximum ${maxImages} images reached`
                    : 'Click to upload or drag and drop'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB ({images.length}/{maxImages})
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading || images.length >= maxImages}
      />

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.svg?height=200&width=200&text=Error'
                    }}
                  />
                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {images.length === 0 && !isUploading && (
        <Button 
          onClick={openFileDialog}
          variant="outline" 
          className="w-full"
          disabled={images.length >= maxImages}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Choose Images
        </Button>
      )}
    </div>
  )
}
