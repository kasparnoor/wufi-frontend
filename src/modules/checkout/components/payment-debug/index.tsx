"use client"

import React, { useEffect, useState } from 'react'
import { listCartPaymentMethods } from '@lib/data/payment'
import { HttpTypes } from '@medusajs/types'

interface PaymentDebugProps {
  cart: HttpTypes.StoreCart | null
}

const PaymentDebug: React.FC<PaymentDebugProps> = ({ cart }) => {
  const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart?.region?.id) {
      setLoading(true)
      const loadDebugInfo = async () => {
        try {
          // Get payment methods
          const methods = await listCartPaymentMethods(cart.region?.id || '')
          setPaymentMethods(methods)
          
          // Collect debug information
          const debug = {
            regionId: cart.region?.id,
            stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY ? '✅ Present' : '❌ Missing',
            paymentMethodsCount: methods?.length || 0,
            availableMethods: methods?.map(m => ({
              id: m.id,
              title: m.id
            })) || [],
            cartPaymentCollection: cart.payment_collection ? '✅ Present' : '❌ Missing',
            paymentSessions: cart.payment_collection?.payment_sessions?.map(s => ({
              id: s.id,
              provider_id: s.provider_id,
              status: s.status
            })) || []
          }
          setDebugInfo(debug)
        } catch (error) {
          console.error('Payment debug error:', error)
          setDebugInfo({ error: error?.toString() })
        } finally {
          setLoading(false)
        }
      }
      loadDebugInfo()
    }
  }, [cart?.region?.id])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 my-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">🐛 Payment Debug Info</h3>
      
      {loading ? (
        <p>Loading debug info...</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <strong>Region ID:</strong> {debugInfo.regionId || 'N/A'}
          </div>
          
          <div>
            <strong>Stripe Key:</strong> {debugInfo.stripeKey || '❌ Missing'}
          </div>
          
          <div>
            <strong>Payment Methods Count:</strong> {debugInfo.paymentMethodsCount}
          </div>
          
          {debugInfo.availableMethods?.length > 0 && (
            <div>
              <strong>Available Methods:</strong>
              <ul className="ml-4 mt-1">
                {debugInfo.availableMethods.map((method: any) => (
                  <li key={method.id} className="text-xs">
                    • {method.id} - {method.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <strong>Cart Payment Collection:</strong> {debugInfo.cartPaymentCollection}
          </div>
          
          {debugInfo.paymentSessions?.length > 0 && (
            <div>
              <strong>Payment Sessions:</strong>
              <ul className="ml-4 mt-1">
                {debugInfo.paymentSessions.map((session: any) => (
                  <li key={session.id} className="text-xs">
                    • {session.provider_id} ({session.status})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {debugInfo.error && (
            <div className="text-red-600">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PaymentDebug 