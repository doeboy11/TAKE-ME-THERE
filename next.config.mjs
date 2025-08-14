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
    // Allow images served from Supabase Storage
    domains: [
      'zsypjqjmdkamowykryiy.supabase.co',
    ],
    // Alternatively, you can use remotePatterns instead of domains:
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'zsypjqjmdkamowykryiy.supabase.co' },
    // ],
  },
}

export default nextConfig
