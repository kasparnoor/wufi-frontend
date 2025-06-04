"use client"

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface CheckoutErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface CheckoutErrorBoundaryProps {
  children: React.ReactNode
}

class CheckoutErrorBoundary extends React.Component<
  CheckoutErrorBoundaryProps,
  CheckoutErrorBoundaryState
> {
  constructor(props: CheckoutErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): CheckoutErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Checkout Error Boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    // Force a re-render by updating the key
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tehniline viga
            </h3>
            <p className="text-gray-600 mb-6">
              Tellimuse vormis ilmnes viga. Palun proovige uuesti.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Proovi uuesti
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default CheckoutErrorBoundary 