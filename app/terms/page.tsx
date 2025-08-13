"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Users, AlertTriangle, Calendar } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="text-xl text-gray-600">
            The terms and conditions governing your use of Take Me There Ghana
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
              <FileText className="h-6 w-6 text-blue-600" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                By accessing and using Take Me There Ghana ("the Platform"), you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
              <p>
                These Terms of Use ("Terms") govern your use of our website and services. Please read these 
                Terms carefully before using our platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Description of Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Take Me There Ghana is a local business directory platform that connects customers with 
                businesses across Ghana. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Business listings and profiles</li>
                <li>Customer reviews and ratings</li>
                <li>Search and discovery tools</li>
                <li>Business-customer communication facilitation</li>
                <li>Location-based services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Accounts and Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                To access certain features of our platform, you may be required to create an account. 
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information is up to date</li>
              </ul>
              <p>
                We reserve the right to terminate accounts that violate these Terms or engage in 
                fraudulent or illegal activities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You agree not to:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to scrape or collect data</li>
                  <li>Interfere with the proper functioning of the platform</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Owners must:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Provide accurate business information</li>
                  <li>Maintain up-to-date contact details</li>
                  <li>Respond to customer inquiries promptly</li>
                  <li>Comply with all applicable business regulations</li>
                  <li>Respect customer privacy and data protection laws</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content and Reviews */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User-Generated Content and Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Users may submit reviews, ratings, and other content to our platform. By submitting content, 
                you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute 
                your content on our platform.
              </p>
              <p>
                You are responsible for the accuracy and legality of any content you submit. We reserve the 
                right to remove content that violates our policies or applicable laws.
              </p>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Review Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Reviews must be based on actual experiences</li>
                  <li>No personal attacks or defamatory statements</li>
                  <li>No spam, advertising, or promotional content</li>
                  <li>Respectful and constructive feedback only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The platform and its original content, features, and functionality are owned by Take Me There 
                Ghana and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                publicly perform, republish, download, store, or transmit any of the material on our platform, 
                except as follows:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your computer may temporarily store copies of such materials in RAM incidental to your 
                accessing and viewing those materials</li>
                <li>You may store files that are automatically cached by your Web browser for display 
                enhancement purposes</li>
                <li>You may print or download one copy of a reasonable number of pages of the platform 
                for your own personal, non-commercial use</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed 
                by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using our platform, you consent to the collection and use of your information as described 
                in our Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>Service Availability:</strong> We strive to maintain platform availability but do not 
                guarantee uninterrupted access. We may temporarily suspend services for maintenance or updates.
              </p>
              <p>
                <strong>Business Information:</strong> While we verify business listings, we cannot guarantee 
                the accuracy of all information provided by businesses. Users should verify details directly 
                with businesses.
              </p>
              <p>
                <strong>Third-Party Services:</strong> Our platform may contain links to third-party websites 
                or services. We are not responsible for the content or practices of these external sites.
              </p>
              <p>
                <strong>No Warranty:</strong> The platform is provided "as is" without warranties of any kind, 
                either express or implied.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                To the maximum extent permitted by law, Take Me There Ghana shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including but not limited 
                to loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              <p>
                Our total liability to you for any claims arising from your use of our platform shall not 
                exceed the amount you paid us, if any, for accessing our services in the twelve months 
                preceding the claim.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                You agree to defend, indemnify, and hold harmless Take Me There Ghana and its officers, 
                directors, employees, and agents from and against any claims, damages, obligations, losses, 
                liabilities, costs, or debt arising from:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your use of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit to the platform</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We may terminate or suspend your account and access to our platform immediately, without 
                prior notice, for any reason, including breach of these Terms.
              </p>
              <p>
                Upon termination, your right to use the platform will cease immediately. All provisions of 
                these Terms which by their nature should survive termination shall survive termination.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the platform after any changes constitutes acceptance of the new Terms. 
                If you do not agree to the new Terms, you should discontinue use of our platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Ghana, 
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the platform shall be resolved in 
                the courts of Ghana.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <p>
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@takemetheregh.com</p>
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
              <h2 className="text-xl font-bold mb-4">Questions About Our Terms?</h2>
              <p className="mb-6 opacity-90">
                We're committed to transparency and fair practices. Contact us with any questions.
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






