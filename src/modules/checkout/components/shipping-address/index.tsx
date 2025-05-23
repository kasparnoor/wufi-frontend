import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import Divider from "@modules/common/components/divider"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart, customer?.email]) // Add cart and customer.email as dependencies

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Tere ${customer.first_name}, kas soovid kasutada ühte oma salvestatud aadressidest?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="space-y-6">
        {/* Group 1: Personal info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Eesnimi"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            placeholder="Nt: Mari"
            data-testid="shipping-first-name-input"
          />
          <Input
            label="Perekonnanimi"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            placeholder="Nt: Tamm"
            data-testid="shipping-last-name-input"
          />
        </div>
        <div>
          <Input
            label="Ettevõte"
            name="shipping_address.company"
            autoComplete="organization"
            value={formData["shipping_address.company"]}
            onChange={handleChange}
            placeholder="Nt: Wufi OÜ"
            data-testid="shipping-company-input"
          />
          <p className="text-sm text-gray-500 mt-1">
            Kui tellid ettevõtte nimele (valikuline)
          </p>
        </div>
        <Divider className="my-6" />
        {/* Group 2: Address */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Aadress"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            placeholder="Nt: Tartu mnt 15-4"
            data-testid="shipping-address-input"
          />
          <Input
            label="Postiindeks"
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            required
            placeholder="Nt: 10115"
            data-testid="shipping-postal-code-input"
          />
          <Input
            label="Linn"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            placeholder="Nt: Tallinn"
            data-testid="shipping-city-input"
          />
          <Input
            label="Maakond"
            name="shipping_address.province"
            autoComplete="address-level1"
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            placeholder="Nt: Harju maakond"
            data-testid="shipping-province-input"
          />
          <CountrySelect
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            placeholder="Riik"
            data-testid="shipping-country-select"
          />
        </div>
        <Divider className="my-6" />
        {/* Group 3: Contact and billing */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-post"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nt: mari@näide.ee"
              data-testid="shipping-email-input"
            />
            <Input
              label="Telefon"
              name="shipping_address.phone"
              autoComplete="tel"
              type="tel"
              value={formData["shipping_address.phone"]}
              onChange={handleChange}
              required
              placeholder="Nt: +372 5555 5555"
              data-testid="shipping-phone-input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="same_as_billing"
              name="same_as_billing"
              type="checkbox"
              checked={checked}
              onChange={onChange}
              data-testid="billing-address-checkbox"
              className="h-4 w-4 text-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="same_as_billing" className="text-sm font-medium text-gray-700 leading-none whitespace-nowrap">
              Arveldusaadress on sama mis tarneaadress
            </label>
            <div className="relative flex-shrink-0 group">
              <button
                type="button"
                className="h-6 w-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-600"
              >
                ℹ️
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-gray-700 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Kui tellid kingitusena, võid sisestada erineva arveldusaadressi
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShippingAddress
