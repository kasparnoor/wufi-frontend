import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"
import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Konto - Kraps",
  description: "Hallige oma Kraps kontot, tellimusi ja lemmikloomade andmeid.",
}

export default async function KontoPageLayout({
  children,
  dashboard,
  login,
}: {
  children?: ReactNode
  dashboard?: ReactNode
  login?: ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {/* Always render the appropriate parallel slot to avoid blank content when child returns null */}
      {customer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}
