import { Metadata } from "next"
import { notFound } from "next/navigation"

import { AddressManagement } from "@lib/components"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Tarneaadressid",
  description: "Hallige oma tarneaadresse lihtsalt ja mugavalt.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return <AddressManagement customer={customer} region={region} />
}
