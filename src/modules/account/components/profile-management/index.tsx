"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import { Container } from "@medusajs/ui"
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit3, 
  CheckCircle,
  Info
} from "lucide-react"
import { KrapsButton } from "@lib/components"
import ProfilePassword from "../profile-password"
import { useUpdateCustomerProfile } from "@lib/hooks/use-customer-dashboard"

interface ProfileManagementProps {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const ProfileManagement = ({ customer, regions }: ProfileManagementProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showPasswordEditor, setShowPasswordEditor] = useState<boolean>(false)
  const updateProfile = useUpdateCustomerProfile()

  const handleSaveProfileSection = async (section: string, value: string) => {
    const payload: any = {}
    if (section === 'Eesnimi' || section === 'first_name') payload.first_name = value
    if (section === 'Perekonnanimi' || section === 'last_name') payload.last_name = value
    if (section === 'Telefon' || section === 'phone') payload.phone = value
    try {
      await updateProfile.mutateAsync(payload)
      setEditingSection(null)
    } catch {}
  }

  const handleChangePassword = () => {
    setShowPasswordEditor(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 border border-yellow-200/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2">
          Profiili haldus
        </h1>
        <p className="text-yellow-800">
          Hallake oma isikuandmeid ja konto seadeid
        </p>
      </div>

      {/* Basic Profile Information */}
      <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-yellow-900 text-2xl font-bold shadow-sm">
              {customer?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-yellow-900">
                {customer?.first_name} {customer?.last_name}
              </h3>
              <p className="text-yellow-700">{customer?.email}</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* First Name */}
            <ProfileSection
              icon={<User className="h-5 w-5" />}
              title="Eesnimi"
              value={customer?.first_name || 'Määramata'}
              description="Teie eesnimi, mida kasutame suhtluses"
              isEditing={editingSection === 'first_name'}
              onEdit={() => setEditingSection('first_name')}
              onSave={(value) => handleSaveProfileSection('first_name', value)}
              onCancel={() => setEditingSection(null)}
            />

            {/* Last Name */}
            <ProfileSection
              icon={<User className="h-5 w-5" />}
              title="Perekonnanimi"
              value={customer?.last_name || 'Määramata'}
              description="Teie perekonnanimi"
              isEditing={editingSection === 'last_name'}
              onEdit={() => setEditingSection('last_name')}
              onSave={(value) => handleSaveProfileSection('last_name', value)}
              onCancel={() => setEditingSection(null)}
            />

            {/* Email (read-only, change requires verification) */}
            <ProfileSection
              icon={<Mail className="h-5 w-5" />}
              title="E-posti aadress"
              value={customer?.email || 'Määramata'}
              description="E-posti muutmiseks pöörduge klienditoe poole (turvakaalutlustel nõuab kinnitamist)"
              isEditing={false}
              editable={false}
              onEdit={() => {}}
              onSave={() => {}}
              onCancel={() => {}}
            />

            {/* Phone */}
            <ProfileSection
              icon={<Phone className="h-5 w-5" />}
              title="Telefoni number"
              value={customer?.phone || 'Määramata'}
              description="Teie telefoni number tarnega seotud küsimuste jaoks"
              isEditing={editingSection === 'phone'}
              onEdit={() => setEditingSection('phone')}
              onSave={(value) => handleSaveProfileSection('phone', value)}
              onCancel={() => setEditingSection(null)}
              fieldKey="phone"
              autosave
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Turvalisus
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <h4 className="font-medium text-yellow-900">Parool</h4>
              <p className="text-sm text-yellow-700">Muutke oma konto parooli</p>
            </div>
            <KrapsButton
              variant="secondary"
              size="small"
              onClick={handleChangePassword}
              className="bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400 text-yellow-800 hover:text-yellow-900"
            >
              Muuda parooli
            </KrapsButton>
          </div>

          {showPasswordEditor && (
            <div className="p-4 bg-white border border-yellow-200 rounded-lg">
              <ProfilePassword customer={customer} />
            </div>
          )}
        </div>
      </div>

      {/* Basic Notifications */}
      <div className="bg-white rounded-lg border border-yellow-200 p-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Teavitused
        </h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-yellow-800 text-sm">
              <strong>Tellimuste teavitused:</strong> Saate e-postile teavitusi tellimuste kohta
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component: Profile Section
// Validation helpers
const isValidName = (val: string) => {
  const trimmed = val.trim()
  if (trimmed.length < 2 || trimmed.length > 50) return false
  return /^[A-Za-zÀ-žÄÖÕÜäöõü\-\s']+$/.test(trimmed)
}

const normalizeEstonianPhone = (input: string) => {
  const digits = input.replace(/[^0-9+]/g, '')
  if (digits.startsWith('+372')) return `+372${digits.slice(4).replace(/[^0-9]/g, '')}`
  if (digits.startsWith('372')) return `+372${digits.slice(3).replace(/[^0-9]/g, '')}`
  if (digits.startsWith('0')) return `+372${digits.slice(1).replace(/[^0-9]/g, '')}`
  if (digits.startsWith('+')) return digits // other country codes as-is
  if (/^[0-9]+$/.test(digits) && digits.length >= 7) return `+372${digits}`
  return digits
}

const isValidEstonianPhone = (val: string) => {
  const normalized = normalizeEstonianPhone(val)
  // Accept E.164 +372 followed by 7-9 digits (landline/mobile ranges vary; we allow 7-9 to be permissive)
  return /^\+372[0-9]{7,9}$/.test(normalized)
}

const ProfileSection = ({ 
  icon, 
  title, 
  value, 
  description, 
  isEditing, 
  onEdit, 
  onSave,
  onCancel,
  fieldKey,
  autosave = false,
  editable = true,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string) => void
  onCancel: () => void
  fieldKey?: 'first_name' | 'last_name' | 'phone' | 'email'
  autosave?: boolean
  editable?: boolean
}) => {
  const [editValue, setEditValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const savingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const validate = (val: string): boolean => {
    if (fieldKey === 'first_name' || fieldKey === 'last_name') {
      if (!isValidName(val)) {
        setError('Palun sisestage kehtiv nimi (2–50 märki)')
        return false
      }
      setError(null)
      return true
    }
    if (fieldKey === 'phone') {
      if (val.trim() === '') {
        // Optional phone – allow empty, clears number
        setError(null)
        return true
      }
      if (!isValidEstonianPhone(val)) {
        setError('Sisestage korrektne telefon (+372XXXXXXXX)')
        return false
      }
      setError(null)
      return true
    }
    setError(null)
    return true
  }

  const triggerSave = async (val: string) => {
    if (savingRef.current) return
    if (!validate(val)) return
    if (val === value) return
    try {
      savingRef.current = true
      setSaved(false)
      let toSave = val
      if (fieldKey === 'phone') {
        toSave = normalizeEstonianPhone(val)
        setEditValue(toSave)
      }
      await onSave(toSave)
      setSaved(true)
    } finally {
      savingRef.current = false
    }
  }

  const handleChange = (nextVal: string) => {
    setEditValue(nextVal)
    setSaved(false)
    // inline validation feedback while typing
    validate(nextVal)
    if (autosave) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        triggerSave(nextVal)
      }, 800)
    }
  }

  const handleBlur = () => {
    if (autosave) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      triggerSave(editValue)
    }
  }

  const handleSave = () => {
    triggerSave(editValue)
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-yellow-200 rounded-lg hover:border-yellow-300 transition-colors">
      <div className="text-yellow-600 mt-1">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-yellow-900">{title}</h4>
          {!isEditing && editable && (
            <button
              onClick={onEdit}
              className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isEditing && editable ? (
          <div className="space-y-3">
            <input
              type={fieldKey === 'phone' ? 'tel' : 'text'}
              value={editValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={fieldKey === 'phone' ? '+372XXXXXXXX' : ''}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${error ? 'border-red-400' : 'border-yellow-300 focus:border-yellow-400'}`}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div className="flex items-center gap-3">
              <KrapsButton variant="primary" size="small" onClick={handleSave} disabled={!!error}>
                Salvesta
              </KrapsButton>
              <KrapsButton 
                variant="secondary" 
                size="small" 
                onClick={onCancel}
                className="bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400 text-yellow-800 hover:text-yellow-900"
              >
                Tühista
              </KrapsButton>
              {saved && (
                <span className="text-green-700 text-sm">Salvestatud</span>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-yellow-800 font-medium mb-1">{value}</p>
            <p className="text-sm text-yellow-700">{description}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileManagement 