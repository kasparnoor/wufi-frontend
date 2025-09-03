const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
  {
    key: "MEDUSA_BACKEND_URL",
    description: "The URL of your Medusa backend server",
  },
]

// Optional server-side environment variables for Next.js API routes
const optionalServerEnvs = [
  {
    key: "RECAPTCHA_SECRET_KEY",
    description: "Your Google reCAPTCHA secret key (used for newsletter validation)",
    sensitive: true,
  },
]

const optionalEnvs = [
  {
    key: "NEXT_PUBLIC_STRIPE_KEY",
    description: "Your Stripe publishable key for client-side integration",
  },
  {
    key: "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    description: "Your Google reCAPTCHA site key",
  },
  {
    key: "NEXT_PUBLIC_DEFAULT_REGION",
    description: "Default region for your storefront",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })
  
  const missingOptional = optionalEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  const missingServerEnvs = optionalServerEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
      if (env.sensitive) {
        console.error(c.red(`    ⚠️  This is a sensitive variable - keep it secure!\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }
  
  if (missingOptional.length > 0) {
    console.warn(
      c.yellow("\n⚠️  Warning: Optional environment variables not set\n")
    )

    missingOptional.forEach(function (env) {
      console.warn(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.warn(c.dim(`    ${env.description}\n`))
      }
    })
  }

  if (missingServerEnvs.length > 0) {
    console.warn(
      c.yellow("\n⚠️  Warning: Optional server-side environment variables not set\n")
    )
    console.warn(
      c.dim("These are used by Next.js API routes for enhanced functionality.\n")
    )

    missingServerEnvs.forEach(function (env) {
      console.warn(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.warn(c.dim(`    ${env.description}\n`))
      }
      if (env.sensitive) {
        console.warn(c.red(`    ⚠️  This is a sensitive variable - keep it secure!\n`))
      }
    })
  }
  
  // Security checks
  if (process.env.NODE_ENV === 'production') {
    console.log(c.green("✓ Environment variables configured for production"))
    
    // Check for development-only configurations
    if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && 
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes('localhost')) {
      console.error(c.red("🚫 Production build using localhost backend URL!"))
      process.exit(1)
    }
  }
}

module.exports = checkEnvVariables
