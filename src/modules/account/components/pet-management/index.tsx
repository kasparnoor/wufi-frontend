"use client"

import { useState } from "react"
import { Container } from "@medusajs/ui"
import { 
  Heart, 
  Plus, 
  Edit3, 
  Trash2,
  Calendar,
  Info,
  Settings,
  Package,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { LocalizedClientLink } from "@lib/components"
import { Pet } from "../../../../types/customer"

interface PetManagementProps {
  customer: any
}

interface PetData extends Pet {
  id: string
  weight?: number
  birth_date?: string
  dietary_restrictions?: string[]
  active_subscriptions?: number
  last_order?: string
}

const PetManagement = ({ customer }: PetManagementProps) => {
  const [editingPet, setEditingPet] = useState<string | null>(null)

  // Mock pet data to demonstrate the approach
  const mockPets: PetData[] = [
    {
      id: 'pet_1',
      name: 'Max',
      type: 'dog',
      breed: 'Labrador',
      age: 3,
      weight: 32,
      birth_date: '2021-03-15',
      food_type: 'Premium Adult Dog Food',
      dietary_restrictions: ['Teraviljad', 'Kana'],
      active_subscriptions: 1,
      last_order: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      next_order: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'pet_2',
      name: 'Luna', 
      type: 'cat',
      breed: 'Briti lühikarvane',
      age: 2,
      weight: 4.5,
      birth_date: '2022-06-20',
      food_type: 'Premium Indoor Cat Food',
      dietary_restrictions: [],
      active_subscriptions: 0,
      last_order: undefined,
      next_order: undefined
    }
  ]

  const pets = mockPets
  const activePets = pets.filter(pet => pet.active_subscriptions && pet.active_subscriptions > 0)
  const inactivePets = pets.filter(pet => !pet.active_subscriptions || pet.active_subscriptions === 0)

  return (
    <div className="space-y-6">
      {/* Demo Notice - Clean Style */}
      <CleanDemoNotice />

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Minu lemmikloomad 🐾
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Hallake oma lemmikloomade andmeid ja tellimusi
          </p>
        </div>
        <MobilePrimaryButton onClick={() => setEditingPet('new')}>
          <Plus className="h-4 w-4" />
          Lisa lemmikloom
        </MobilePrimaryButton>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <CleanSectionTitle>Ülevaade</CleanSectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MobileStatCard 
            value={pets.length}
            label="Lemmiklooma kokku"
          />
          <MobileStatCard 
            value={activePets.length}
            label="Aktiivset tellimust"
            color="green"
          />
          <MobileStatCard 
            value={inactivePets.length}
            label="Tellimust vajab"
            color="orange"
          />
        </div>
      </div>

      {/* Active Pets with Subscriptions */}
      {activePets.length > 0 && (
        <div className="space-y-4">
          <CleanSectionTitle>Lemmikloomad aktiivse tellimusega</CleanSectionTitle>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {activePets.map((pet) => (
              <MobilePetCard 
                key={pet.id} 
                pet={pet} 
                isEditing={editingPet === pet.id}
                onEdit={() => setEditingPet(pet.id)}
                onSave={() => setEditingPet(null)}
                onCancel={() => setEditingPet(null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Pets */}
      {inactivePets.length > 0 && (
        <div className="space-y-4">
          <CleanSectionTitle>Lemmikloomad ilma tellimuseta</CleanSectionTitle>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {inactivePets.map((pet) => (
              <MobilePetCard 
                key={pet.id} 
                pet={pet} 
                isEditing={editingPet === pet.id}
                onEdit={() => setEditingPet(pet.id)}
                onSave={() => setEditingPet(null)}
                onCancel={() => setEditingPet(null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <CleanSectionTitle>Kiired toimingud</CleanSectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MobileQuickActionTile 
            icon={<Plus className="h-5 w-5" />}
            title="Lisa lemmikloom"
            description="Uus profiil"
            onClick={() => setEditingPet('new')}
          />
          <MobileQuickActionTile 
            icon={<Package className="h-5 w-5" />}
            title="Alusta tellimust"
            description="Vali tooted"
            href="/products"
          />
          <MobileQuickActionTile 
            icon={<RefreshCw className="h-5 w-5" />}
            title="Sünkroniseeri andmed"
            description="Uuenda kaalud"
          />
          <MobileQuickActionTile 
            icon={<Calendar className="h-5 w-5" />}
            title="Plaani kontroll"
            description="Veterinaar"
          />
        </div>
      </div>

      {/* Empty State */}
      {pets.length === 0 && (
        <MobileEmptyPetsState onAddPet={() => setEditingPet('new')} />
      )}

      {/* Pet Form Modal - Mobile optimized */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingPet === 'new' ? 'Lisa uus lemmikloom' : 'Muuda lemmiklooma andmeid'}
            </h3>
            <p className="text-gray-600 mb-4">
              Demo versioonis täielik vorm pole kättesaadav
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <MobileSecondaryButton onClick={() => setEditingPet(null)}>
                Loobu
              </MobileSecondaryButton>
              <MobilePrimaryButton onClick={() => setEditingPet(null)}>
                Salvesta
              </MobilePrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Standardized Clean Components (No Gray Backgrounds)

const CleanDemoNotice = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center gap-2">
      <Info className="h-5 w-5 text-blue-600" />
      <span className="text-blue-800 text-sm">
        <strong>Demo:</strong> Näidisandmed kuni süsteem valmis saab
      </span>
    </div>
  </div>
)

const CleanCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
)

const CleanSectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>
)

const MobilePrimaryButton = ({ href, children, onClick }: { 
  href?: string
  children: React.ReactNode
  onClick?: () => void 
}) => {
  const buttonClasses = "w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  
  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <button className={buttonClasses}>
          {children}
        </button>
      </LocalizedClientLink>
    )
  }
  
  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  )
}

const MobileSecondaryButton = ({ href, children, onClick }: { 
  href?: string
  children: React.ReactNode
  onClick?: () => void 
}) => {
  const buttonClasses = "w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  
  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <button className={buttonClasses}>
          {children}
        </button>
      </LocalizedClientLink>
    )
  }
  
  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  )
}

const MobileWarningButton = ({ children, onClick }: { 
  children: React.ReactNode
  onClick?: () => void 
}) => (
  <button 
    onClick={onClick}
    className="w-full sm:w-auto px-4 py-3 border border-red-300 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 touch-manipulation"
  >
    {children}
  </button>
)

// Mobile-optimized stat card
const MobileStatCard = ({ value, label, color = 'gray' }: { 
  value: string | number
  label: string
  color?: 'gray' | 'green' | 'orange'
}) => {
  const colorClasses: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    orange: 'text-orange-600',
  }

  return (
    <CleanCard>
      <div className="text-center">
        <div className={`text-xl sm:text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
        <div className="text-xs sm:text-sm text-gray-600">{label}</div>
      </div>
    </CleanCard>
  )
}

// Mobile Pet Card Component - Responsive design
const MobilePetCard = ({ 
  pet, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: { 
  pet: PetData
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}) => {
  const petEmoji = pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : '🐾'
  const hasActiveSubscription = pet.active_subscriptions && pet.active_subscriptions > 0
  
  return (
    <CleanCard className="hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Pet Header - Mobile optimized */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl">{petEmoji}</div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{pet.name}</h3>
              <p className="text-gray-600">{pet.breed} • {pet.age} aastat</p>
              {pet.weight && (
                <p className="text-sm text-gray-500">{pet.weight} kg</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveSubscription ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700">Aktiivne tellimus</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium text-orange-700">Tellimus puudub</span>
              </>
            )}
          </div>
        </div>

        {/* Pet Details - Mobile optimized */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-gray-600">Toit:</span>
              <p className="font-medium">{pet.food_type || 'Pole määratud'}</p>
            </div>
            {pet.birth_date && (
              <div>
                <span className="text-gray-600">Sünniaeg:</span>
                <p className="font-medium">{format(new Date(pet.birth_date), 'dd.MM.yyyy')}</p>
              </div>
            )}
          </div>
          
          {pet.dietary_restrictions && pet.dietary_restrictions.length > 0 && (
            <div>
              <span className="text-gray-600 text-sm">Toidupiirangud:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {pet.dietary_restrictions.map((restriction, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subscription Status - Mobile optimized */}
        {hasActiveSubscription && pet.next_order && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div>
                <p className="font-medium text-gray-900">Järgmine tellimus</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(pet.next_order), 'dd. MMMM yyyy')}
                </p>
              </div>
              <LocalizedClientLink href="/account/subscriptions">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium touch-manipulation">
                  Halda →
                </button>
              </LocalizedClientLink>
            </div>
          </div>
        )}

        {/* Actions - Mobile optimized */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
          <MobileSecondaryButton onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
            Muuda andmeid
          </MobileSecondaryButton>
          
          {!hasActiveSubscription && (
            <MobilePrimaryButton href="/products">
              <Package className="h-4 w-4" />
              Alusta tellimust
            </MobilePrimaryButton>
          )}
          
          <MobileWarningButton>
            <Trash2 className="h-4 w-4" />
            Eemalda
          </MobileWarningButton>
        </div>
      </div>
    </CleanCard>
  )
}

// Mobile Quick Action Tile Component - Responsive
const MobileQuickActionTile = ({ 
  icon, 
  title, 
  description,
  href,
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  onClick?: () => void
}) => {
  const content = (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <LocalizedClientLink href={href}>
        <CleanCard className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation">
          {content}
        </CleanCard>
      </LocalizedClientLink>
    )
  }

  return (
    <div onClick={onClick}>
      <CleanCard className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation">
        {content}
      </CleanCard>
    </div>
  )
}

// Mobile Empty Pets State
const MobileEmptyPetsState = ({ onAddPet }: { onAddPet: () => void }) => {
  return (
    <CleanCard>
      <div className="text-center py-8 sm:py-12">
        <div className="text-4xl sm:text-6xl mb-4">🐾</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Lisage oma esimene lemmikloom
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto px-4">
          Alustage oma lemmiklooma profiili loomisega ja määrake sobiv toit ning tellimuste sagedus
        </p>
        <MobilePrimaryButton onClick={onAddPet}>
          <Plus className="h-4 w-4" />
          Lisa lemmikloom
        </MobilePrimaryButton>
      </div>
    </CleanCard>
  )
}

export default PetManagement 