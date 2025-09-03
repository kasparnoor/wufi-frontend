"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Building2, User, ArrowRight } from "lucide-react"
import { clx } from "@medusajs/ui"
import { KrapsButton } from "@lib/components"
import { updateCart } from "@lib/data/cart"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface CustomerTypeSelectionProps {
  cart: HttpTypes.StoreCart
}

const CustomerTypeSelection: React.FC<CustomerTypeSelectionProps> = ({ cart }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const isOpen = searchParams.get("step") === "customer-type"
  
  const currentCustomerType = (cart?.metadata as any)?.customer_type
  const [selectedType, setSelectedType] = useState<'individual' | 'business' | null>(
    currentCustomerType || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTypeSelect = (type: 'individual' | 'business') => {
    setSelectedType(type)
    setError(null)
  }

  const handleContinue = async () => {
    if (!selectedType) return

    setIsLoading(true)
    setError(null)

    try {
      // Update cart metadata with customer type
      await updateCart({
        metadata: {
          ...cart.metadata,
          customer_type: selectedType
        }
      })

      // Navigate to next step
      router.push(`${pathname}?step=delivery`)
    } catch (err: any) {
      setError(err.message || "Viga kliendi tüübi salvestamisel")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {currentCustomerType === 'business' ? (
                <Building2 className="h-5 w-5 text-gray-600" />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentCustomerType === 'business' ? 'Ettevõte' : 'Eraisik'}
              </p>
              <p className="text-xs text-gray-600">Kliendi tüüp</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`${pathname}?step=customer-type`)}
            className="text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
          >
            Muuda
          </button>
        </div>
      </div>
    )
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
              "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200": selectedType === 'individual',
              "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": selectedType !== 'individual'
            }
          )}
          onClick={() => handleTypeSelect('individual')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={clx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              {
                "bg-yellow-500": selectedType === 'individual',
                "bg-gray-100": selectedType !== 'individual'
              }
            )}>
              <User className={clx(
                "h-8 w-8",
                {
                  "text-white": selectedType === 'individual',
                  "text-gray-600": selectedType !== 'individual'
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
            
            {selectedType === 'individual' && (
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
              "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200": selectedType === 'business',
              "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": selectedType !== 'business'
            }
          )}
          onClick={() => handleTypeSelect('business')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={clx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              {
                "bg-yellow-500": selectedType === 'business',
                "bg-gray-100": selectedType !== 'business'
              }
            )}>
              <Building2 className={clx(
                "h-8 w-8",
                {
                  "text-white": selectedType === 'business',
                  "text-gray-600": selectedType !== 'business'
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
            
            {selectedType === 'business' && (
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <KrapsButton
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvestamine...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Jätka
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </KrapsButton>
      </div>
    </div>
  )
}

export default CustomerTypeSelection 