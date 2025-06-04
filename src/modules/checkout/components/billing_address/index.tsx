import { HttpTypes } from "@medusajs/types"
import { ModernInput as Input } from "@lib/components"
import React, { useState } from "react"
import { User, MapPin, Building2, Phone } from "lucide-react"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

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

  const handlePhoneChange = (phone: string) => {
    setFormData({
      ...formData,
      "billing_address.phone": phone,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Eesnimi"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          icon={User}
          data-testid="billing-first-name-input"
        />
        <Input
          label="Perekonnanimi"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          icon={User}
          data-testid="billing-last-name-input"
        />
        <Input
          label="Aadress"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          icon={MapPin}
          data-testid="billing-address-input"
        />
        <Input
          label="Ettevõte (valikuline)"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          icon={Building2}
          data-testid="billing-company-input"
        />
        <Input
          label="Postiindeks"
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <Input
          label="Linn"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
          required
          data-testid="billing-city-input"
        />
        <Input
          variant="select"
          label="Riik"
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          icon={MapPin}
          data-testid="billing-country-select"
        />
        <Input
          label="Maakond"
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          data-testid="billing-province-input"
        />
        <Input
          variant="phone"
          label="Telefon"
          name="billing_address.phone"
          value={formData["billing_address.phone"]}
          onPhoneChange={handlePhoneChange}
          onChange={handleChange}
          defaultCountry="ee"
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress
