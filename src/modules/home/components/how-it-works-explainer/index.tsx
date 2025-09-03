"use client"

import { useState } from "react"
import {
  Clock,
  CreditCard,
  CheckCircle,
  Percent,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Calculator,
  Euro
} from "lucide-react"

const HowItWorksExplainer = () => {
  const [explainerMode, setExplainerMode] = useState<'single' | 'subscription'>('subscription')
  const [orderValue, setOrderValue] = useState<number>(50)

  return (
    <div className="py-16 bg-gray-50">
      <div className="content-container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/10 px-6 py-2.5 rounded-full border border-yellow-400/30">
            <Sparkles className="h-5 w-5 text-yellow-800" aria-hidden="true" />
            <span className="text-yellow-800 font-semibold">Kuidas see töötab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">Lihtne ja mugav</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Valige sobivad tooted, seadke tellimuse sagedus ja laske meil teie lemmikloomade eest hoolitseda.
          </p>
          
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200" role="group" aria-label="Tellimuse tüüp">
              <button
                onClick={() => setExplainerMode('single')}
                aria-pressed={explainerMode === 'single'}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  explainerMode === 'single'
                    ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Ühekordne tellimus
              </button>
              <button
                onClick={() => setExplainerMode('subscription')}
                aria-pressed={explainerMode === 'subscription'}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  explainerMode === 'subscription'
                    ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Püsitellimus
              </button>
            </div>
          </div>
        </div>

        {/* 4-Step Process */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Vali toode ja kogus
              </h3>
              <p className="text-gray-600 text-sm">
                {explainerMode === 'single' 
                  ? 'Leia oma lemmiklooma jaoks sobiv toode ja määra vajalik kogus'
                  : 'Vali oma lemmiklooma toit ja määra igakuine kogus'
                }
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Clock className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {explainerMode === 'single' 
                  ? 'Vali tarneviis ja -aeg'
                  : 'Vali kui sageli me sinuni toimetame'
                }
              </h3>
              <p className="text-gray-600 text-sm">
                {explainerMode === 'single'
                  ? 'Määra, kuidas ja millal soovid oma tellimust kätte saada'
                  : 'Seadista automaatne tarne - nädalas, kuus või kui sageli vajad'
                }
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {explainerMode === 'single' 
                  ? 'Vormista tellimus'
                  : 'Turvaline maksmine'
                }
              </h3>
              <p className="text-gray-600 text-sm">
                {explainerMode === 'single'
                  ? 'Lisa oma andmed, vali makseviis ja kinnita tellimus'
                  : 'Ühekordne seadistus turvaliseks automaatseks maksmiseks'
                }
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  {explainerMode === 'single' ? (
                    <CheckCircle className="h-8 w-8" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="h-8 w-8" aria-hidden="true" />
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {explainerMode === 'single' 
                  ? 'Naudi oma tellimust'
                  : 'Täielik kontroll'
                }
              </h3>
              <p className="text-gray-600 text-sm">
                {explainerMode === 'single'
                  ? 'Saad oma tellimuse kätte ja võid alati uuesti tellida'
                  : 'Kõik ülejäänud toimub automaatselt. Saad alati tühistada, muuta või jätta ühe kuu vahele'
                }
              </p>
            </div>
          </div>

          {/* Benefits Banner */}
          {explainerMode === 'subscription' && (
            <div className="mt-16 relative">
              {/* Main Benefits Card */}
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-yellow-400/20 border border-yellow-200/50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                      <Percent className="h-6 w-6 text-yellow-900" aria-hidden="true" />
                      <span className="text-yellow-900 font-bold text-lg">Püsitellimuse eelised</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-yellow-900 mb-3">
                      Säästa esimeselt <span className="text-4xl lg:text-5xl">30%</span> <span className="text-2xl lg:text-3xl">(kuni 20€)</span>
                    </h3>
                                          <p className="text-yellow-800 text-lg">ülejäänud toimub automaatselt ja sina naudid mugavust</p>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                          <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                                                 <div>
                           <h4 className="font-bold text-gray-800 mb-2">30% soodustus (kuni 20€)</h4>
                           <p className="text-gray-600 text-sm leading-relaxed">esimesel tellimusel</p>
                         </div>
                      </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                          <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2">5% soodustus</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">igal järgmisel tarnel automaatselt</p>
                        </div>
                      </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                          <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2">Täielik kontroll</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">muuda, tühista või jäta vahele alati</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Calculator */}
                  <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 mb-3 bg-yellow-900/10 px-4 py-2 rounded-full">
                        <Calculator className="h-5 w-5 text-yellow-900" aria-hidden="true" />
                        <span className="text-yellow-900 font-semibold">Säästukalkulaator</span>
                      </div>
                      <p className="text-yellow-800 text-sm">Arvuta välja oma kokkuhoid püsitellimuse puhul</p>
                    </div>

                    {/* Row Layout for Space Efficiency */}
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                      {/* Input Section */}
                      <div className="lg:flex-shrink-0">
                        <label htmlFor="orderValue" className="block text-gray-700 font-medium mb-3 text-center lg:text-left">
                          Tellimuse väärtus kuus:
                        </label>
                        <div className="relative w-40 mx-auto lg:mx-0">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            id="orderValue"
                            type="number"
                            min="10"
                            max="500"
                            value={orderValue}
                            onChange={(e) => setOrderValue(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-lg font-semibold text-center"
                            placeholder="50"
                          />
                        </div>
                      </div>

                      {/* Results Section - Horizontal Flow */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Order Savings */}
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                          <div className="text-2xl font-bold text-green-700 mb-1">
                            -{Math.round(orderValue * 0.3)}€
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Esimene tellimus
                          </div>
                          <div className="text-xs text-green-500">
                            (30% soodustus, kuni 20€)
                          </div>
                        </div>

                        {/* Yearly Total Savings - Single Display */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                          <div className="text-2xl font-bold text-blue-700 mb-1">
                            -{Math.round(orderValue * 0.3 + orderValue * 0.05 * 11)}€
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            Aasta kokkuhoid
                          </div>
                          <div className="text-xs text-blue-500">
                            vs. tavalised hinnad
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HowItWorksExplainer 