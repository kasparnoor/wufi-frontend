"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react"
import AddressSelect from "../address-select"
import { User, MapPin, Mail, Phone, Building2, Shield, Check, MessageSquare } from "lucide-react"
import { clx } from "@medusajs/ui"
import { ModernInput as Input } from "@lib/components"
import { 
  qualifiesForSimplifiedInvoice, 
  requiresFullAddress, 
  shouldShowCourierInstructions,
  isPakiautomaat,
  isKulleriga,
  getEstonianVATGuidance,
  getCustomerType
} from "@lib/util/checkout-helpers"
import CustomerActivationPrompt from "../customer-activation-prompt"

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
  <div className={clx("bg-white border border-gray-200 rounded-2xl p-6", className)}>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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
    "courier_instructions": (cart?.metadata as any)?.courier_instructions || "",
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
      HTMLInputElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

  // Check customer type and shipping method
  const customerType = cart ? getCustomerType(cart) : null
  const needsFullAddress = cart ? requiresFullAddress(cart, customerType || undefined, cart?.shipping_methods?.[0]?.name) : true
  const shippingMethodName = cart?.shipping_methods?.[0]?.name
  const showCourierInstructions = shouldShowCourierInstructions(shippingMethodName)
  
  // Get guidance messages
  const guidance = getEstonianVATGuidance()

  return (
    <div className="space-y-6">
      {/* Customer Type Info */}
      {customerType && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              {customerType === 'business' ? (
                <Building2 className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">
                {customerType === 'business' ? 'Ettevõtte tellimus' : 'Eraisiku tellimus'}
              </h4>
              <p className="text-xs text-blue-800">
                {customerType === 'business' 
                  ? 'Täielik aadress ja ettevõtte andmed on nõutavad' 
                  : 'Vajalik informatsioon sõltub valitud tarneviisist'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Section */}
      {customer && needsFullAddress && (addressesInRegion?.length || 0) > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-green-900">
              Tere tagasi, {customer.first_name}!
            </h4>
          </div>
          <p className="text-sm text-green-800 mb-3">
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
      <SectionCard title="Kontaktandmed" icon={User}>
        <div className="space-y-4">
          <Input
            label="E-posti aadress"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="teie@email.ee"
            className="w-full"
          />
          
          {/* Customer Activation Prompt */}
          {formData.email && (
                      <CustomerActivationPrompt
            email={formData.email}
            onGuestContinue={() => {
              console.log('Continuing as guest')
            }}
            className="mt-2"
          />
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Eesnimi"
              name="shipping_address.first_name"
              value={formData["shipping_address.first_name"]}
              onChange={handleChange}
              required
              placeholder="Eesnimi"
              className="w-full"
            />
            <Input
              label="Perekonnanimi"
              name="shipping_address.last_name"
              value={formData["shipping_address.last_name"]}
              onChange={handleChange}
              required
              placeholder="Perekonnanimi"
              className="w-full"
            />
          </div>

          <Input
            label="Telefoninumber"
            name="shipping_address.phone"
            type="tel"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            required
            placeholder="+372 5XXX XXXX"
            className="w-full"
          />

          {customerType === 'business' && (
            <Input
              label="Ettevõtte nimi"
              name="shipping_address.company"
              value={formData["shipping_address.company"]}
              onChange={handleChange}
              required
              placeholder="Ettevõtte nimi"
              className="w-full"
            />
          )}
        </div>
      </SectionCard>

      {/* Address Section - Only show if needed */}
      {needsFullAddress && (
        <SectionCard title="Tarneaadress" icon={MapPin}>
          <div className="space-y-4">
            <Input
              label="Aadress"
              name="shipping_address.address_1"
              value={formData["shipping_address.address_1"]}
              onChange={handleChange}
              required
              placeholder="Tänav ja maja number"
              className="w-full"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Postiindeks"
                name="shipping_address.postal_code"
                value={formData["shipping_address.postal_code"]}
                onChange={handleChange}
                required
                placeholder="12345"
                className="w-full"
              />
              <Input
                label="Linn"
                name="shipping_address.city"
                value={formData["shipping_address.city"]}
                onChange={handleChange}
                required
                placeholder="Linn"
                className="w-full"
              />
            </div>

            <Input
              label="Maakond"
              name="shipping_address.province"
              value={formData["shipping_address.province"]}
              onChange={handleChange}
              placeholder="Maakond (valikuline)"
              className="w-full"
            />

            <input
              type="hidden"
              name="shipping_address.country_code"
              value={cart?.region?.countries?.[0]?.iso_2 || "EE"}
            />
          </div>
        </SectionCard>
      )}

      {/* Pakiautomaat Selection - Only show for pakiautomaat delivery */}
      {isPakiautomaat(shippingMethodName) && (
        <SectionCard title="Pakiautomaadi valik" icon={MapPin}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Valige sobiv pakiautomaat oma tellimuse kättesaamiseks.
            </p>
            <select
              name="shipping_address.address_1"
              value={formData["shipping_address.address_1"]}
              onChange={(e) => {
                // Handle pakiautomaat selection with proper address setting
                handleChange(e)
                
                // Also set default city and postal code for pakiautomaat
                if (e.target.value) {
                  // Auto-set city and postal code for pakiautomaat deliveries
                  const cityEvent = {
                    target: {
                      name: "shipping_address.city",
                      value: "Tallinn" // Default city for pakiautomaat
                    }
                  } as React.ChangeEvent<HTMLInputElement>
                  
                  const postalEvent = {
                    target: {
                      name: "shipping_address.postal_code", 
                      value: "10000" // Default postal code
                    }
                  } as React.ChangeEvent<HTMLInputElement>
                  
                  handleChange(cityEvent)
                  handleChange(postalEvent)
                }
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">Valige pakiautomaat...</option>
              <option value="Smartpost Mustamäe Keskus">Smartpost Mustamäe Keskus</option>
              <option value="Smartpost Rocca al Mare">Smartpost Rocca al Mare</option>
              <option value="Smartpost Ülemiste Keskus">Smartpost Ülemiste Keskus</option>
              <option value="Smartpost Viru Keskus">Smartpost Viru Keskus</option>
              <option value="Smartpost Kristiine Keskus">Smartpost Kristiine Keskus</option>
              <option value="Smartpost Magistrali keskus">Smartpost Magistrali keskus</option>
              <option value="Smartpost T1 Mall">Smartpost T1 Mall</option>
              <option value="Smartpost Sikupilli">Smartpost Sikupilli</option>
              <option value="Smartpost Kadaka tee">Smartpost Kadaka tee</option>
              <option value="Smartpost Lasnamäe Centrum">Smartpost Lasnamäe Centrum</option>
              <option value="Smartpost Viimsi Keskus">Smartpost Viimsi Keskus</option>
              <option value="Smartpost Järveotsa tee">Smartpost Järveotsa tee</option>
              <option value="Smartpost Pirita Selver">Smartpost Pirita Selver</option>
              <option value="Smartpost Nõmme turg">Smartpost Nõmme turg</option>
              <option value="Smartpost Kristiine Maxima">Smartpost Kristiine Maxima</option>
            </select>
            
            {/* Hidden fields to ensure pakiautomaat deliveries have required address data */}
            {formData["shipping_address.address_1"] && (
              <>
                <input
                  type="hidden"
                  name="shipping_address.city"
                  value={formData["shipping_address.city"] || "Tallinn"}
                />
                <input
                  type="hidden"
                  name="shipping_address.postal_code"
                  value={formData["shipping_address.postal_code"] || "10000"}
                />
                <input
                  type="hidden"
                  name="delivery_type"
                  value="pakiautomaat"
                />
              </>
            )}
            
            <p className="text-xs text-gray-500">
              Pakiautomaat toimib 24/7 ja saate pakki kätte endale sobival ajal.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Courier Instructions - Only show for courier delivery */}
      {showCourierInstructions && (
        <SectionCard title="Kullerile juhised" icon={MessageSquare}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Lisage juhised kullerile (näiteks: uksekood, spetsiaalsed kättetoimetamise juhised).
            </p>
            <textarea
              name="courier_instructions"
              value={formData.courier_instructions}
              onChange={handleChange}
              placeholder="Näiteks: Uksekood 1234, jätke pakk värava juurde"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>
        </SectionCard>
      )}

      {/* Billing Address Section */}
      <SectionCard title="Arveldus" icon={Building2}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="billing_same_as_shipping"
              checked={checked}
              onChange={onChange}
              className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label htmlFor="billing_same_as_shipping" className="text-sm font-medium text-gray-900">
              Arveldusaadress on sama kui tarneaadress
            </label>
          </div>
          
          {!checked && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-3">
                Kui vajate erinevat arveldusaadressi, täitke see järgmisel sammul.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Legal Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          {guidance.legalReference} Esitades tellimuse, nõustute meie{" "}
          <a href="/tingimused" className="text-yellow-700 hover:text-yellow-800 underline">
            müügitingimustega
          </a>{" "}
          ja{" "}
          <a href="/privaatsus" className="text-yellow-700 hover:text-yellow-800 underline">
            privaatsuspoliitikaga
          </a>.
        </p>
      </div>
    </div>
  )
}

export default ShippingAddress
