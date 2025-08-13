import React from 'react'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'gradient'
  className?: string
  asLink?: boolean
  href?: string
}

export default function Logo({ size = 'md', variant = 'default', className = '', asLink = true, href = '/' }: LogoProps) {
  const textSize: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const iconSize: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const variantText: Record<NonNullable<LogoProps['variant']>, string> = {
    default: 'text-gray-900 dark:text-white',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
  }

  const content = (
    <div
      className={`inline-flex items-center gap-3 ${textSize[size]} ${variantText[variant]} ${className}`}
      aria-label="Take Me There"
    >
      {/* Brand mark: geometric pin + forward arrow, simplified for crisp rendering */}
      <div
        className={`relative ${iconSize[size]} rounded-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id="tmt-g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          {/* Outer rounded rect for subtle badge */}
          <rect x="1" y="1" width="46" height="46" rx="12" fill={variant === 'white' ? '#111827' : 'url(#tmt-g)'} />
          {/* Pin silhouette */}
          <path
            d="M24 10c-5.5 0-10 4.28-10 9.56 0 6.17 7.87 14.9 9.02 16.1.53.57 1.43.57 1.96 0 1.15-1.2 9.02-9.93 9.02-16.1C34 14.28 29.5 10 24 10Z"
            fill="white"
            fillOpacity="0.96"
          />
          {/* Forward arrow indicating movement/navigation */}
          <path
            d="M19.5 23.5L24 19l4.5 4.5M24 19v10"
            stroke={variant === 'white' ? '#6366F1' : '#4F46E5'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark: refined weights/contrast, improved readability */}
      <div className="leading-tight select-none">
        <div className="hidden sm:flex items-baseline gap-1">
          <span className="font-semibold tracking-[-0.015em]">Take</span>
          <span className="font-medium text-gray-600 dark:text-gray-300 tracking-[-0.015em]">Me</span>
          <span className="font-semibold tracking-[-0.02em]">There</span>
        </div>
        <div className="sm:hidden font-semibold tracking-tight">TMT</div>
      </div>
    </div>
  )

  if (asLink) {
    return (
      <Link
        href={href}
        aria-label="Go to homepage"
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg"
      >
        {content}
      </Link>
    )
  }

  return content
}
 