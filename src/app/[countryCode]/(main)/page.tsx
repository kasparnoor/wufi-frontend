import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { KrapsButton, LocalizedClientLink, ProductPreview } from "@lib/components"
import { Sparkles, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Kraps - Eesti lemmikloomade e-pood",
  description:
    "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele. Kiire kohaletoimetamine üle Eesti.",
  openGraph: {
    title: "Kraps - Eesti lemmikloomade e-pood",
    description:
      "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele.",
    images: [
      { url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Kraps homepage" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kraps - Eesti lemmikloomade e-pood",
    description:
      "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid.",
    images: ["/opengraph-image.jpg"],
  },
}

// Revalidate the homepage periodically as content changes infrequently
export const revalidate = 600

export default async function Home(props: {
  params: { countryCode: string }
}) {
  const { countryCode } = props.params

  let region = await getRegion(countryCode)
  let usedFallback = false

  if (!region) {
    // Try to fetch all regions and use the first one as fallback
    const regions = await listRegions()
    if (regions && regions.length > 0) {
      region = regions[0]!
      usedFallback = true
    } else {
      return (
        <div style={{ padding: 32, color: 'red' }}>
          <h1>No regions found</h1>
          <p>Check your Medusa backend regions and ensure at least one region exists.</p>
        </div>
      )
    }
  }

  const categories = await listCategories()

  const { response: { products } } = await listProducts({
    queryParams: {
      limit: 4,
      order: "created_at",
      fields: "*variants.calculated_price",
    },
    regionId: region.id,
  })

  return (
    <>
      {usedFallback && (
        <div className="content-container my-6">
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
            <strong className="font-semibold">Hoiatus:</strong> Riik koodiga &apos;{countryCode}&apos; ei leitud. Kuvame esimese saadavaloleva regiooni.
          </div>
        </div>
      )}
      <Hero 
        region={region} 
        categories={categories || []}
      />

      {/* Customer Favorites Section (moved from Hero, server-rendered) */}
      <section className="py-16 bg-white">
        <div className="content-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
                <Sparkles className="h-5 w-5 text-yellow-800" aria-hidden="true" />
                <span className="text-yellow-800 font-semibold">Populaarsed tooted</span>
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Meie kliendid armastavad neid tooteid</h2>
              <p className="text-gray-600 max-w-xl">
                Vaadake, millised tooted on saavutanud kõrgeima kliendireitingu ja tehti kõige rohkem korduvtellimusi.
              </p>
            </div>
            <LocalizedClientLink href="/pood">
              <KrapsButton variant="primary" size="medium">
                Vaata kõiki tooteid
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </KrapsButton>
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <ProductPreview key={product.id} product={product} region={region} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
