import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveContentPageBySlug, generateContentPageMetadata } from "@lib/data/content-pages"
import DynamicContentPage from "@modules/common/components/dynamic-content-page"

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await retrieveContentPageBySlug(slug)

  if (!page) {
    return {
      title: "Page Not Found | Kraps",
      description: "The requested page could not be found.",
    }
  }

  return generateContentPageMetadata(page)
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params
  const page = await retrieveContentPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <DynamicContentPage page={page} />
}

// Generate static paths for known content pages (will be populated by backend)
export async function generateStaticParams() {
  // You can pre-generate paths for common pages that will be created through the CMS
  // The backend should provide an endpoint to list all published page slugs
  // These are examples - actual pages will be created through the dynamic content management system
  return [
    { slug: 'meist' },
    { slug: 'kuidas-kraps-tootab' },
    { slug: 'kuidas-kraps-kohandub' },
  ]
} 