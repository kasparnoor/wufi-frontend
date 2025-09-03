"use client"

import { useState, useEffect } from "react"
import { Register } from "@lib/components"
import { Login } from "@lib/components"
import { ArrowLeft, HelpCircle } from "lucide-react"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type LoginTemplateProps = {
  loginAction?: (prevState: any, formData: FormData) => Promise<any>
  signupAction?: (prevState: any, formData: FormData) => Promise<any>
}

const LoginTemplate = ({ loginAction, signupAction }: LoginTemplateProps) => {
  const [currentView, setCurrentView] = useState("sign-in")
  const [isAnimating, setIsAnimating] = useState(false)

  // Enhanced view switching with animation
  const handleViewChange = (newView: string) => {
    if (newView === currentView) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentView(newView)
      setIsAnimating(false)
    }, 150)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Could add close functionality here if needed
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      {/* Background decorative elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8">
        {/* View toggle buttons - Mobile friendly */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 backdrop-blur-sm border border-yellow-200/50 rounded-full p-1 shadow-lg">
            <div className="flex">
              <button
                onClick={() => handleViewChange("sign-in")}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  currentView === "sign-in"
                    ? "bg-yellow-500 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Logi sisse
              </button>
              <button
                onClick={() => handleViewChange("register")}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  currentView === "register"
                    ? "bg-yellow-500 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Loo konto
              </button>
            </div>
          </div>
        </div>

        {/* Card container with improved mobile styling */}
        <div className="bg-white/95 backdrop-blur-sm border border-yellow-200/50 rounded-2xl shadow-2xl shadow-yellow-500/10 p-6 sm:p-8 lg:p-10 mx-auto transition-all duration-300">
          {/* Brand header - optimized for mobile */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mb-3 sm:mb-4 shadow-lg">
              <span className="text-xl sm:text-2xl font-bold text-yellow-900">🐾</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Kraps</h1>
            <p className="text-sm sm:text-base text-gray-600">Lemmikloomade toidutellimine</p>
          </div>

          {/* Form content with smooth transitions */}
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {currentView === "sign-in" ? (
              <Login setCurrentView={handleViewChange} loginAction={loginAction} />
            ) : (
              <Register setCurrentView={handleViewChange} signupAction={signupAction} />
            )}
          </div>
        </div>
        
        {/* Footer - improved mobile layout */}
        <div className="text-center space-y-3">
          <p className="text-xs sm:text-sm text-gray-500">
            Vajate abi?{" "}
            <a 
              href="/klienditugi" 
              className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
            >
              Võtke meiega ühendust
            </a>
          </p>
          
          {/* Additional helpful links for mobile */}
          <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
            <a 
              href="/policies/privaatsuspoliitika" 
              className="hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
            >
              Privaatsus
            </a>
            <span>•</span>
            <a 
              href="/policies/kasutustingimused" 
              className="hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
            >
              Tingimused
            </a>
          </div>
        </div>
      </div>

      {/* Floating help button for mobile */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:hidden"
        onClick={() => window.open('/klienditugi', '_blank')}
        aria-label="Abi"
      >
        <HelpCircle className="h-6 w-6 mx-auto" />
      </button>
    </div>
  )
}

export default LoginTemplate
