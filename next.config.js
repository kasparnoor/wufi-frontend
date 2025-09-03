const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
// Dynamically include backend origin in CSP connect-src so the app can call Medusa APIs (e.g. http://localhost:9000)
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"
let BACKEND_ORIGIN = "http://localhost:9000"
try {
  BACKEND_ORIGIN = new URL(BACKEND_URL).origin
} catch {}

const CONNECT_SRC = [
  "'self'",
  "https://api.stripe.com",
  "https://app.chatwoot.com",
  "https://www.google.com",
  "https://www.gstatic.com",
  BACKEND_ORIGIN,
  "http://localhost:9000",
]

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure static page generation
  generateBuildId: async () => {
    return 'wufi-build'
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://js.stripe.com https://app.chatwoot.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              `connect-src ${CONNECT_SRC.join(' ')}`,
              "frame-src https://js.stripe.com https://hooks.stripe.com https://www.google.com https://app.chatwoot.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "upgrade-insecure-requests",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ]
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.petcity.ee",
      },
      {
        protocol: "https",
        hostname: "fera.ee",
      },
      {
        protocol: "https",
        hostname: "mlj4lcgnxbh8.i.optimole.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "petreon.ee",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "koeratoit.com",
      },
      {
        protocol: "https",
        hostname: "dpkjduaqggwpkajziqfl.supabase.co",
      },
    ],
  },
}

module.exports = nextConfig
