import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  // No hace falta anunciar el framework en cada respuesta — fingerprinting
  // gratuito para quien busque CVEs conocidos de Next.js/Payload.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Default de Next.js es 1 MB — una foto real de celular (portada +
      // galería van en la misma Server Action) lo supera fácil. Por debajo
      // del `max_size 25MB` del Caddyfile.
      bodySizeLimit: '20mb',
    },
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
