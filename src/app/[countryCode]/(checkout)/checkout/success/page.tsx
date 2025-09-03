import { Metadata } from "next"
import { Suspense } from "react"
import CheckoutSuccessContent from "./components/success-content"

export const metadata: Metadata = {
  title: "Tellimus kinnitatud",
  description: "Teie tellimus on edukalt esitatud",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; payment_intent_client_secret?: string }>
}) {
  const resolvedSearchParams = await searchParams
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kinnitame teie tellimust...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}