"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accessibility, Eye, Ear, Hand } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Accessibility Statement
          </h1>
          <p className="text-xl text-gray-600">
            Our commitment to making Take Me There Ghana accessible to everyone
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-6 w-6 text-blue-600" />
              Our Accessibility Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Take Me There Ghana is committed to ensuring digital accessibility for people with disabilities. 
                We strive to conform to WCAG 2.1 Level AA standards and continuously improve our platform's accessibility.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Accessibility Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visual Accessibility</h3>
                <p className="text-gray-600 text-sm">
                  High contrast options, resizable text, and clear typography for better readability.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ear className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Support</h3>
                <p className="text-gray-600 text-sm">
                  Compatible with screen readers and assistive technologies for audio navigation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hand className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
                <p className="text-gray-600 text-sm">
                  Full keyboard navigation support for users who cannot use a mouse.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <p>
                If you experience accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> accessibility@takemetheregh.com</p>
                <p><strong>Phone:</strong> +233 540 997 993</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-8">
              <h2 className="text-xl font-bold mb-4">Help Us Improve</h2>
              <p className="mb-6 opacity-90">
                Your feedback helps us make Take Me There Ghana accessible to everyone.
              </p>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Report an Issue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
