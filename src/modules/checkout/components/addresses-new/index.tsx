"use client"

import React, { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HttpTypes } from "@medusajs/types"
import { setAddresses } from "@lib/data/cart"
import { useCheckoutStore } from '../../../../lib/stores/checkout-store'
import { checkoutFormSchema, CheckoutFormData } from '../../../../lib/schemas/checkout'
import { ContactInfoSection, AddressInfoSection } from '../../../../lib/components/forms/checkout-form-fields'
import { MapPin, ArrowRight } from "lucide-react"
import { clx } from "@medusajs/ui"
import { KrapsButton } from "@lib/components"
import CustomerActivationPrompt from "../customer-activation-prompt"

interface AddressesProps {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

const Addresses: React.FC<AddressesProps> = ({ cart, customer }) => {
  const { 
    customerType, 
    formData, 
    updateFormData, 
    setStepValid, 
    setError, 
    setLoading, 
    isLoading,
    nextStep 
  } = useCheckoutStore()

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: cart?.email || formData.email || '',
      firstName: cart?.shipping_address?.first_name || formData.firstName || '',
      lastName: cart?.shipping_address?.last_name || formData.lastName || '',
      phone: cart?.shipping_address?.phone || formData.phone || '',
      address1: cart?.shipping_address?.address_1 || formData.address1 || '',
      address2: cart?.shipping_address?.address_2 || formData.address2 || '',
      city: cart?.shipping_address?.city || formData.city || '',
      postalCode: cart?.shipping_address?.postal_code || formData.postalCode || '',
      province: cart?.shipping_address?.province || formData.province || 'Harjumaa',
      countryCode: cart?.shipping_address?.country_code || formData.countryCode || 'ee',
      company: cart?.shipping_address?.company || formData.company || '',
      sameAsBilling: formData.sameAsBilling ?? true,
    },
    mode: 'onChange',
  })

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = form

  // Watch form changes and update store
  const watchedValues = watch()
  useEffect(() => {
    // Update form data in store
    updateFormData(watchedValues)
    
    // Update step validation based on form validity
    const contactValid = !!(watchedValues.email && watchedValues.firstName && watchedValues.lastName && watchedValues.phone)
    const addressValid = !!(watchedValues.address1 && watchedValues.city && watchedValues.postalCode && watchedValues.province)
    setStepValid('address', contactValid && addressValid && isValid)
  }, [watchedValues, isValid, updateFormData, setStepValid])

  // Handle saved address selection
  const handleSavedAddressSelect = (address: any) => {
    setValue('firstName', address.first_name || '')
    setValue('lastName', address.last_name || '')
    setValue('address1', address.address_1 || '')
    setValue('address2', address.address_2 || '')
    setValue('city', address.city || '')
    setValue('postalCode', address.postal_code || '')
    setValue('province', address.province || 'Harjumaa')
    setValue('countryCode', address.country_code || 'ee')
    setValue('company', address.company || '')
    setValue('phone', address.phone || '')
  }

  // Handle form submission
  const onSubmit: SubmitHandler<CheckoutFormData> = async (data: CheckoutFormData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Submit address data to cart using FormData (as setAddresses expects)
      const formData = new FormData()
      
      // Add email
      formData.append('email', data.email)
      
      // Add shipping address fields - using correct snake_case field names
      formData.append('shipping_address.first_name', data.firstName)
      formData.append('shipping_address.last_name', data.lastName)
      formData.append('shipping_address.address_1', data.address1)
      formData.append('shipping_address.address_2', data.address2 || '')
      formData.append('shipping_address.city', data.city)
      formData.append('shipping_address.postal_code', data.postalCode)
      formData.append('shipping_address.province', data.province)
      formData.append('shipping_address.country_code', data.countryCode || 'ee')
      formData.append('shipping_address.phone', data.phone)
      if (data.company) {
        formData.append('shipping_address.company', data.company)
      }
      
      // Add courier instructions if provided
      if (data.courierInstructions) {
        formData.append('courier_instructions', data.courierInstructions)
      }
      
      // Add billing address fields
      if (data.sameAsBilling) {
        formData.append('same_as_billing', 'on')
      } else {
        const billingAddr = data.billingAddress
        if (billingAddr) {
          formData.append('billing_address.first_name', billingAddr.firstName || '')
          formData.append('billing_address.last_name', billingAddr.lastName || '')
          formData.append('billing_address.address_1', billingAddr.address1 || '')
          formData.append('billing_address.address_2', billingAddr.address2 || '')
          formData.append('billing_address.city', billingAddr.city || '')
          formData.append('billing_address.postal_code', billingAddr.postalCode || '')
          formData.append('billing_address.province', billingAddr.province || '')
          formData.append('billing_address.country_code', billingAddr.countryCode || 'ee')
          formData.append('billing_address.phone', billingAddr.phone || '')
          if (billingAddr.company) {
            formData.append('billing_address.company', billingAddr.company)
          }
        }
      }
      
      await setAddresses(null, formData)
      
      // Navigate to next step using store
      nextStep()
    } catch (err: any) {
      setError(err.message || 'Viga aadressi salvestamisel')
    } finally {
      setLoading(false)
    }
  }

  // Get addresses in current region
  const addressesInRegion = customer?.addresses?.filter(
    (address) => address.country_code === cart?.region?.countries?.[0]?.iso_2
  ) || []

  return (
    <div className="space-y-6">
      {/* Customer Type Info */}
      {customerType && (
        <div className={clx(
          "border rounded-xl p-4",
          customerType === 'business' 
            ? "bg-blue-50 border-blue-200" 
            : "bg-green-50 border-green-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={clx(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              customerType === 'business' ? "bg-blue-500" : "bg-green-500"
            )}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {customerType === 'business' ? 'Ettevõtte tellimus' : 'Eraisiku tellimus'}
              </h4>
              <p className="text-xs text-gray-600">
                {customerType === 'business' 
                  ? 'Täielik aadress ja ettevõtte andmed on nõutavad' 
                  : 'Kontaktandmed ja tarneaadress'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Section */}
      {customer && addressesInRegion.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-3">
            Tere tagasi, {customer.first_name}! Kas soovid kasutada salvestatud aadressi?
          </h4>
          <div className="space-y-2">
            {addressesInRegion.slice(0, 3).map((address, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSavedAddressSelect(address)}
                className="w-full text-left p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">
                  {address.first_name} {address.last_name}
                </div>
                <div className="text-xs text-gray-600">
                  {address.address_1}, {address.city} {address.postal_code}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="address-form">
        <ContactInfoSection register={register} errors={errors} />
        
        {/* Customer Activation Prompt */}
        {watchedValues.email && (
          <CustomerActivationPrompt
            email={watchedValues.email}
            onGuestContinue={() => {
              console.log('Continuing as guest')
            }}
            disabled={isLoading}
            className="mt-4"
          />
        )}
        
        <AddressInfoSection 
          register={register} 
          errors={errors} 
          showCompany={customerType === 'business'} 
        />

        {/* Same as Billing Address Toggle */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('sameAsBilling')}
              className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">
              Arveldusaadress on sama mis tarneaadress
            </span>
          </label>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <KrapsButton
            type="submit"
            disabled={!isValid || isLoading}
            variant="primary"
            size="large"
            className="min-w-[200px] flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvestab...
              </>
            ) : (
              <>
                Jätka tarnimisega
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </KrapsButton>
        </div>
      </form>
    </div>
  )
}

export default Addresses 