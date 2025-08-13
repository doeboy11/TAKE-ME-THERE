// App Root Layout
// Purpose: Defines the HTML skeleton, global fonts, and wraps the app with shared providers.
// Notes:
// - `Providers` is where global contexts (e.g., theme, auth) are mounted.
// - Geist fonts are applied via inline <style> for consistent font variables.
// - Keep this file light; avoid heavy logic here.
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Inline font variables so they are available globally */}
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {/* Global providers (theme, auth, etc.) wrap the entire app */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
