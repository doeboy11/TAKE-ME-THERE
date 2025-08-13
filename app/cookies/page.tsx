"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cookie, Shield, Settings, Calendar } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function CookiesPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600">
            How we use cookies and similar technologies on Take Me There Ghana
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Last updated: January 2025</span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-blue-600" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, 
                analyzing how you use our site, and personalizing content.
              </p>
              <p>
                This Cookie Policy explains how we use cookies and similar technologies on Take Me There Ghana 
                and how you can control them.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies are necessary for the website to function properly. They enable basic functions 
                  like page navigation and access to secure areas.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Authentication and security</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                  <li>Basic site functionality</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Page views and navigation patterns</li>
                  <li>Popular features and content</li>
                  <li>Site performance metrics</li>
                  <li>User behavior analysis</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies enable enhanced functionality and personalization, such as remembering 
                  your preferences and settings.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Language preferences</li>
                  <li>Search history and filters</li>
                  <li>Location settings</li>
                  <li>Display preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies are used to track visitors across websites to display relevant and 
                  engaging advertisements.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Ad targeting and personalization</li>
                  <li>Social media integration</li>
                  <li>Retargeting campaigns</li>
                  <li>Conversion tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We may use third-party services that place cookies on your device. These services help us 
                provide better functionality and analyze our website performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Services</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Google Analytics</li>
                    <li>Hotjar (user behavior)</li>
                    <li>Performance monitoring</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Facebook Pixel</li>
                    <li>Twitter tracking</li>
                    <li>Social sharing buttons</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-green-600" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                You have several options for managing cookies on our website:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Browser Settings</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Disable cookies in your browser</li>
                    <li>Delete existing cookies</li>
                    <li>Set cookie preferences</li>
                    <li>Use incognito/private browsing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Our Cookie Banner</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Accept or decline non-essential cookies</li>
                    <li>Customize cookie preferences</li>
                    <li>Change settings anytime</li>
                    <li>Granular control options</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website. 
                  Essential cookies cannot be disabled as they are necessary for the site to work properly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Data Protection and Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We are committed to protecting your privacy and ensuring that any data collected through 
                cookies is handled in accordance with our Privacy Policy and applicable data protection laws.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Security</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Encrypted data transmission</li>
                    <li>Secure cookie storage</li>
                    <li>Regular security audits</li>
                    <li>Compliance with GDPR</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Rights</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Access your cookie data</li>
                    <li>Request data deletion</li>
                    <li>Opt out of tracking</li>
                    <li>Control cookie preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              <p>
                We will notify you of any material changes by posting the updated policy on this page 
                and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@takemetheregh.com</p>
                <p><strong>Phone:</strong> +233 540 997 993</p>
                <p><strong>Address:</strong> Kumasi Digital Centre, Stadium Asafo, Ashanti, Ghana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-8">
              <h2 className="text-xl font-bold mb-4">Questions About Cookies?</h2>
              <p className="mb-6 opacity-90">
                We're committed to transparency about how we use cookies and protect your privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Privacy Policy
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





