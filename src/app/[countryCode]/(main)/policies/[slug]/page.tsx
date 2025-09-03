import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrievePolicyPageBySlug, generatePolicyPageMetadata } from "@lib/data/policy-pages"
import PolicyPageComponent from "@modules/common/components/policy-page"

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await retrievePolicyPageBySlug(slug)

  if (!page) {
    return {
      title: "Page Not Found | Kraps",
      description: "The requested page could not be found.",
    }
  }

  return generatePolicyPageMetadata(page)
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const page = await retrievePolicyPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <PolicyPageComponent page={page} />
}

// Generate static paths for known policy pages (optional)
export async function generateStaticParams() {
  // You can pre-generate paths for common policies
  return [
    { slug: 'privaatsuspoliitika' },
    { slug: 'kasutustingimused' },
    { slug: 'kupsiste-poliitika' },
    { slug: 'tarnetingimused' },
    { slug: 'tagastamise-tingimused' },
  ]
} 