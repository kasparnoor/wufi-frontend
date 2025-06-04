"use client"

import { useState } from "react"
import { PawPrint, Calculator, Euro } from "lucide-react"

type OrderingMode = "subscription" | "one-time"

interface Step {
  step: string
  title: string
  desc: string
}

const OrderingMethodsSection = () => {
  const [selectedMode, setSelectedMode] = useState<OrderingMode>("subscription")
  const [orderValue, setOrderValue] = useState<number>(50)

  const subscriptionSteps: Step[] = [
    { step: "1", title: "Vali toit", desc: "Vali sobiv toit lemmikule" },
    { step: "2", title: "Määra sagedus", desc: "Kui tihti tahad toitu saada" },
    { step: "3", title: "Halda tellimust", desc: "Muuda, peata või tühista igal ajal" },
    { step: "4", title: "Naudi", desc: "Lemmikul on alati toit olemas" }
  ]

  const oneTimeSteps: Step[] = [
    { step: "1", title: "Vali toit", desc: "Lisa sobivad tooted korvi" },
    { step: "2", title: "Kinnita ost", desc: "Kontrolli kogust ja maksma" },
    { step: "3", title: "Vali tarneviis", desc: "Valik pakiautomaadi või koju" },
    { step: "4", title: "Naudi", desc: "Lemmik saab kiiresti kõhu täis" }
  ]

  const currentSteps = selectedMode === "subscription" ? subscriptionSteps : oneTimeSteps

  // Savings calculations
  const firstOrderDiscount = 0.30 // 30% off first order
  const subsequentDiscount = 0.05 // 5% off subsequent orders
  const ordersPerYear = 12 // Monthly orders

  const firstOrderPrice = orderValue * (1 - firstOrderDiscount)
  const subsequentOrderPrice = orderValue * (1 - subsequentDiscount)
  const regularPrice = orderValue

  const yearlySubscriptionCost = firstOrderPrice + (subsequentOrderPrice * (ordersPerYear - 1))
  const yearlyRegularCost = regularPrice * ordersPerYear
  const yearlySavings = yearlyRegularCost - yearlySubscriptionCost

  return (
    <div className="py-16 bg-white">
      <div className="content-container">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl text-gray-900 font-bold mb-4">
            Kaks viisi tellimiseks
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Vali endale sobiv viis - regulaarne püsitellimus või vajaduspõhised ühekordsed tellimused
          </p>
          
          {/* Toggle Component */}
          <div className="inline-flex bg-gray-100 rounded-full p-1 mb-12 mx-auto">
            <button 
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedMode === "subscription" 
                  ? 'bg-yellow-400 text-yellow-900 shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setSelectedMode("subscription")}
            >
              Püsitellimus
            </button>
            <button 
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedMode === "one-time" 
                  ? 'bg-yellow-400 text-yellow-900 shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setSelectedMode("one-time")}
            >
              Ühekordne ost
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Desktop Steps with Clean Connecting Line */}
          <div className="hidden md:block relative">
            {/* Clean connecting line between steps */}
            <div className="absolute top-6 left-0 right-0 px-6">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-4 gap-8 relative z-10">
              {currentSteps.map((item, index) => (
                <div 
                  key={`${selectedMode}-${index}`} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-800 font-semibold text-lg mb-4 mx-auto border-2 border-yellow-400/30 hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Steps */}
          <div className="md:hidden space-y-0">
            {currentSteps.map((item, index) => (
              <div key={`${selectedMode}-mobile-${index}`} className="relative">
                <div className="flex items-start gap-4 p-4 bg-yellow-50/50 rounded-xl border border-yellow-200/50 animate-fade-in-up relative z-10"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-800 font-semibold border-2 border-yellow-400/30 flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {/* Connecting line to next step */}
                {index < currentSteps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-6 bg-yellow-400/60 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Savings Calculator - Only for Subscription Mode */}
        {selectedMode === "subscription" && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-6 sm:p-8 border border-yellow-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-yellow-800" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Säästu kalkulaator</h3>
                  <p className="text-sm text-gray-600">Vaata, kui palju püsitellimusega säästad</p>
                </div>
              </div>

              {/* Order Value Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keskmine tellimuse väärtus kuus
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={orderValue}
                    onChange={(e) => setOrderValue(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="50"
                    min="10"
                    max="500"
                  />
                </div>
              </div>

              {/* Savings Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-yellow-200/50">
                  <span className="text-gray-600">Esimene tellimus (30% allahindlus)</span>
                  <span className="font-semibold text-green-600">
                    €{firstOrderPrice.toFixed(2)} 
                    <span className="text-sm text-gray-500 line-through ml-2">€{orderValue.toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-yellow-200/50">
                  <span className="text-gray-600">Järgmised tellimused (5% allahindlus)</span>
                  <span className="font-semibold text-green-600">
                    €{subsequentOrderPrice.toFixed(2)}
                    <span className="text-sm text-gray-500 line-through ml-2">€{orderValue.toFixed(2)}</span>
                  </span>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Aastane kokkuhoid</span>
                    <span className="text-2xl font-bold text-green-600">€{yearlySavings.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Võrreldes ühekordsete tellimustega
                  </p>
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="mt-6 pt-6 border-t border-yellow-200/50">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-yellow-800" />
                  <span>Tasuta tarne kõikidele tellimustele üle 50€</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderingMethodsSection 