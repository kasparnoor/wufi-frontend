import { getBaseURL } from "@lib/util/env"

// Type definitions for structured data schemas
interface OrganizationSchema {
  "@context": string
  "@type": "Organization"
  "@id"?: string
  name: string
  description: string
  url: string
  logo?: {
    "@type": "ImageObject"
    url: string
    width?: number
    height?: number
  }
  contactPoint?: {
    "@type": "ContactPoint"
    contactType: string
    availableLanguage: string
  }
  address?: {
    "@type": "PostalAddress"
    addressLocality?: string
    addressRegion?: string
    addressCountry: string
  }
  areaServed?: Array<{
    "@type": "Place"
    name: string
  }>
  serviceType?: string[]
}

interface WebsiteSchema {
  "@context": string
  "@type": "WebSite"
  "@id"?: string
  url: string
  name: string
  description: string
  publisher?: {
    "@id": string
  }
  inLanguage: string
  potentialAction?: {
    "@type": "SearchAction"
    target: {
      "@type": "EntryPoint"
      urlTemplate: string
    }
    "query-input": string
  }
}

interface ProductSchema {
  "@context": string
  "@type": "Product"
  name: string
  description: string
  image?: string
  url: string
  brand: {
    "@type": "Brand"
    name: string
  }
  offers?: {
    "@type": "Offer"
    price: string
    priceCurrency: string
    availability: string
    seller: {
      "@type": "Organization"
      name: string
    }
  }
}

interface ArticleSchema {
  "@context": string
  "@type": "Article"
  headline: string
  description?: string
  image?: string[]
  datePublished: string
  dateModified?: string
  author: {
    "@type": "Person"
    name: string
    url?: string
  }
  publisher: {
    "@type": "Organization"
    name: string
    logo?: {
      "@type": "ImageObject"
      url: string
    }
  }
  mainEntityOfPage?: {
    "@type": "WebPage"
    "@id": string
  }
}

// Component props interfaces
interface OrganizationSchemaProps {
  name?: string
  description?: string
  url?: string
  logo?: string
}

interface WebsiteSchemaProps {
  name?: string
  url?: string
  description?: string
}

interface ProductSchemaProps {
  product: {
    title: string
    description?: string
    thumbnail?: string
    handle: string
    variants?: Array<{
      calculated_price?: {
        calculated_amount: number
        currency_code: string
      }
    }>
  }
  url?: string
}

interface ArticleSchemaProps {
  title: string
  description?: string
  images?: string[]
  datePublished: string
  dateModified?: string
  author: {
    name: string
    url?: string
  }
  url: string
}

// Utility function to safely stringify JSON-LD and prevent XSS
function safeJsonLdStringify(jsonLd: object): string {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}

// Organization Schema Component
export function OrganizationSchema({ 
  name = "Kraps",
  description = "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele.",
  url = getBaseURL(),
  logo = `${getBaseURL()}/images/brand/kraps_logo_yellow logo.png`
}: OrganizationSchemaProps = {}) {
  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    description,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 800,
      height: 600
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Estonian"
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "EE"
    },
    areaServed: [
      {
        "@type": "Place",
        name: "Estonia"
      }
    ],
    serviceType: [
      "Pet Food Delivery",
      "Pet Supplies",
      "Pet Care Products"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(schema)
      }}
    />
  )
}

// Website Schema Component
export function WebsiteSchema({
  name = "Kraps",
  url = getBaseURL(),
  description = "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele."
}: WebsiteSchemaProps = {}) {
  const schema: WebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name,
    description,
    publisher: {
      "@id": `${url}/#organization`
    },
    inLanguage: "et-EE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(schema)
      }}
    />
  )
}

// Product Schema Component
export function ProductSchema({ product, url }: ProductSchemaProps) {
  const baseUrl = getBaseURL()
  const productUrl = url || `${baseUrl}/products/${product.handle}`
  
  const price = product.variants?.[0]?.calculated_price
  
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.thumbnail,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "Kraps"
    }
  }

  // Only add offers if price information is available
  if (price && price.calculated_amount && price.currency_code) {
    schema.offers = {
      "@type": "Offer",
      price: (price.calculated_amount / 100).toFixed(2),
      priceCurrency: price.currency_code.toUpperCase(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Kraps"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(schema)
      }}
    />
  )
}

// Article Schema Component
export function ArticleSchema({ 
  title, 
  description, 
  images = [], 
  datePublished, 
  dateModified, 
  author, 
  url 
}: ArticleSchemaProps) {
  const baseUrl = getBaseURL()
  
  const schema: ArticleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: images,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url
    },
    publisher: {
      "@type": "Organization",
      name: "Kraps",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/brand/kraps_logo_yellow logo.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(schema)
      }}
    />
  )
}

// Breadcrumb Schema Component
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(schema)
      }}
    />
  )
} 