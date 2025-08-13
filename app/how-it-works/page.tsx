"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Star, Phone, Calendar, Users, Shield, Award, CheckCircle } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4">
              <Logo size="lg" variant="default" />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How Take Me There Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our platform connects customers with trusted local businesses across Ghana
          </p>
        </div>

        {/* For Customers */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              For Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Search</h3>
                <p className="text-gray-600 text-sm">
                  Search for businesses by category, location, or specific service you need. 
                  Use filters to find exactly what you're looking for.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Compare</h3>
                <p className="text-gray-600 text-sm">
                  View detailed business profiles, read reviews, check ratings, and compare 
                  services to make the best choice for your needs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Connect</h3>
                <p className="text-gray-600 text-sm">
                  Contact businesses directly through phone, email, or visit their location. 
                  Get directions and all the information you need.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Businesses */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-green-600" />
              For Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Register</h3>
                <p className="text-gray-600 text-sm">
                  Create your business profile in just a few minutes. Add your details, 
                  services, and contact information.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Get Verified</h3>
                <p className="text-gray-600 text-sm">
                  Our team reviews and verifies your business to ensure quality and 
                  build trust with customers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Get Customers</h3>
                <p className="text-gray-600 text-sm">
                  Start receiving customer inquiries and grow your business through 
                  our platform's reach.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Grow</h3>
                <p className="text-gray-600 text-sm">
                  Manage your profile, respond to reviews, and use our tools to 
                  expand your customer base.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Verified Businesses</h4>
                  <p className="text-gray-600 text-sm">
                    All businesses are verified to ensure quality and reliability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Detailed Profiles</h4>
                  <p className="text-gray-600 text-sm">
                    Complete business information including services, hours, and contact details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Customer Reviews</h4>
                  <p className="text-gray-600 text-sm">
                    Read and write reviews to help others make informed decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Location Search</h4>
                  <p className="text-gray-600 text-sm">
                    Find businesses near you with GPS location and distance filtering.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Category Filtering</h4>
                  <p className="text-gray-600 text-sm">
                    Browse by business categories to find exactly what you need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Mobile Friendly</h4>
                  <p className="text-gray-600 text-sm">
                    Access our platform on any device with our responsive design.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Categories */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Business Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Restaurants & Food",
                "Auto Services",
                "Beauty & Health",
                "Home Services",
                "Professional Services",
                "Shopping",
                "Entertainment",
                "Education",
                "Medical & Dental",
                "Legal Services",
                "Financial Services",
                "Real Estate",
                "Transportation",
                "Technology",
                "Sports & Fitness",
                "Pet Services"
              ].map((category) => (
                <Badge key={category} variant="secondary" className="text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Ghana Regions We Serve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "Greater Accra",
                "Ashanti Region",
                "Western Region",
                "Central Region",
                "Eastern Region",
                "Northern Region",
                "Volta Region",
                "Upper East",
                "Upper West",
                "Bono Region",
                "Bono East",
                "Ahafo Region",
                "Savannah Region",
                "North East",
                "Western North",
                "Oti Region"
              ].map((region) => (
                <div key={region} className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{region}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How much does it cost to list my business?
                </h4>
                <p className="text-gray-600 text-sm">
                  Basic listings are free! We offer premium features for businesses who want to enhance their visibility.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How long does business verification take?
                </h4>
                <p className="text-gray-600 text-sm">
                  Most businesses are verified within 24-48 hours. We'll notify you once your listing is approved.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I update my business information?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes! Business owners can log into their dashboard to update information, add photos, and manage reviews.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How do I contact a business?
                </h4>
                <p className="text-gray-600 text-sm">
                  Each business profile includes contact information like phone, email, and address. You can call or visit directly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Is my personal information safe?
                </h4>
                <p className="text-gray-600 text-sm">
                  Absolutely. We protect your privacy and never share personal information with third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of businesses and customers already using Take Me There Ghana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/business/register">
                  <Button size="lg" variant="secondary">
                    List Your Business
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Search Businesses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}






