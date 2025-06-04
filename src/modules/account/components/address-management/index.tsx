"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Home, 
  Building2,
  Heart,
  Info,
  CheckCircle,
  Star
} from "lucide-react"
import { LocalizedClientLink } from "@lib/components"

interface AddressManagementProps {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressManagement = ({ customer, region }: AddressManagementProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Mock address for demonstration
  const mockAddresses = customer.addresses?.length > 0 ? customer.addresses : [
    {
      id: 'addr_1',
      first_name: 'Max',
      last_name: 'Omanik',
      address_1: 'Tallinna tn 123',
      address_2: 'Korter 45',
      city: 'Tallinn',
      postal_code: '10115',
      country_code: 'EE',
      metadata: { is_primary: true, label: 'Kodu' }
    }
  ]

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Max'i tarneaadressid 🏠
          </h1>
          <p className="text-lg text-gray-600">
            Hallige oma tarneaadresse lemmikloomade toidu jaoks
          </p>
        </div>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Lisa aadress
          </button>
        )}
      </div>

      {/* Address Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{mockAddresses.length}</div>
            <div className="text-sm text-gray-600">Salvestatud aadressid</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {mockAddresses.filter(addr => addr.metadata?.is_primary).length}
            </div>
            <div className="text-sm text-gray-600">Peamine aadress</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">🚚</div>
            <div className="text-sm text-gray-600">Tasuta tarne</div>
          </div>
        </Container>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <Container className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Lisa uus tarneaadress</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eesnimi *
                </label>
                <input
                  type="text"
                  placeholder="nt. Max"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perekonnanimi *
                </label>
                <input
                  type="text"
                  placeholder="nt. Omanik"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tänavanimi ja maja number *
              </label>
              <input
                type="text"
                placeholder="nt. Tallinna tn 123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linn *
                </label>
                <input
                  type="text"
                  placeholder="nt. Tallinn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postiindeks *
                </label>
                <input
                  type="text"
                  placeholder="nt. 10115"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Salvesta aadress
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Tühista
              </button>
            </div>
          </div>
        </Container>
      )}

      {/* Addresses List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Teie aadressid ({mockAddresses.length})
        </h2>
        
        {mockAddresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {mockAddresses.map((address: any, index: number) => (
              <AddressCard key={address.id || index} address={address} />
            ))}
          </div>
        ) : (
          <EmptyAddressesState onAddAddress={() => setShowAddForm(true)} />
        )}
      </div>

      {/* Delivery Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Tarneinfo
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Tasuta tarne</h4>
            <p className="text-sm text-gray-600">
              Kõik tellimused üle 29€ tarnitakse tasuta. Väiksemad tellimused - 4.99€ tarne.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Tarneaeg</h4>
            <p className="text-sm text-gray-600">
              Tavaliselt 1-3 tööpäeva. Püsitellimused saabuvad automaatselt valitud ajavahemiku järgi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component: Address Card
const AddressCard = ({ address }: { address: any }) => {
  const isPrimary = address.metadata?.is_primary === true
  const label = address.metadata?.label || 'Tarne'
  
  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'kodu':
        return <Home className="h-6 w-6" />
      case 'töö':
        return <Building2 className="h-6 w-6" />
      default:
        return <MapPin className="h-6 w-6" />
    }
  }

  return (
    <Container className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">
              {getAddressIcon(label)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                {isPrimary && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <Star className="h-3 w-3" />
                    Peamine
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{address.first_name} {address.last_name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Address Details */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>{address.address_1}</p>
          {address.address_2 && <p>{address.address_2}</p>}
          <p>{address.postal_code} {address.city}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {!isPrimary && (
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Määra peamiseks
            </button>
          )}
          <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
            Kopeeri aadress
          </button>
        </div>
      </div>
    </Container>
  )
}

// Component: Empty addresses state
const EmptyAddressesState = ({ onAddAddress }: { onAddAddress: () => void }) => {
  return (
    <Container className="p-12 text-center">
      <div className="text-6xl mb-6">🏠</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Lisa oma esimene tarneaadress
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Salvesta oma tarneaadress, et tellimused jõuaksid õigesse kohta. Sa saad lisada mitu aadressi.
      </p>
      <button
        onClick={onAddAddress}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Lisa esimene aadress
      </button>
    </Container>
  )
}

export default AddressManagement 