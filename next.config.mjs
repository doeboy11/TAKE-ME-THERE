/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Allow images served from Supabase Storage and Unsplash
    domains: [
      'zsypjqjmdkamowykryiy.supabase.co',
      'images.unsplash.com',
    ],
    // Alternatively, you can use remotePatterns instead of domains:
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'zsypjqjmdkamowykryiy.supabase.co' },
    // ],
  },
  webpack: (config, { dev }) => {
    // Disable filesystem cache in dev to avoid Windows EPERM rename errors
    if (dev) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig
