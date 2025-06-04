import { Metadata } from "next"

import { ProfileManagement } from "@lib/components"

import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profiil",
  description: "Hallige oma kasutajaprofiili ja kontaktandmeid.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return <ProfileManagement customer={customer} regions={regions} />
}
