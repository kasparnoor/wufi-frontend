"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { Building2, User } from "lucide-react"
import { clx } from "@medusajs/ui"
import { KrapsButton } from "@lib/components"
import { updateCart } from "@lib/data/cart"
import { useCheckoutStore } from "../../../../lib/stores/checkout-store"

interface CustomerTypeSelectionProps {
  cart: HttpTypes.StoreCart
}

const CustomerTypeSelection: React.FC<CustomerTypeSelectionProps> = ({ cart }) => {
  const { customerType, setCustomerType, nextStep, isLoading, setError } = useCheckoutStore()

  const handleContinue = async () => {
    if (!customerType) return

    try {
      // Update cart metadata with customer type
      await updateCart({
        metadata: {
          ...cart.metadata,
          customer_type: customerType
        }
      })

      // Navigate to next step using store
      nextStep()
    } catch (err: any) {
      setError(err.message || "Viga kliendi tüübi salvestamisel")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Kas olete eraisik või ettevõte?
        </h3>
        <p className="text-sm text-gray-600">
          See aitab meil määrata sobivad tarneviisid ja arveldusreeglid.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Individual Option */}
        <button
          type="button"
          className={clx(
            "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
            {
              "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200": customerType === 'individual',
              "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": customerType !== 'individual'
            }
          )}
          onClick={() => setCustomerType('individual')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={clx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              {
                "bg-yellow-500": customerType === 'individual',
                "bg-gray-100": customerType !== 'individual'
              }
            )}>
              <User className={clx(
                "h-8 w-8",
                {
                  "text-white": customerType === 'individual',
                  "text-gray-600": customerType !== 'individual'
                }
              )} />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Eraisik
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Lihtsustatud tellimisvorm</li>
                <li>• Pakiautomaat ilma aadressita (alla 160€)</li>
                <li>• Kiire vormistamine</li>
              </ul>
            </div>
            
            {customerType === 'individual' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Business Option */}
        <button
          type="button"
          className={clx(
            "p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative w-full",
            {
              "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200": customerType === 'business',
              "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": customerType !== 'business'
            }
          )}
          onClick={() => setCustomerType('business')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={clx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              {
                "bg-yellow-500": customerType === 'business',
                "bg-gray-100": customerType !== 'business'
              }
            )}>
              <Building2 className={clx(
                "h-8 w-8",
                {
                  "text-white": customerType === 'business',
                  "text-gray-600": customerType !== 'business'
                }
              )} />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Ettevõte
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Täielik aadressi nõue</li>
                <li>• Äriarvete väljastamine</li>
                <li>• Kõik tarneviisid saadaval</li>
              </ul>
            </div>
            
            {customerType === 'business' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <KrapsButton
          onClick={handleContinue}
          disabled={!customerType || isLoading}
          variant="primary"
          size="large"
          className="min-w-[150px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvestab...
            </div>
          ) : (
            "Jätka"
          )}
        </KrapsButton>
      </div>
    </div>
  )
}

export default CustomerTypeSelection 