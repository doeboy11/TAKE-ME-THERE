"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Users, Shield, Star } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function HelpPage() {
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const faqs = [
    {
      id: "business-listing",
      category: "Business Owners",
      question: "How do I list my business on Take Me There?",
      answer: "To list your business, click 'List Your Business' in the header, fill out the registration form with your business details, and submit for review. We'll verify your information and approve your listing within 24-48 hours."
    },
    {
      id: "verification-time",
      category: "Business Owners",
      question: "How long does business verification take?",
      answer: "Most businesses are verified within 24-48 hours. We'll send you an email notification once your listing is approved and live on our platform."
    },
    {
      id: "update-profile",
      category: "Business Owners",
      question: "How can I update my business information?",
      answer: "Log into your business dashboard, go to 'My Businesses', and click 'Edit' on the business you want to update. You can modify all information including photos, services, and contact details."
    },
    {
      id: "find-business",
      category: "Customers",
      question: "How do I find a specific business?",
      answer: "Use the search bar on the homepage to search by business name, category, or service. You can also browse by category or use location filters to find businesses near you."
    },
    {
      id: "contact-business",
      category: "Customers",
      question: "How do I contact a business?",
      answer: "Each business profile includes contact information like phone number, email, and address. You can call directly, send an email, or visit their location using the provided address."
    },
    {
      id: "write-review",
      category: "Customers",
      question: "How do I write a review for a business?",
      answer: "Visit the business profile page and click 'Write a Review'. You'll need to create an account or log in to submit your review. Reviews help other customers make informed decisions."
    },
    {
      id: "account-creation",
      category: "General",
      question: "Do I need an account to use Take Me There?",
      answer: "No, you can search and browse businesses without an account. However, you'll need to create an account to write reviews, save favorite businesses, or list your own business."
    },
    {
      id: "privacy",
      category: "General",
      question: "Is my personal information safe?",
      answer: "Yes, we take your privacy seriously. We never share personal information with third parties and use industry-standard security measures to protect your data. Read our Privacy Policy for more details."
    },
    {
      id: "pricing",
      category: "Business Owners",
      question: "How much does it cost to list my business?",
      answer: "Basic business listings are completely free! We offer premium features for businesses who want enhanced visibility and additional tools to grow their customer base."
    },
    {
      id: "support-hours",
      category: "General",
      question: "What are your support hours?",
      answer: "Our support team is available Monday through Friday, 8:00 AM to 6:00 PM GMT. For urgent matters, you can call us directly at +233 540 997 993."
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using Take Me There",
      icon: BookOpen,
      color: "blue",
      links: [
        { name: "How to Search Businesses", href: "#search-guide" },
        { name: "Creating an Account", href: "#account-guide" },
        { name: "Understanding Business Profiles", href: "#profile-guide" }
      ]
    },
    {
      title: "For Business Owners",
      description: "Everything you need to list and manage your business",
      icon: Users,
      color: "green",
      links: [
        { name: "Listing Your Business", href: "#listing-guide" },
        { name: "Managing Your Profile", href: "#management-guide" },
        { name: "Responding to Reviews", href: "#reviews-guide" }
      ]
    },
    {
      title: "For Customers",
      description: "How to find and interact with businesses",
      icon: Star,
      color: "purple",
      links: [
        { name: "Finding Local Businesses", href: "#finding-guide" },
        { name: "Writing Reviews", href: "#writing-reviews" },
        { name: "Contacting Businesses", href: "#contacting-guide" }
      ]
    }
  ]

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
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of Take Me There Ghana
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="py-6">
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get help from our support team
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="py-6">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-4">
                Speak directly with our team
              </p>
              <Button variant="outline" size="sm" onClick={() => window.open('tel:+233540997993')}>
                +233 540 997 993
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="py-6">
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Send us an email for detailed help
              </p>
              <Button variant="outline" size="sm" onClick={() => window.open('mailto:info@takemetheregh.com')}>
                info@takemetheregh.com
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className={`h-6 w-6 text-${category.color}-600`} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.links.map((link) => (
                      <Link key={link.name} href={link.href}>
                        <Button variant="ghost" className="w-full justify-start text-sm">
                          {link.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {faq.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      {expandedFaqs[faq.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedFaqs[faq.id] && (
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Support Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Support Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM GMT</p>
                  <p>Saturday: 9:00 AM - 2:00 PM GMT</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Methods</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Phone: +233 540 997 993</p>
                  <p>Email: info@takemetheregh.com</p>
                  <p>Address: Kumasi Digital Centre, Stadium Asafo, Ashanti, Ghana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-lg mb-6 opacity-90">
                Our support team is here to help you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary">
                    Contact Support
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.open('tel:+233540997993')}
                >
                  Call Us Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}






