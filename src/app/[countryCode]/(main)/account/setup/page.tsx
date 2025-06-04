import { Metadata } from "next"
import { Suspense } from "react"
import { AccountSetup } from "@lib/components"

export const metadata: Metadata = {
  title: "Konto seadistamine",
  description: "Lõpetage oma konto seadistamine ja lisage lemmikloomade andmed.",
}

export default function AccountSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Suspense fallback={<AccountSetupSkeleton />}>
          <AccountSetup />
        </Suspense>
      </div>
    </div>
  )
}

const AccountSetupSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
} 