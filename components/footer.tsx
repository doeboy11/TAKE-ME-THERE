"use client"

import { useState } from "react"
import { Plus, Minus, Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Logo from './logo'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const footerSections = [
    {
      title: "About Take Me There",
      items: [
        { name: "About Us", href: "/about" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "Our Mission", href: "/mission" },
        { name: "Contact Us", href: "/contact" },
        { name: "Careers", href: "/careers" },
        { name: "Press & Media", href: "/press" },
        { name: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Business Directory",
      items: [
        { name: "All Categories", href: "/categories" },
        { name: "Popular Searches", href: "/popular" },
        { name: "Featured Businesses", href: "/featured" },
        { name: "New Listings", href: "/new" },
        { name: "Business Resources", href: "/resources" },
        { name: "Help Center", href: "/help" },
        { name: "Business Login", href: "/dashboard" },
      ],
    },
    {
      title: "Ghana Regions",
      items: [
        { name: "Greater Accra", href: "/region/greater-accra" },
        { name: "Ashanti Region", href: "/region/ashanti" },
        { name: "Western Region", href: "/region/western" },
        { name: "Central Region", href: "/region/central" },
        { name: "Eastern Region", href: "/region/eastern" },
        { name: "Northern Region", href: "/region/northern" },
        { name: "Volta Region", href: "/region/volta" },
        { name: "Upper East", href: "/region/upper-east" },
        { name: "Upper West", href: "/region/upper-west" },
      ],
    },
    {
      title: "Popular Categories",
      items: [
        { name: "Restaurants", href: "/category/restaurants" },
        { name: "Auto Services", href: "/category/auto-services" },
        { name: "Beauty & Health", href: "/category/beauty-health" },
        { name: "Home Services", href: "/category/home-services" },
        { name: "Professional Services", href: "/category/professional" },
        { name: "Shopping", href: "/category/shopping" },
        { name: "Entertainment", href: "/category/entertainment" },
      ],
    },
  ]

  const handleLinkClick = (href: string) => {
    // For external links, open in new tab
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      // For internal links, navigate
      window.location.href = href
    }
  }

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* Top Section - Logo, Contact, and Social */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Logo size="lg" variant="default" />
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  Ghana's Real Local Business Directory. Connecting communities with trusted local businesses across Ghana.
                </p>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">+233 540 997 993</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">info@takemetheregh.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Kumasi Digital Centre<br />
                    Staduim Asafo, Ashanti<br />
                    Ghana
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* For Businesses */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    For Businesses
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/business/register')}
                    >
                      List Your Business
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/business/login')}
                    >
                      Business Login
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/business/resources')}
                    >
                      Business Resources
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/business/pricing')}
                    >
                      Pricing Plans
                    </Button>
                  </div>
                </div>

                {/* Support & Social */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Support & Connect
                  </h3>
                  <div className="space-y-3 mb-6">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/help')}
                    >
                      Help Center
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/contact')}
                    >
                      Contact Support
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleLinkClick('/faq')}
                    >
                      FAQ
                    </Button>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h4>
                    <div className="flex space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick('https://facebook.com/takemetheregh')}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick('https://twitter.com/takemetheregh')}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick('https://instagram.com/takemetheregh')}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick('https://linkedin.com/company/takemetheregh')}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLinkClick('https://takemetheregh.com')}
                        className="flex items-center gap-2 p-0 h-auto text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Our Website
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {footerSections.map((section) => (
                <div key={section.title} className="border border-gray-200 rounded-lg p-4">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between py-2 px-0 h-auto font-medium text-gray-900 hover:bg-transparent"
                  >
                    <span className="text-left">{section.title}</span>
                    {expandedSections[section.title] ? (
                      <Minus className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Plus className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>

                  {expandedSections[section.title] && (
                    <div className="pt-3 space-y-2 border-t border-gray-100">
                      {section.items.map((item) => (
                        <div key={item.name}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start px-0 py-1 h-auto font-normal text-sm text-gray-600 hover:bg-transparent hover:text-blue-600 transition-colors"
                            onClick={() => handleLinkClick(item.href)}
                          >
                            {item.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 py-8">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Button 
              variant="link" 
              className="text-gray-600 hover:text-blue-600 p-0 text-sm transition-colors"
              onClick={() => handleLinkClick('/privacy')}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="link" 
              className="text-gray-600 hover:text-blue-600 p-0 text-sm transition-colors"
              onClick={() => handleLinkClick('/terms')}
            >
              Terms of Use
            </Button>
            <Button 
              variant="link" 
              className="text-gray-600 hover:text-blue-600 p-0 text-sm transition-colors"
              onClick={() => handleLinkClick('/legal')}
            >
              Legal Information
            </Button>
            <Button 
              variant="link" 
              className="text-gray-600 hover:text-blue-600 p-0 text-sm transition-colors"
              onClick={() => handleLinkClick('/cookies')}
            >
              Cookie Policy
            </Button>
            <Button 
              variant="link" 
              className="text-gray-600 hover:text-blue-600 p-0 text-sm transition-colors"
              onClick={() => handleLinkClick('/accessibility')}
            >
              Accessibility
            </Button>
          </div>

          {/* Copyright */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              © 2025 Take Me There Ghana, Inc. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Take Me There, the Take Me There logo, Ghana's Real Local Business Directory, and all other Take Me There
              marks are registered trademarks of Take Me There Ghana, Inc. All other marks contained herein are the property of their respective owners.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Made with ❤️ in Ghana</span>
              <span>•</span>
              <span>Empowering local businesses and communities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
