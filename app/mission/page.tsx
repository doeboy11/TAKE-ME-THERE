"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Heart, Users, Globe, Star, Award } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function MissionPage() {
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
            Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering local businesses and strengthening communities across Ghana through digital innovation
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Our Mission Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                To empower local businesses and strengthen communities across Ghana by providing a comprehensive, 
                user-friendly platform that connects customers with trusted local services and products.
              </p>
              <p>
                We believe that every local business deserves the opportunity to thrive in the digital age. 
                Our platform bridges the gap between traditional local commerce and modern digital connectivity, 
                ensuring that Ghanaian businesses can reach more customers and grow sustainably.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-600" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                To become Ghana's most trusted and comprehensive local business directory, fostering economic 
                growth and community development through digital innovation and local business support.
              </p>
              <p>
                We envision a Ghana where every local business, no matter how small, has the digital tools 
                and reach to compete and succeed. A Ghana where communities are strengthened through local 
                commerce and where customers can easily discover and support their neighborhood businesses.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community First</h3>
                <p className="text-gray-600 text-sm">
                  We prioritize the needs of local communities and businesses in all our decisions and actions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600 text-sm">
                  We strive for excellence in everything we do, from platform development to customer support.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trust & Reliability</h3>
                <p className="text-gray-600 text-sm">
                  We verify all businesses and maintain high standards for quality and customer service.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  We continuously innovate to provide the best possible experience for our users.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="text-gray-600 text-sm">
                  We operate with honesty, transparency, and ethical business practices at all times.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Impact</h3>
                <p className="text-gray-600 text-sm">
                  We measure our success by the positive impact we create for businesses and communities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Short-term Goals (1-2 years)</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>List 5,000+ verified businesses across Ghana</li>
                  <li>Serve 50,000+ active customers monthly</li>
                  <li>Expand to all 16 regions of Ghana</li>
                  <li>Launch mobile app for better accessibility</li>
                  <li>Implement advanced search and filtering features</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Long-term Goals (3-5 years)</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Become Ghana's #1 local business directory</li>
                  <li>Facilitate 1 million+ business-customer connections annually</li>
                  <li>Launch business analytics and growth tools</li>
                  <li>Expand to other West African countries</li>
                  <li>Develop AI-powered business recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-sm text-gray-600">Businesses Listed</div>
                <p className="text-xs text-gray-500 mt-1">
                  Helping local businesses establish digital presence
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
                <p className="text-xs text-gray-500 mt-1">
                  Connecting customers with trusted local services
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">16</div>
                <div className="text-sm text-gray-600">Regions Covered</div>
                <p className="text-xs text-gray-500 mt-1">
                  Serving communities across all of Ghana
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commitment */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                We are committed to making a positive difference in Ghana's business landscape. Our platform 
                is more than just a directory – it's a catalyst for economic growth and community development.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Businesses</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Free basic listings to ensure accessibility</li>
                    <li>Verification process to build trust</li>
                    <li>Tools to manage and grow your online presence</li>
                    <li>Support and resources for digital transformation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Communities</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Easy discovery of local services and products</li>
                    <li>Verified business information for safety</li>
                    <li>Reviews and ratings for informed decisions</li>
                    <li>Support for local economic development</li>
                  </ul>
                </div>
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
                Help us empower more local businesses and strengthen communities across Ghana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/business/register">
                  <Button size="lg" variant="secondary">
                    List Your Business
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Learn More About Us
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






