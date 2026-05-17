import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@langchain/community', 'langchain'],
  turbopack: {},
}

export default nextConfig
