import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion, listRegions } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "WUFI Poe Next.js Stardimall",
  description:
    "Jõuline e-poe stardimall koos Next.js 15 ja Medusaga.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

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

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections) {
    return (
      <div style={{ padding: 32, color: 'red' }}>
        <h1>No collections found</h1>
        <p>Check your Medusa backend collections.</p>
      </div>
    )
  }

  return (
    <>
      {usedFallback && (
        <div style={{ padding: 16, background: '#fffbe6', color: '#ad8b00', marginBottom: 24, border: '1px solid #ffe58f', borderRadius: 4 }}>
          <strong>Warning:</strong> Region for country code &apos;{countryCode}&apos; not found. Showing first available region instead.
        </div>
      )}
      <Hero region={region} />
      {/* <section className="py-16 bg-grey-5">
        <div className="content-container">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Populaarsed kollektsioonid</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      </section> */}
    </>
  )
}
