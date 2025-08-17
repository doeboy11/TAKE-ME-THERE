'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadForm } from './image-upload-form'
import { ImageGallery } from './image-gallery'
import { UploadedImage } from '@/hooks/use-image-upload'
import { supabase } from '@/lib/supabaseClient'
import TagInput from '@/components/ui/tag-input'
import { TimeScrollInput } from '@/components/ui/time-scroll-input'

interface BusinessFormData {
  name: string
  category: string
  description: string
  address: string
  phone: string
  images: string[]
  // Specialties tags (accept any text; spaces allowed)
  specialties: string[]
  // Weekly hours
  hours: Record<string, { open: string; close: string; closed: boolean }>
}

export function BusinessFormWithImages() {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    images: [],
    specialties: [],
    hours: {
      Monday: { open: '09:00', close: '17:00', closed: false },
      Tuesday: { open: '09:00', close: '17:00', closed: false },
      Wednesday: { open: '09:00', close: '17:00', closed: false },
      Thursday: { open: '09:00', close: '17:00', closed: false },
      Friday: { open: '09:00', close: '17:00', closed: false },
      Saturday: { open: '10:00', close: '16:00', closed: false },
      Sunday: { open: '10:00', close: '16:00', closed: true },
    }
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

      // Serialize weekly hours as JSON string (stored in TEXT column `hours`)
      const hoursJson = JSON.stringify(formData.hours)

      // Insert business into database
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          hours: hoursJson,
          specialties: formData.specialties,
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
        category: '',
        description: '',
        address: '',
        phone: '',
        images: [],
        specialties: [],
        hours: {
          Monday: { open: '09:00', close: '17:00', closed: false },
          Tuesday: { open: '09:00', close: '17:00', closed: false },
          Wednesday: { open: '09:00', close: '17:00', closed: false },
          Thursday: { open: '09:00', close: '17:00', closed: false },
          Friday: { open: '09:00', close: '17:00', closed: false },
          Saturday: { open: '10:00', close: '16:00', closed: false },
          Sunday: { open: '10:00', close: '16:00', closed: true },
        }
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
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  placeholder="e.g. Salon, Restaurant, Boutique"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
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
                required
                placeholder="Enter business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
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

            {/* Specialties (tag input; accepts any text incl. spaces) */}
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <TagInput
                value={formData.specialties}
                onChange={(next) => setFormData(prev => ({ ...prev, specialties: next }))}
                placeholder="Type a specialty and press Enter (spaces allowed)"
              />
              <p className="text-xs text-muted-foreground">Add as many as you like. No special separators required.</p>
            </div>

            {/* Weekly Hours */}
            <div className="space-y-3">
              <Label>Operating Hours (per day)</Label>
              <HoursEditor 
                value={formData.hours}
                onChange={(next) => setFormData(prev => ({ ...prev, hours: next }))}
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
              disabled={isSubmitting || !formData.name || !formData.category}
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

// Helper: hours editor with scrollable time selects
function HoursEditor({
  value,
  onChange,
}: {
  value: Record<string, { open: string; close: string; closed: boolean }>
  onChange: (v: Record<string, { open: string; close: string; closed: boolean }>) => void
}) {
  const days = useMemo(
    () => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    []
  )

  const timeOptions = useMemo(() => {
    const opts: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, '0')
        const mm = m.toString().padStart(2, '0')
        opts.push(`${hh}:${mm}`)
      }
    }
    return opts
  }, [])

  const updateDay = (day: string, patch: Partial<{ open: string; close: string; closed: boolean }>) => {
    const next = { ...value, [day]: { ...value[day], ...patch } }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const row = value[day]
        return (
          <div key={day} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
            <div className="col-span-1 font-medium">{day}</div>
            <div className="col-span-2 flex items-center gap-2">
              <label className="text-sm">Open</label>
              <div className="w-full">
                <TimeScrollInput
                  ariaLabel={`${day} open time`}
                  value={row.open}
                  onChange={(val) => updateDay(day, { open: val })}
                  className={row.closed ? 'opacity-50 pointer-events-none' : ''}
                />
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <label className="text-sm">Close</label>
              <div className="w-full">
                <TimeScrollInput
                  ariaLabel={`${day} close time`}
                  value={row.close}
                  onChange={(val) => updateDay(day, { close: val })}
                  className={row.closed ? 'opacity-50 pointer-events-none' : ''}
                />
              </div>
            </div>
            <div className="sm:col-span-5 flex items-center gap-2">
              <input
                id={`${day}-closed`}
                type="checkbox"
                checked={row.closed}
                onChange={(e) => updateDay(day, { closed: e.target.checked })}
              />
              <Label htmlFor={`${day}-closed`} className="text-sm">Closed</Label>
            </div>
          </div>
        )
      })}
    </div>
  )
}
