'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadForm } from './image-upload-form'
import { ImageGallery } from './image-gallery'
import { UploadedImage } from '@/hooks/use-image-upload'
import { supabase } from '@/lib/supabaseClient'

interface BusinessFormData {
  name: string
  description: string
  address: string
  phone: string
  images: string[]
}

export function BusinessFormWithImages() {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImagesChange = (images: UploadedImage[]) => {
    const imageUrls = images.map(img => img.url)
    setFormData(prev => ({ ...prev, images: imageUrls }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user?.id) {
        throw new Error('You must be logged in to create a business')
      }

      // Insert business into database
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          owner_id: userData.user.id,
          approval_status: 'pending'
        })
        .select('id')
        .single()

      if (businessError) {
        throw new Error(businessError.message)
      }

      // Insert images into business_images table
      if (formData.images.length > 0) {
        const imageRows = formData.images.map((url, index) => ({
          business_id: businessData.id,
          image_url: url,
          is_primary: index === 0
        }))

        const { error: imageError } = await supabase
          .from('business_images')
          .insert(imageRows)

        if (imageError) {
          console.error('Failed to save images:', imageError)
          // Don't fail the whole submission for image errors
        }
      }

      setSubmitSuccess(true)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        images: []
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create business'
      setSubmitError(message)
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Business</CardTitle>
          <CardDescription>
            Fill in your business details and upload images to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your business"
                rows={4}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Business Images</Label>
              <ImageUploadForm
                onImagesChange={handleImagesChange}
                maxImages={5}
                className="border rounded-lg p-4"
              />
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <ImageGallery 
                  images={formData.images}
                  alt="Business preview"
                  className="max-w-md"
                />
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Success Display */}
            {submitSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Business created successfully! It will be reviewed and approved soon.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name}
              className="w-full"
            >
              {isSubmitting ? 'Creating Business...' : 'Create Business'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
