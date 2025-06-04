import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react"
import AddressSelect from "../address-select"
import { User, MapPin, Mail, Phone, Building2, Shield, Check } from "lucide-react"
import { clx } from "@medusajs/ui"
import { ModernInput as Input } from "@lib/components"

const SectionCard = ({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) => (
  <div className={clx("bg-white border border-gray-200 rounded-3xl p-8", className)}>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
)

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
  const [formData, setFormData] = useState<any>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const addressesInRegion = useMemo(() => {
    return customer?.addresses?.filter(
      (address) => address.country_code === cart?.region?.countries?.[0]?.iso_2
    )
  }, [customer?.addresses, cart?.region])

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData({
        ...formData,
        "shipping_address.first_name": address.first_name || "",
        "shipping_address.last_name": address.last_name || "",
        "shipping_address.company": address.company || "",
        "shipping_address.address_1": address.address_1 || "",
        "shipping_address.postal_code": address.postal_code || "",
        "shipping_address.city": address.city || "",
        "shipping_address.province": address.province || "",
        "shipping_address.country_code": address.country_code || "",
        "shipping_address.phone": address.phone || "",
        email: email || formData.email,
      })
    }
  }

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
      "shipping_address.phone": phone,
    })
  }

  const handleEstonianAddressSelect = (address: any) => {
    setFormData((prevState: any) => ({
      ...prevState,
      "shipping_address.address_1": address.taisaadress,
      "shipping_address.postal_code": address.sihtnumber || "",
      "shipping_address.city": address.asustusyksus || "",
      "shipping_address.province": address.maakond || "",
    }))
  }

  return (
    <div className="space-y-8">
      {/* Saved Addresses Section */}
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-blue-900">
              Tere tagasi, {customer.first_name}!
            </h4>
          </div>
          <p className="text-blue-800 mb-4">
            Kas soovid kasutada ühte oma salvestatud aadressidest?
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
        </div>
      )}

      {/* Personal Information Section */}
      <SectionCard title="Isikuandmed" icon={User}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Eesnimi"
              name="shipping_address.first_name"
              value={formData["shipping_address.first_name"]}
              onChange={handleChange}
              required
              icon={User}
            />
            <Input
              label="Perekonnanimi"
              name="shipping_address.last_name"
              value={formData["shipping_address.last_name"]}
              onChange={handleChange}
              required
              icon={User}
            />
          </div>
          <Input
            label="Ettevõte"
            name="shipping_address.company"
            value={formData["shipping_address.company"]}
            onChange={handleChange}
            helpText="Kui tellid ettevõtte nimele (valikuline)"
            icon={Building2}
          />
        </div>
      </SectionCard>
        
      {/* Delivery Address Section */}
      <SectionCard title="Tarneaadress" icon={MapPin}>
        <div className="space-y-6">
          <Input
            variant="estonian-address"
            label="Aadress"
            name="shipping_address.address_1"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            onAddressSelect={handleEstonianAddressSelect}
            required
            helpText="Alustage tipist ning valige sobiv aadress loendist"
            icon={MapPin}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Postiindeks"
              name="shipping_address.postal_code"
              value={formData["shipping_address.postal_code"]}
              onChange={handleChange}
              required
              helpText="Täitub automaatselt aadressi valimisel"
            />
            <Input
              label="Linn"
              name="shipping_address.city"
              value={formData["shipping_address.city"]}
              onChange={handleChange}
              required
              helpText="Täitub automaatselt aadressi valimisel"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Maakond"
              name="shipping_address.province"
              value={formData["shipping_address.province"]}
              onChange={handleChange}
              helpText="Täitub automaatselt aadressi valimisel"
            />
            <Input
              variant="select"
              label="Riik"
              name="shipping_address.country_code"
              region={cart?.region}
              value={formData["shipping_address.country_code"]}
              onChange={handleChange}
              required
              icon={MapPin}
            />
          </div>
        </div>
      </SectionCard>
        
      {/* Contact Information Section */}
      <SectionCard title="Kontaktandmed" icon={Mail}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="E-post"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              type="email"
              helpText="Tellimuse kinnituse saatmiseks"
              icon={Mail}
            />
            <Input
              variant="phone"
              label="Telefon"
              name="shipping_address.phone"
              value={formData["shipping_address.phone"]}
              onPhoneChange={handlePhoneChange}
              onChange={handleChange}
              required
              helpText="Kulleriga ühenduse võtmiseks"
              defaultCountry="ee"
            />
          </div>
        </div>
      </SectionCard>

      {/* Billing Address Section */}
      <div className="bg-gradient-to-r from-yellow-50 via-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="relative mt-1">
            <input
              id="same_as_billing"
              name="same_as_billing"
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="peer w-6 h-6 text-yellow-500 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition-all duration-200 cursor-pointer"
            />
            <div className="absolute inset-0 w-6 h-6 bg-yellow-500 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none">
              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <label htmlFor="same_as_billing" className="text-lg font-semibold text-gray-900 cursor-pointer">
                Arveldusaadress on sama mis tarneaadress
              </label>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Kui tellid kingitusena, võid sisestada erineva arveldusaadressi järgmisel sammul
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingAddress
