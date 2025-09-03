"use client"

import { convertToLocale } from "@lib/util/money"
import { Truck, Gift } from "lucide-react"
import { useMemo } from "react"

type FreeShippingProgressProps = {
  subtotal: number
  currencyCode: string
  freeShippingThreshold?: number
}

const FreeShippingProgress = ({ 
  subtotal, 
  currencyCode, 
  freeShippingThreshold = 50 // 50€ (cart subtotal is already in euros)
}: FreeShippingProgressProps) => {
  const progress = useMemo(() => {
    const percentage = Math.min((subtotal / freeShippingThreshold) * 100, 100)
    const remaining = Math.max(freeShippingThreshold - subtotal, 0)
    const hasReachedThreshold = subtotal >= freeShippingThreshold
    
    return {
      percentage,
      remaining,
      hasReachedThreshold,
      formattedRemaining: convertToLocale({
        amount: remaining,
        currency_code: currencyCode,
      }),
      formattedThreshold: "50€", // Fixed display value
    }
  }, [subtotal, freeShippingThreshold, currencyCode])

  if (progress.hasReachedThreshold) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-green-800 font-semibold text-xs sm:text-sm">
              🎉 Tasuta tarne saavutatud!
            </h3>
            <p className="text-green-700 text-xs mt-1">
              Teie tellimus saab tasuta kohaletoimetamise
            </p>
          </div>
        </div>
      </div>
    )
  }

    return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-blue-800 font-semibold text-xs sm:text-sm">
            Tasuta tarne alates 50€
          </h3>
          <p className="text-blue-700 text-xs mt-1">
            Lisa veel <span className="font-semibold">{progress.formattedRemaining}</span> ja saa tasuta tarne!
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
                {/* Progress Indicator */}
        <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-xs">
          <span className="text-blue-600 font-medium">
            {Math.round(progress.percentage)}% täidetud
          </span>
          <span className="text-blue-700">
            50€
          </span>
        </div>
      </div>
      
      {/* Encouragement Messages */}
      {progress.percentage > 75 && (
        <div className="mt-2 sm:mt-3 text-center">
          <p className="text-blue-800 text-xs font-medium animate-pulse">
            🔥 Väga lähedal! Veel natuke ja tasuta tarne on sinu!
          </p>
        </div>
      )}
      
      {progress.percentage > 50 && progress.percentage <= 75 && (
        <div className="mt-2 sm:mt-3 text-center">
          <p className="text-blue-800 text-xs font-medium">
            💪 Oled poolel teel tasuta tarnerni!
          </p>
        </div>
      )}
    </div>
  )
}

export default FreeShippingProgress 