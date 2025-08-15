import { useState, useCallback } from 'react'

export interface UploadedImage {
  url: string
  fileName: string
  path?: string
  file?: File
}

export interface UseImageUploadReturn {
  images: UploadedImage[]
  isUploading: boolean
  error: string | null
  uploadImage: (file: File, businessId?: string) => Promise<void>
  removeImage: (index: number) => Promise<void>
  clearImages: () => void
  setImages: (images: UploadedImage[]) => void
}

export function useImageUpload(maxImages: number = 5): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(async (file: File, businessId?: string) => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (businessId) {
        formData.append('businessId', businessId)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      const newImage: UploadedImage = {
        url: result.url as string,
        fileName: result.fileName as string,
        path: result.path as string | undefined,
        file,
      }

      setImages(prev => [...prev, newImage])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [images.length, maxImages])

  const removeImage = useCallback(async (index: number) => {
    const imageToRemove = images[index]
    if (!imageToRemove) return

    try {
      // Prefer deleting by storage object path (RLS-compliant)
      const qs = imageToRemove.path
        ? `path=${encodeURIComponent(imageToRemove.path)}`
        : `fileName=${encodeURIComponent(imageToRemove.fileName)}` // fallback

      const response = await fetch(`/api/upload?${qs}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Delete failed')
      }

      // Remove from local state
      setImages(prev => prev.filter((_, i) => i !== index))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      console.error('Delete error:', err)
    }
  }, [images])

  const clearImages = useCallback(() => {
    setImages([])
    setError(null)
  }, [])

  const setImagesDirectly = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages)
  }, [])

  return {
    images,
    isUploading,
    error,
    uploadImage,
    removeImage,
    clearImages,
    setImages: setImagesDirectly,
  }
}
