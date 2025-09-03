"use client"

import React, { useEffect, useState } from 'react'
import { HttpTypes } from "@medusajs/types"
import { useCheckoutStore } from '../../../../lib/stores/checkout-store'
import { setShippingMethod } from "@lib/data/cart"
import { Clock, Truck, MapPin, ArrowRight } from "lucide-react"
import { clx } from "@medusajs/ui"
import { KrapsButton } from "@lib/components"

interface ShippingProps {
  cart: HttpTypes.StoreCart | null
  availableShippingMethods: any[] | null
}

const Shipping: React.FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
  const { 
    setStepValid, 
    setError, 
    setLoading, 
    isLoading,
    nextStep,
    formData 
  } = useCheckoutStore()

  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(
    cart?.shipping_methods?.[0]?.shipping_option_id || null
  )

  // Update step validation when shipping method is selected
  useEffect(() => {
    const hasSelectedMethod = !!selectedShippingMethodId
    setStepValid('delivery', hasSelectedMethod)
  }, [selectedShippingMethodId, setStepValid])

  // Handle shipping method selection
  const handleShippingMethodSelect = async (shippingOptionId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await setShippingMethod({
        cartId: cart?.id || '',
        shippingMethodId: shippingOptionId,
      })
      
      setSelectedShippingMethodId(shippingOptionId)
    } catch (err: any) {
      setError(err.message || 'Viga tarneviisi valikul')
    } finally {
      setLoading(false)
    }
  }

  // Handle proceed to next step
  const handleContinue = async () => {
    if (!selectedShippingMethodId) {
      setError('Palun valige tarneviis')
      return
    }
    
    nextStep()
  }

  // Format price for display
  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount)
  }

  // Get shipping icon based on method name
  const getShippingIcon = (name: string) => {
    if (name.toLowerCase().includes('omniva') || name.toLowerCase().includes('pakiautomaat')) {
      return <MapPin className="h-5 w-5" />
    }
    if (name.toLowerCase().includes('kuller') || name.toLowerCase().includes('courier')) {
      return <Truck className="h-5 w-5" />
    }
    return <Clock className="h-5 w-5" />
  }

  // Filter methods for current region
  const regionShippingMethods = availableShippingMethods?.filter(
    (method) => method.region_id === cart?.region_id
  ) || []

  if (!regionShippingMethods.length) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Truck className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tarneviisid laadivad</h3>
        <p className="text-gray-600">Palun oodake, kuni tarneviisid on laetud...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">3</span>
          </div>
          Valige tarneviis
        </h3>
        <p className="text-sm text-gray-600">
          Tarneaadress: {formData.address1}, {formData.city} {formData.postalCode}
        </p>
      </div>

      {/* Shipping Methods */}
      <div className="space-y-3">
        {regionShippingMethods.map((method, index) => {
          const isSelected = selectedShippingMethodId === method.id
          const isRecommended = method.name?.toLowerCase().includes('omniva') // Mark Omniva as recommended
          
          return (
            <button
              key={method.id}
              type="button"
              className={clx(
                "relative border rounded-xl p-4 cursor-pointer transition-all w-full text-left",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500",
                isSelected
                  ? "border-yellow-500 bg-yellow-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              onClick={() => handleShippingMethodSelect(method.id)}
              aria-pressed={isSelected}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Soovitatud
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Radio Button */}
                  <div
                    className={clx(
                      "w-5 h-5 border-2 rounded-full flex items-center justify-center",
                      isSelected ? "border-yellow-500" : "border-gray-300"
                    )}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Method Icon */}
                  <div className={clx(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isSelected ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    {getShippingIcon(method.name)}
                  </div>

                  {/* Method Details */}
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">
                      {method.description || 'Tarne 1-3 tööpäeva'}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {method.amount === 0 
                      ? 'TASUTA'
                      : formatPrice(method.amount, cart?.region?.currency_code || 'eur')
                    }
                  </div>
                  {method.amount === 0 && (
                    <div className="text-xs text-green-600">Tasuta tarne üle 50€</div>
                  )}
                </div>
              </div>

              {/* Additional Method Info */}
              {isSelected && method.metadata && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    {method.metadata.description || 'Täpsem info tellimuse kinnitamisel'}
                  </p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Error Display */}
      {useCheckoutStore.getState().error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{useCheckoutStore.getState().error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <KrapsButton
          onClick={handleContinue}
          disabled={!selectedShippingMethodId || isLoading}
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
              Jätka maksmisega
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </KrapsButton>
      </div>
    </div>
  )
}

export default Shipping 