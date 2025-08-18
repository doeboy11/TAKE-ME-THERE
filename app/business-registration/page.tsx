"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ArrowLeft, Upload, CheckCircle } from "lucide-react"
import Link from "next/link"
import imageCompression from "browser-image-compression"
import { businessStore } from "@/lib/business-store"

export default function BusinessRegistrationPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hours: "",
    priceRange: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  })
  const [customCategory, setCustomCategory] = useState("")
  const [priceAmount, setPriceAmount] = useState("")
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const categories = [
    "Restaurant",
    "Retail",
    "Services",
    "Healthcare",
    "Automotive",
    "Beauty",
    "Electronics",
    "Education",
    "Entertainment",
    "Professional Services",
    "Other"
  ]

  const priceRanges = ["₵", "₵₵", "₵₵₵", "₵₵₵₵"]

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.")
      return
    }
    setLocLoading(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
          headers: { "Accept": "application/json" }
        })
        const data = await res.json()
        const display = data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        setFormData((prev) => ({ ...prev, address: display, lat: latitude, lng: longitude }))
      } catch (e) {
        setLocError("Failed to fetch address from location. Please enter manually.")
      } finally {
        setLocLoading(false)
      }
    }, (err) => {
      setLocError(err.message || "Unable to get your location.")
      setLocLoading(false)
    }, { enableHighAccuracy: true, timeout: 15000 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)
    try {
      // 1) Optionally upload the image first (with compression)
      let finalImageUrl: string | null = uploadedImageUrl
      if (imageFile && !uploadedImageUrl) {
        setUploading(true)
        try {
          const compressed = await imageCompression(imageFile, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            maxIteration: 10,
            initialQuality: 0.8,
          })
          const uniqueName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`
          const { data, error } = await businessStore.uploadImage(uniqueName, compressed as File)
          if (error || !data?.url) {
            throw new Error(error?.message || "Failed to upload image")
          }
          finalImageUrl = data.url
          setUploadedImageUrl(finalImageUrl)
        } catch (err: any) {
          setUploadError(err?.message || "Image upload failed")
          throw err
        } finally {
          setUploading(false)
        }
      }

      // 2) Create business row (minimal required + extras available on form)
      const payload: any = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email || undefined,
        website: formData.website || undefined,
        hours: formData.hours || undefined,
        priceRange: formData.priceRange || undefined,
        lat: formData.lat,
        lng: formData.lng,
        images: finalImageUrl ? [finalImageUrl] : [],
      }

      const { data, error, status } = await businessStore.create(payload)
      if (error) {
        const msg = (error as any)?.message || `Failed to submit (status ${status || 400})`
        throw new Error(msg)
      }

      // 3) Success: reset form and show submitted UI
      setFormData({
        name: "",
        category: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        hours: "",
        priceRange: "",
        lat: undefined,
        lng: undefined,
      })
      setPriceAmount("")
      setImageFile(null)
      setImagePreview(null)
      setUploadedImageUrl(null)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Submit failed:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for registering your business. Our team will review your submission and contact you within 2-3 business days.
              </p>
              <div className="space-y-3">
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Register Your Business</h1>
            <p className="text-xl text-gray-600 mb-2">Join our platform and connect with customers in your area</p>
            <p className="text-sm text-gray-500">Get discovered by local customers searching for your services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                  Business Information
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Provide accurate information about your business to help customers find you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => {
                        handleInputChange("category", value)
                        if (value !== 'Other') setCustomCategory('')
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.category === 'Other' && (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                          />
                          <Button type="button" variant="outline" onClick={() => {
                            const value = customCategory.trim()
                            if (value) {
                              handleInputChange('category', value)
                              setCustomCategory('')
                            }
                          }}>Use</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Business Image</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setImageFile(f || null)
                          setUploadedImageUrl(null)
                          setUploadError(null)
                          if (f) {
                            const url = URL.createObjectURL(f)
                            setImagePreview(url)
                          } else {
                            setImagePreview(null)
                          }
                        }}
                        disabled={uploading || isSubmitting}
                      />
                      {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
                    </div>
                    {imagePreview && (
                      <div className="mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded border" />
                      </div>
                    )}
                    {uploadedImageUrl && (
                      <p className="text-xs text-green-600">Image uploaded.</p>
                    )}
                    {uploadError && (
                      <p className="text-xs text-red-600">{uploadError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your business, services, and what makes you unique"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Enter your business address"
                          required
                        />
                        <Button type="button" variant="outline" onClick={() => void useMyLocation()} disabled={locLoading}>
                          {locLoading ? 'Locating...' : 'Use my location'}
                        </Button>
                      </div>
                      {locError && <p className="text-xs text-red-600">{locError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+233 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        type="email"
                        placeholder="business@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours">Business Hours</Label>
                      <Input
                        id="hours"
                        value={formData.hours}
                        onChange={(e) => handleInputChange("hours", e.target.value)}
                        placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceRange">Typical Price (₵)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₵</span>
                        <Input
                          id="priceRange"
                          inputMode="decimal"
                          placeholder="e.g., 50"
                          value={priceAmount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.,]/g, '')
                            setPriceAmount(val)
                            handleInputChange('priceRange', val ? `₵${val.replace(',', '.')}` : '')
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Enter an average price customers can expect.</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Submitting..." : uploading ? "Uploading image..." : "Submit Registration"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900">Why Register?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Reach More Customers</h4>
                    <p className="text-sm text-gray-600">Get discovered by local customers searching for your services</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Free Listing</h4>
                    <p className="text-sm text-gray-600">Basic listings are completely free with no hidden fees</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Easy Management</h4>
                    <p className="text-sm text-gray-600">Update your information anytime through your dashboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Customer Reviews</h4>
                    <p className="text-sm text-gray-600">Build trust with customer reviews and ratings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Valid business license</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Physical business location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Contact information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Business description</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Our team is here to help you get started. Contact us for assistance.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
