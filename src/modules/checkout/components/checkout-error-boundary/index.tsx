"use client"

import React from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CheckoutErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  navigationAttempts: number
  lastNavigationTime: number
}

interface CheckoutErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    goBack: () => void
  }>
}

export class CheckoutErrorBoundary extends React.Component<
  CheckoutErrorBoundaryProps,
  CheckoutErrorBoundaryState
> {
  private resetTimeoutId: NodeJS.Timeout | null = null
  private navigationHistory = {
    attempts: [] as number[],
    lastReset: Date.now()
  }

  constructor(props: CheckoutErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      navigationAttempts: 0,
      lastNavigationTime: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<CheckoutErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Checkout Error Boundary caught an error:', error, errorInfo)
    
    // Track navigation loops
    const now = Date.now()
    const history = this.navigationHistory
    
    if (history) {
      // Clean old attempts (older than 10 seconds)
      history.attempts = history.attempts.filter(time => now - time < 10000)
      
      // Add current attempt
      history.attempts.push(now)
      
      // Check for rapid navigation attempts (potential loop)
      if (history.attempts.length > 5) {
        console.warn('Potential navigation loop detected in checkout')
        // Reset navigation attempts
        history.attempts = []
        history.lastReset = now
      }
    }
    
    this.setState({
      errorInfo,
      navigationAttempts: history?.attempts.length || 0,
      lastNavigationTime: now,
    })

    // Auto-recovery attempt for certain errors
    if (this.shouldAttemptAutoRecovery(error)) {
      console.log('Attempting auto-recovery from checkout error')
      this.resetTimeoutId = setTimeout(() => {
        this.resetError()
      }, 3000) // Auto-recover after 3 seconds
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private shouldAttemptAutoRecovery(error: Error): boolean {
    const recoverableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'NetworkError',
      'fetch',
      'timeout',
      'AbortError'
    ]
    
    const errorMessage = error.message.toLowerCase()
    return recoverableErrors.some(pattern => errorMessage.includes(pattern.toLowerCase()))
  }

  private resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      navigationAttempts: 0,
      lastNavigationTime: 0,
    })
  }

  private goBack = () => {
    if (typeof window !== 'undefined') {
      // Try to go back in history
      if (window.history.length > 1) {
        window.history.back()
      } else {
        // Fallback to cart page
        window.location.href = '/cart'
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, navigationAttempts } = this.state
      const isNavigationLoop = navigationAttempts > 3
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={error!}
            resetError={this.resetError}
            goBack={this.goBack}
          />
        )
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isNavigationLoop ? 'Navigeerimise viga' : 'Ostlemise viga'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isNavigationLoop
                ? 'Tuvastasime navigeerimise silmuse. Proovime seda automaatselt parandada.'
                : 'Midagi läks valesti ostlemise ajal. Ärge muretsege, teie ostukorv on turvaline.'}
            </p>
            
            {isNavigationLoop && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  Navigeerimiskatseid: {navigationAttempts}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Proovi uuesti
              </button>
              
              <button
                onClick={this.goBack}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Mine tagasi
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                  Tehniline info (ainult arendajale)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-auto">
                  {error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default CheckoutErrorBoundary 