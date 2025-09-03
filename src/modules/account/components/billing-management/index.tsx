"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { 
  CreditCard,
  Edit3,
  Shield,
  CheckCircle,
  Info,
  X
} from "lucide-react"

interface BillingManagementProps {
  customer: HttpTypes.StoreCustomer
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  name: string
}

// Modal component for editing payment method
const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  method, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  method?: PaymentMethod
  onSave: (data: any) => void
}) => {
  const [formData, setFormData] = useState({
    cardNumber: method?.last4 ? `****-****-****-${method.last4}` : '',
    expiryMonth: method?.expiry ? method.expiry.split('/')[0] : '',
    expiryYear: method?.expiry ? method.expiry.split('/')[1] : '',
    cvv: '',
    name: method?.name || ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {method ? 'Muuda makseviisi' : 'Lisa makseviis'}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Kaardi number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                  Kuu
                </label>
                <select
                  id="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Aasta
                </label>
                <select
                  id="expiryYear"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">YYYY</option>
                  {Array.from({length: 10}, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Kaardi nimi (valikuline)
              </label>
              <input
                id="cardName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="nt. Peakaart"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {method ? 'Salvesta muudatused' : 'Lisa makseviis'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Tühista
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const BillingManagement = ({ customer }: BillingManagementProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)

  // Mock single payment method data
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>({
    id: 'pm_1',
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
    name: 'Peakaart'
  })

  const handleSaveCard = (cardData: any) => {
    console.log('Saving payment method:', cardData)
    
    const newMethod: PaymentMethod = {
      id: editingMethod?.id || 'pm_new',
      type: 'Visa', // Could determine from card number
      last4: cardData.cardNumber.slice(-4),
      expiry: `${cardData.expiryMonth}/${cardData.expiryYear}`,
      name: cardData.name || 'Maksekaart'
    }
    
    setPaymentMethod(newMethod)
    setEditingMethod(null)
    alert(editingMethod ? 'Makseviis uuendatud!' : 'Makseviis lisatud!')
  }

  const handleEditMethod = () => {
    setEditingMethod(paymentMethod)
    setShowPaymentModal(true)
  }

  const handleAddMethod = () => {
    setEditingMethod(null)
    setShowPaymentModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Demo režiim</h3>
            <p className="text-sm text-blue-700">
              See on demo versioon. Makseviisi muudatused ei salvesta päriselt.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Makseviis
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Hallige oma makseviisi püsitellimuste jaoks
        </p>
      </div>

      {/* Payment Method Section */}
      <Container className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Teie makseviis
            </h3>
          </div>

          {paymentMethod ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {paymentMethod.type} •••• {paymentMethod.last4}
                      </span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Aktiivne</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Aegub {paymentMethod.expiry}
                      {paymentMethod.name && ` • ${paymentMethod.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEditMethod}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Makseviis puudub</h3>
              <p className="text-gray-600 mb-4">
                Lisage makseviis, et saaksite tellimusi esitada
              </p>
              <button
                onClick={handleAddMethod}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Lisa makseviis
              </button>
            </div>
          )}
        </div>
      </Container>

      {/* Security Information */}
      <Container className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Turvalisus
        </h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Turvaline maksevahendus</h4>
              <p className="text-sm text-green-700">
                Teie makseandmed on krüpteeritud ja turvatud. Meie ei salvesta teie kaardi täielikku numbrit.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Payment Method Modal */}
             <PaymentMethodModal
         isOpen={showPaymentModal}
         onClose={() => {
           setShowPaymentModal(false)
           setEditingMethod(null)
         }}
         method={editingMethod || undefined}
         onSave={handleSaveCard}
       />
    </div>
  )
}

export default BillingManagement 