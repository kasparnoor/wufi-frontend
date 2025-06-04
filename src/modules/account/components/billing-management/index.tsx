"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { 
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Upload
} from "lucide-react"

interface BillingManagementProps {
  customer: HttpTypes.StoreCustomer
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
  name: string
}

// Modal component for adding/editing payment methods
const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  method, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  method?: any
  onSave: (data: any) => void
}) => {
  const [formData, setFormData] = useState({
    cardNumber: method?.number || '',
    expiryMonth: method?.expiryMonth || '',
    expiryYear: method?.expiryYear || '',
    cvv: '',
    name: method?.name || '',
    isDefault: method?.isDefault || false
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
              {method ? 'Muuda kaarti' : 'Lisa uus kaart'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaardi number
              </label>
              <input
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuu
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aasta
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaardi nimi (valikuline)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="nt. Peakaart"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Määra peamiseks makseviisiks
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {method ? 'Salvesta muudatused' : 'Lisa kaart'}
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

// Confirmation modal for deleting payment methods
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cardLast4 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cardLast4: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kustuta kaart</h3>
              <p className="text-sm text-gray-600">•••• {cardLast4}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Kas olete kindel, et soovite selle makseviisi kustutada? Seda toimingut ei saa tagasi võtta.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Kustuta
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Tühista
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Address edit modal
const AddressEditModal = ({ 
  isOpen, 
  onClose, 
  address, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  address: any
  onSave: (data: any) => void
}) => {
  const [formData, setFormData] = useState({
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    street: address?.street || 'Tallinna tn 123',
    city: address?.city || 'Tallinn',
    postalCode: address?.postalCode || '10115',
    country: address?.country || 'Eesti'
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
            <h3 className="text-lg font-semibold text-gray-900">Muuda arveldusaadressi</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eesnimi
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perekonnanimi
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tänava aadress
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linn
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postiindeks
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Riik
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Eesti">Eesti</option>
                <option value="Läti">Läti</option>
                <option value="Leedu">Leedu</option>
                <option value="Soome">Soome</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Salvesta aadress
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "card_1",
      type: "visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true,
      name: "Peakaart"
    },
    {
      id: "card_2", 
      type: "mastercard",
      last4: "5555",
      expiry: "03/27",
      isDefault: false,
      name: "Varukaart"
    }
  ])

  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [editingCard, setEditingCard] = useState<PaymentMethod | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCard, setDeletingCard] = useState<PaymentMethod | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [billingAddress, setBillingAddress] = useState({
    firstName: customer.first_name || 'Max',
    lastName: customer.last_name || 'Omanik',
    street: 'Tallinna tn 123',
    city: 'Tallinn',
    postalCode: '10115',
    country: 'Eesti'
  })

  // Mock data for recent invoices
  const recentInvoices = [
    {
      id: "inv_001",
      date: "2024-01-15",
      amount: "€28.90",
      status: "paid",
      description: "Premium Adult Dog Food - Kuu püsitellimus"
    },
    {
      id: "inv_002", 
      date: "2023-12-15",
      amount: "€28.90",
      status: "paid",
      description: "Premium Adult Dog Food - Kuu püsitellimus"
    },
    {
      id: "inv_003",
      date: "2023-11-15", 
      amount: "€28.90",
      status: "paid",
      description: "Premium Adult Dog Food - Kuu püsitellimus"
    }
  ]

  const handleSaveCard = (cardData: any) => {
    if (editingCard) {
      // Update existing card
      setPaymentMethods(prev => prev.map(card => 
        card.id === editingCard.id 
          ? { ...card, ...cardData, last4: cardData.cardNumber.slice(-4) }
          : card
      ))
    } else {
      // Add new card
      const newCard = {
        id: `card_${Date.now()}`,
        type: cardData.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        last4: cardData.cardNumber.slice(-4),
        expiry: `${cardData.expiryMonth}/${cardData.expiryYear.slice(-2)}`,
        isDefault: cardData.isDefault,
        name: cardData.name || 'Uus kaart'
      }
      setPaymentMethods(prev => [...prev, newCard])
    }
    setEditingCard(null)
  }

  const handleDeleteCard = () => {
    if (deletingCard) {
      setPaymentMethods(prev => prev.filter(card => card.id !== deletingCard.id))
      setDeletingCard(null)
      setShowDeleteModal(false)
    }
  }

  const handleSetPrimary = (cardId: string) => {
    setPaymentMethods(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })))
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`)
    // In real implementation, this would trigger a file download
    alert(`Allalaadimine algas: Arve ${invoiceId}`)
  }

  const handleSaveAddress = (addressData: any) => {
    setBillingAddress(addressData)
  }

  return (
    <div className="space-y-8">
      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 text-sm">
            <strong>Demo:</strong> Näidisandmed kuni backend valmib
          </span>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Arveldus ja maksed 💳
        </h1>
        <p className="text-lg text-gray-600">
          Hallige makseviise, vaadake arveid ja kontrollite arveldusandmeid
        </p>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">€86.70</div>
            <div className="text-sm text-gray-600">Kokku makstud</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Makstud arveid</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">€28.90</div>
            <div className="text-sm text-gray-600">Järgmine makse</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600">15. veebr</div>
            <div className="text-sm text-gray-600">Järgmine kuupäev</div>
          </div>
        </Container>
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Makseviisid</h2>
          <button 
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Lisa uus kaart
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <Container key={method.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          •••• {method.last4}
                        </h3>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Peamine
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {method.type.toUpperCase()} • Kehtib {method.expiry}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingCard(method)
                        setShowAddCardModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingCard(method)
                        setShowDeleteModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{method.name}</span>
                    {!method.isDefault && (
                      <button 
                        onClick={() => handleSetPrimary(method.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Määra peamiseks
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Container>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Viimased arved</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Vaata kõiki arveid
          </button>
        </div>

        <Container className="p-6">
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {invoice.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {invoice.amount}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Makstud</span>
                  </div>
                  <button 
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Billing Settings */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Arveldusseaded</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Container className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Automaatne maksmine</h3>
              </div>
              <p className="text-sm text-gray-600">
                Automaatne nõusoleku abil püsitellimuste eest maksmine
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-700">Automaatne maksmine</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Container>

          <Container className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">E-arved</h3>
              </div>
              <p className="text-sm text-gray-600">
                Saatke arved e-maili teel PDF vormingus
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">E-arved</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  Saadetakse aadressile: {customer.email}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Arveldusaadress</h2>
        
        <Container className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {billingAddress.firstName} {billingAddress.lastName}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{billingAddress.street}</p>
                <p>{billingAddress.postalCode} {billingAddress.city}</p>
                <p>{billingAddress.country}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </Container>
      </div>

      {/* Modals */}
      <PaymentMethodModal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false)
          setEditingCard(null)
        }}
        method={editingCard}
        onSave={handleSaveCard}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingCard(null)
        }}
        onConfirm={handleDeleteCard}
        cardLast4={deletingCard?.last4 || ''}
      />

      <AddressEditModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={billingAddress}
        onSave={handleSaveAddress}
      />
    </div>
  )
}

export default BillingManagement 