"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Target, Award, Globe, Heart, Shield, Star } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function AboutPage() {
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
            About Take Me There Ghana
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ghana's premier local business directory, connecting communities with trusted businesses across the country.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To empower local businesses and strengthen communities across Ghana by providing a comprehensive, 
                user-friendly platform that connects customers with trusted local services and products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-green-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To become Ghana's most trusted and comprehensive local business directory, fostering economic 
                growth and community development through digital innovation and local business support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Do */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">What We Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Local Business Discovery</h3>
                <p className="text-gray-600 text-sm">
                  Help customers find the best local businesses in their area with detailed information, 
                  reviews, and contact details.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Growth Support</h3>
                <p className="text-gray-600 text-sm">
                  Provide local businesses with digital presence, customer reach, and growth tools to 
                  expand their market and increase revenue.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Building</h3>
                <p className="text-gray-600 text-sm">
                  Foster strong local communities by connecting businesses with customers and promoting 
                  local economic development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Trust & Reliability</h4>
                  <p className="text-gray-600 text-sm">
                    We verify all businesses and maintain high standards for quality and customer service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Excellence</h4>
                  <p className="text-gray-600 text-sm">
                    We strive for excellence in everything we do, from platform development to customer support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Community First</h4>
                  <p className="text-gray-600 text-sm">
                    We prioritize the needs of local communities and businesses in all our decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Innovation</h4>
                  <p className="text-gray-600 text-sm">
                    We continuously innovate to provide the best possible experience for our users.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Take Me There Ghana was founded in 2024 with a simple yet powerful vision: to connect 
                Ghanaian communities with the best local businesses in their area. What started as a 
                small team in Kumasi has grown into Ghana's most comprehensive local business directory.
              </p>
              
              <p>
                We recognized that many excellent local businesses struggled to reach their customers 
                online, while customers often had difficulty finding reliable local services. This 
                disconnect inspired us to create a platform that bridges this gap.
              </p>
              
              <p>
                Today, we serve thousands of businesses across all 16 regions of Ghana, helping them 
                grow their customer base and increase their revenue. Our platform has become an 
                essential tool for both businesses and customers, fostering stronger local economies 
                and communities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Kwame Asante</h3>
                <p className="text-sm text-gray-600 mb-2">Founder & CEO</p>
                <p className="text-xs text-gray-500">
                  Passionate about local business growth and community development.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Ama Osei</h3>
                <p className="text-sm text-gray-600 mb-2">Head of Operations</p>
                <p className="text-xs text-gray-500">
                  Ensures smooth operations and excellent customer service.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Kofi Mensah</h3>
                <p className="text-sm text-gray-600 mb-2">Technology Lead</p>
                <p className="text-xs text-gray-500">
                  Drives innovation and platform development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-sm text-gray-600">Businesses Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">16</div>
                <div className="text-sm text-gray-600">Regions Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">100+</div>
                <div className="text-sm text-gray-600">Business Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-lg mb-6 opacity-90">
                Help us connect more communities with trusted local businesses across Ghana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/business/register">
                  <Button size="lg" variant="secondary">
                    List Your Business
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Contact Us
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






