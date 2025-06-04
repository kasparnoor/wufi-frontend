"use client"

import { useState, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit3, 
  CheckCircle,
  Info,
  Camera,
  MapPin,
  CreditCard,
  Bell,
  Heart,
  X,
  Upload
} from "lucide-react"
import { LocalizedClientLink } from "@lib/components"

interface ProfileManagementProps {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

// Modal for adding favorite products
const FavoriteProductModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (product: any) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const mockProducts = [
    { id: 1, name: 'Premium Adult Dog Food', price: '€28.90', image: null },
    { id: 2, name: 'Puppy Starter Kit', price: '€45.50', image: null },
    { id: 3, name: 'Senior Dog Formula', price: '€32.90', image: null },
    { id: 4, name: 'Cat Food Premium', price: '€24.90', image: null }
  ]

  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lisa lemmiktoode</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Otsi tooteid..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSave(product)
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">IMG</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.price}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Tooteid ei leitud</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Profile picture upload modal
const ProfilePictureModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (file: File) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSave(file)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Muuda profiilipilti</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                M
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Valige uus profiilipilt
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Vali fail
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Tühista
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Toetatud failivormingud: JPG, PNG, GIF<br />
              Maksimaalne failisuurus: 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileManagement = ({ customer, regions }: ProfileManagementProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [favoriteProducts, setFavoriteProducts] = useState([
    {
      id: 1,
      name: 'Premium Adult Dog Food',
      lastOrdered: 'Viimati tellitud 2 nädalat tagasi'
    }
  ])
  const [showFavoriteModal, setShowFavoriteModal] = useState(false)
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: customer.first_name || 'Max',
    lastName: customer.last_name || 'Omanik',
    email: customer.email || 'max@email.com',
    phone: customer.phone || '+372 5123 4567'
  })

  const handleSaveFavoriteProduct = (product: any) => {
    setFavoriteProducts(prev => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        lastOrdered: 'Pole veel tellitud'
      }
    ])
  }

  const handleProfilePictureUpload = (file: File) => {
    console.log('Uploading profile picture:', file.name)
    // In real implementation, this would upload to a server
    alert(`Profiilipilt "${file.name}" üles laaditud!`)
  }

  const handleSaveProfileSection = (section: string, value: string) => {
    if (section === 'name') {
      const [firstName, ...lastNameParts] = value.split(' ')
      setProfileData(prev => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || ''
      }))
    } else if (section === 'email') {
      setProfileData(prev => ({ ...prev, email: value }))
    } else if (section === 'phone') {
      setProfileData(prev => ({ ...prev, phone: value }))
    }
    setEditingSection(null)
  }

  const handleNotificationToggle = (type: string, checked: boolean) => {
    console.log(`Notification ${type} ${checked ? 'enabled' : 'disabled'}`)
    // In real implementation, this would save to backend
  }

  const handleDeleteAccount = () => {
    if (confirm('Kas olete kindel, et soovite oma konto kustutada? Seda toimingut ei saa tagasi võtta.')) {
      console.log('Account deletion requested')
      alert('Konto kustutamise taotlus on edastatud. Võtame teiega 24 tunni jooksul ühendust.')
    }
  }

  const handleSecurity = () => {
    alert('Turvalisuse seaded - demo funktsionaalsus tuleb peagi!')
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
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            M
          </div>
          <button 
            onClick={() => setShowProfilePictureModal(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {profileData.firstName}'i profiil 👤
          </h1>
          <p className="text-lg text-gray-600">
            Hallige oma kontaktandmeid ja seadeid
          </p>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-600">Profiil kinnitatud</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">🔔</div>
            <div className="text-sm text-gray-600">Teavitused sees</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">💳</div>
            <div className="text-sm text-gray-600">Makseviis lisatud</div>
          </div>
        </Container>
        <Container className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Kuud kliendiks</div>
          </div>
        </Container>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Isikuandmed</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <ProfileSection
            icon={<User className="h-5 w-5" />}
            title="Nimi"
            value={`${profileData.firstName} ${profileData.lastName}`}
            description="Teie täielik nimi"
            isEditing={editingSection === 'name'}
            onEdit={() => setEditingSection('name')}
            onSave={(value) => handleSaveProfileSection('name', value)}
            onCancel={() => setEditingSection(null)}
          />
          
          <ProfileSection
            icon={<Mail className="h-5 w-5" />}
            title="E-mail"
            value={profileData.email}
            description="Tellimuste ja teavituste e-mail"
            isEditing={editingSection === 'email'}
            onEdit={() => setEditingSection('email')}
            onSave={(value) => handleSaveProfileSection('email', value)}
            onCancel={() => setEditingSection(null)}
          />
          
          <ProfileSection
            icon={<Phone className="h-5 w-5" />}
            title="Telefon"
            value={profileData.phone}
            description="Tarnekurier võtab vajadusel ühendust"
            isEditing={editingSection === 'phone'}
            onEdit={() => setEditingSection('phone')}
            onSave={(value) => handleSaveProfileSection('phone', value)}
            onCancel={() => setEditingSection(null)}
          />
          
          <ProfileSection
            icon={<Shield className="h-5 w-5" />}
            title="Salasõna"
            value="••••••••"
            description="Viimati muudetud 2 kuud tagasi"
            isEditing={editingSection === 'password'}
            onEdit={() => setEditingSection('password')}
            onSave={(value) => {
              console.log('Password change requested')
              alert('Salasõna muutmine - demo funktsionaalsus!')
              setEditingSection(null)
            }}
            onCancel={() => setEditingSection(null)}
            hideValue
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Eelistused</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Container className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Teavitused</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    E-maili teavitused tellimuste kohta
                  </p>
                  
                  <div className="space-y-3 mt-4">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        onChange={(e) => handleNotificationToggle('order_confirmations', e.target.checked)}
                        className="rounded border-gray-300" 
                      />
                      <span className="text-sm text-gray-700">Tellimuse kinnitused</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        onChange={(e) => handleNotificationToggle('shipping_updates', e.target.checked)}
                        className="rounded border-gray-300" 
                      />
                      <span className="text-sm text-gray-700">Tarnesaatjad</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        onChange={(e) => handleNotificationToggle('subscription_reminders', e.target.checked)}
                        className="rounded border-gray-300" 
                      />
                      <span className="text-sm text-gray-700">Püsitellimuste meeldetuletused</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        onChange={(e) => handleNotificationToggle('marketing', e.target.checked)}
                        className="rounded border-gray-300" 
                      />
                      <span className="text-sm text-gray-700">Uued tooted ja pakkumised</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          <Container className="p-6">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Lemmiktooted</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kiire ligipääs teie lemmiktoodetele
                </p>
                
                <div className="space-y-3 mt-4">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.lastOrdered}</p>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setShowFavoriteModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Lisa lemmiktoode
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Konto toimingud</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <LocalizedClientLink 
            href="/account/billing"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Arveldus</div>
              <div className="text-xs text-gray-500">Makseviisid ja arved</div>
            </div>
          </LocalizedClientLink>
          
          <button 
            onClick={handleSecurity}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <Shield className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Turvalisus</div>
              <div className="text-xs text-gray-500">Kaheastmeline autentimine</div>
            </div>
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all"
          >
            <User className="h-5 w-5 text-red-600" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Kustuta konto</div>
              <div className="text-xs text-gray-500">Permanent action</div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <FavoriteProductModal
        isOpen={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        onSave={handleSaveFavoriteProduct}
      />

      <ProfilePictureModal
        isOpen={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        onSave={handleProfilePictureUpload}
      />
    </div>
  )
}

// Component: Profile Section - Updated to handle save functionality
const ProfileSection = ({ 
  icon, 
  title, 
  value, 
  description, 
  isEditing, 
  onEdit, 
  onSave,
  onCancel,
  hideValue = false
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string) => void
  onCancel: () => void
  hideValue?: boolean
}) => {
  const [tempValue, setTempValue] = useState(value)

  const handleSave = () => {
    onSave(tempValue)
  }

  return (
    <Container className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type={hideValue ? "password" : "text"}
              value={hideValue ? "" : tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={hideValue ? "Sisestage uus salasõna" : value}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Salvesta
              </button>
              <button
                onClick={() => {
                  setTempValue(value)
                  onCancel()
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Tühista
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-900 font-medium">
            {value}
          </div>
        )}
      </div>
    </Container>
  )
}

export default ProfileManagement 