"use client"

import { useEffect, useMemo, useState } from "react"
import { 
  X, 
  Calendar, 
  MapPin, 
  Package, 
  Clock, 
  Pause, 
  SkipForward, 
  XCircle,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Building2,
  User,
  Truck,
  Package2,
  RefreshCw
} from "lucide-react"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import { et } from "date-fns/locale"

import { KrapsButton, ModernInput as Input } from "@lib/components"
import { useCustomerPets } from "@lib/hooks/use-customer-dashboard"
import { loadLocations, getLocationDisplayName, Location } from "@lib/util/locations"

interface SubscriptionData {
  id: string
  pet_id: string
  product_name: string
  quantity: number
  interval: string
  next_delivery: string
  price: number
  status: string
}

interface PetData {
  id: string
  name: string
  type: string
  breed?: string
}

interface DeliveryData {
  method: 'pakiautomaat' | 'kuller'
  customer_type: 'personal' | 'business'
  pakiautomaat_location?: string
  address?: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    city: string
    postal_code: string
    country: string
    phone: string
  }
  billing?: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    city: string
    postal_code: string
    country: string
    phone: string
  }
  courier_instructions?: string
}

interface OrderManagementModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: SubscriptionData
  pet: PetData
  onUpdate: (action: string, data: any) => Promise<void>
}

// Pakiautomaat locations are loaded the same way as checkout

const OrderManagementModal = ({ 
  isOpen, 
  onClose, 
  subscription, 
  pet, 
  onUpdate 
}: OrderManagementModalProps) => {
  const [activeTab, setActiveTab] = useState<'modify' | 'pause' | 'cancel'>('modify')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  
  // Form states
  const [newDate, setNewDate] = useState(subscription.next_delivery.split('T')[0])
  const [newQuantity, setNewQuantity] = useState(subscription.quantity)
  const [newInterval, setNewInterval] = useState(subscription.interval)
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    method: 'pakiautomaat',
    customer_type: 'personal',
    address: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      city: '',
      postal_code: '',
      country: 'Estonia',
      phone: ''
    },
    billing: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      city: '',
      postal_code: '',
      country: 'Estonia',
      phone: ''
    },
    courier_instructions: ''
  })
  const [pauseDuration, setPauseDuration] = useState('2_weeks')
  const [cancelReason, setCancelReason] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const { data: petsData } = useCustomerPets()
  const pets = (petsData?.pets as any[]) || []
  const petOptions = useMemo(() => pets.map(p => ({ value: p.id || p.name, label: p.name })), [pets])

  const intervals = [
    { value: 'weekly', label: 'Iga nädal', days: 7 },
    { value: 'biweekly', label: 'Iga 2 nädalat', days: 14 },
    { value: 'monthly', label: 'Iga kuu', days: 30 }
  ]

  const pauseOptions = [
    { value: '1_week', label: '1 nädal' },
    { value: '2_weeks', label: '2 nädalat' },
    { value: '3_weeks', label: '3 nädalat' },
    { value: '4_weeks', label: '4 nädalat' },
    { value: '1_month', label: '1 kuu' },
    { value: '2_months', label: '2 kuud' },
    { value: '3_months', label: '3 kuud' }
  ]

  const cancelReasons = [
    'Lemmikloom ei söö toodet',
    'Liiga kallis',
    'Leidsime parema alternatiivi',
    'Lemmikloom suri',
    'Ajutiselt ei vaja',
    'Muu põhjus'
  ]

  // Calculate order total for delivery logic
  const orderTotal = subscription.price * newQuantity
  // Load pakiautomaat locations the same way checkout does
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLocLoading(true)
        const list = await loadLocations()
        if (mounted) setLocations(list)
      } catch (e: any) {
        if (mounted) setLocError(e?.message || 'Asukohtade laadimine ebaõnnestus')
      } finally {
        if (mounted) setLocLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])


  // Determine requirements
  const requiresShippingAddress = () => deliveryData.method === 'kuller'
  const requiresBillingAddress = () => deliveryData.customer_type === 'business' || orderTotal > 160

  const calculateNextDelivery = (interval: string, fromDate: string = newDate) => {
    const date = new Date(fromDate)
    const intervalData = intervals.find(i => i.value === interval)
    if (!intervalData) return date
    
    return addDays(date, intervalData.days)
  }

  const calculateSkipDate = () => {
    const currentDate = new Date(subscription.next_delivery)
    const intervalData = intervals.find(i => i.value === subscription.interval)
    return addDays(currentDate, intervalData?.days || 14)
  }

  const handleSave = async (action: string, data: any) => {
    setLoading(true)
    try {
      await onUpdate(action, data)
      onClose()
    } catch (error) {
      console.error('Error updating subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAction = (action: string) => {
    setShowConfirmation(action)
  }

  const executeAction = async () => {
    if (!showConfirmation) return

    const actionData: any = {}

    switch (showConfirmation) {
      case 'modify':
        actionData.date = newDate
        actionData.quantity = newQuantity
        actionData.interval = newInterval
        actionData.delivery = deliveryData
        break
      case 'skip':
        actionData.skip_date = calculateSkipDate().toISOString()
        break
      case 'pause':
        actionData.pause_duration = pauseDuration
        break
      case 'cancel':
        actionData.reason = cancelReason
        break
    }

    await handleSave(showConfirmation, actionData)
    setShowConfirmation(null)
  }

  const handleDeliveryDataChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '')
      setDeliveryData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }))
      return
    }
    if (field.startsWith('billing.')) {
      const billingField = field.replace('billing.', '')
      setDeliveryData(prev => ({
        ...prev,
        billing: {
          ...prev.billing!,
          [billingField]: value
        }
      }))
      return
    }
    setDeliveryData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 border-b border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-yellow-900">Muuda tellimust</h2>
              <p className="text-yellow-700 mt-1">
                {pet.name} • {subscription.product_name}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Järgmine tarne: {format(new Date(subscription.next_delivery), 'dd. MMMM yyyy', { locale: et })}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-yellow-600 hover:text-yellow-800 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'modify', label: 'Muuda', icon: <Package className="h-4 w-4" /> },
              { id: 'pause', label: 'Peata/Jäta vahele', icon: <Pause className="h-4 w-4" /> },
              { id: 'cancel', label: 'Tühista', icon: <XCircle className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'modify' && (
            <div className="space-y-6">
              {/* Pet association */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <User className="h-4 w-4" /> Seosta lemmikloomaga
                </label>
                <select
                  value={subscription.pet_id || ''}
                  onChange={(e) => setDeliveryData((d) => ({ ...d, /* stash chosen pet in deliveryData for now */ }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="">Vali lemmikloom…</option>
                  {petOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Kasutatakse personaliseeritud soovituste ja arvelduse märkustena.</p>
              </div>
              {/* Change Date */}
              <div>
                <label htmlFor="delivery-date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="h-4 w-4" />
                  Muuda järgmist tarnekuupäeva
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Järgmine automaatne tarne: {format(calculateNextDelivery(newInterval, newDate), 'dd. MMMM yyyy', { locale: et })}
                </p>
              </div>

              {/* Change Quantity */}
              <div>
                <label htmlFor="quantity-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Package className="h-4 w-4" />
                  Muuda kogust
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span id="quantity-input" className="text-lg font-medium min-w-[3rem] text-center">{newQuantity}</span>
                  <button
                    onClick={() => setNewQuantity(newQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500 ml-2">
                    €{(subscription.price * newQuantity).toFixed(2)} / tarne
                  </span>
                </div>
              </div>

              {/* Change Interval */}
              <div>
                <label htmlFor="interval-select" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <RefreshCw className="h-4 w-4" />
                  Muuda sagedust
                </label>
                <select
                  id="interval-select"
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  {intervals.map(interval => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Settings */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <MapPin className="h-4 w-4" />
                  Tarneviis ja aadress
                </div>

                {/* Customer Type */}
                <div className="mb-4">
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Tellija tüüp
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="customer_type"
                        value="personal"
                        checked={deliveryData.customer_type === 'personal'}
                        onChange={(e) => handleDeliveryDataChange('customer_type', e.target.value)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Eraisik</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="customer_type"
                        value="business"
                        checked={deliveryData.customer_type === 'business'}
                        onChange={(e) => handleDeliveryDataChange('customer_type', e.target.value)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Ettevõte</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="mb-4">
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Tarneviis
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="pakiautomaat"
                        checked={deliveryData.method === 'pakiautomaat'}
                        onChange={(e) => handleDeliveryDataChange('method', e.target.value)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <Package2 className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Pakiautomaat</div>
                        <div className="text-sm text-gray-600">Mugav viis kättesaamiseks. Üle 160€ puhul on arveldusaadress nõutav.</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="kuller"
                        checked={deliveryData.method === 'kuller'}
                        onChange={(e) => handleDeliveryDataChange('method', e.target.value)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <Truck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Kulleriga</div>
                        <div className="text-sm text-gray-600">Otse ukseni. Aadress on kohustuslik.</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pakiautomaat Location Selection */}
                {deliveryData.method === 'pakiautomaat' && (
                  <div className="mb-4">
                    <label htmlFor="pakiautomaat-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Vali pakiautomaat
                    </label>
                    <select
                      id="pakiautomaat-select"
                      value={deliveryData.pakiautomaat_location || ''}
                      onChange={(e) => handleDeliveryDataChange('pakiautomaat_location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    >
                      <option value="">{locLoading ? 'Laen asukohti…' : 'Vali pakiautomaat…'}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {getLocationDisplayName(location)} — {location.address}
                        </option>
                      ))}
                    </select>
                    {locError && (
                      <p className="text-xs text-red-600 mt-1">{locError}</p>
                    )}
                  </div>
                )}

                {/* Address Requirements Info */}
                {(requiresShippingAddress() || requiresBillingAddress()) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        {requiresBillingAddress() && "Üle 160€ või ärikliendi korral on ARVELDUSaadress kohustuslik (KMS nõue)."}
                        {requiresShippingAddress() && "Kulleriga tarnimiseks on tarneaadress kohustuslik."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address - only for courier */}
                {requiresShippingAddress() && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Tarneaadress</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Eesnimi"
                        name="first_name"
                        value={deliveryData.address?.first_name || ''}
                        onChange={(e) => handleDeliveryDataChange('address.first_name', e.target.value)}
                        required
                      />
                      <Input
                        label="Perekonnanimi"
                        name="last_name"
                        value={deliveryData.address?.last_name || ''}
                        onChange={(e) => handleDeliveryDataChange('address.last_name', e.target.value)}
                        required
                      />
                    </div>

                    {deliveryData.customer_type === 'business' && (
                      <Input
                        label="Ettevõte"
                        name="company"
                        value={deliveryData.address?.company || ''}
                        onChange={(e) => handleDeliveryDataChange('address.company', e.target.value)}
                        required
                      />
                    )}

                    <Input
                      label="Aadress"
                      name="address_1"
                      value={deliveryData.address?.address_1 || ''}
                      onChange={(e) => handleDeliveryDataChange('address.address_1', e.target.value)}
                      required
                      placeholder="Tänav ja maja number"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Postiindeks"
                        name="postal_code"
                        value={deliveryData.address?.postal_code || ''}
                        onChange={(e) => handleDeliveryDataChange('address.postal_code', e.target.value)}
                        required
                      />
                      <Input
                        label="Linn"
                        name="city"
                        value={deliveryData.address?.city || ''}
                        onChange={(e) => handleDeliveryDataChange('address.city', e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label="Telefon"
                      name="phone"
                      value={deliveryData.address?.phone || ''}
                      onChange={(e) => handleDeliveryDataChange('address.phone', e.target.value)}
                      required
                      placeholder="+372..."
                    />

                    {deliveryData.method === 'kuller' && (
                      <div>
                        <label htmlFor="courier-instructions" className="block text-sm font-medium text-gray-700 mb-2">
                          Juhised kullerile (valikuline)
                        </label>
                        <textarea
                          id="courier-instructions"
                          value={deliveryData.courier_instructions || ''}
                          onChange={(e) => handleDeliveryDataChange('courier_instructions', e.target.value)}
                          placeholder="Korterinumber, sissepääsu kood, asukoha täpsustus..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                          rows={3}
                          maxLength={500}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Billing Address - for >160€ or business */}
                {requiresBillingAddress() && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-4">
                    <h4 className="font-medium text-gray-900">Arveldusaadress</h4>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Eesnimi"
                        name="billing_first_name"
                        value={deliveryData.billing?.first_name || ''}
                        onChange={(e) => handleDeliveryDataChange('billing.first_name', e.target.value)}
                        required
                      />
                      <Input
                        label="Perekonnanimi"
                        name="billing_last_name"
                        value={deliveryData.billing?.last_name || ''}
                        onChange={(e) => handleDeliveryDataChange('billing.last_name', e.target.value)}
                        required
                      />
                    </div>

                    {deliveryData.customer_type === 'business' && (
                      <Input
                        label="Ettevõte"
                        name="billing_company"
                        value={deliveryData.billing?.company || ''}
                        onChange={(e) => handleDeliveryDataChange('billing.company', e.target.value)}
                        required
                      />
                    )}

                    <Input
                      label="Aadress"
                      name="billing_address_1"
                      value={deliveryData.billing?.address_1 || ''}
                      onChange={(e) => handleDeliveryDataChange('billing.address_1', e.target.value)}
                      required
                      placeholder="Tänav ja maja number"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Postiindeks"
                        name="billing_postal_code"
                        value={deliveryData.billing?.postal_code || ''}
                        onChange={(e) => handleDeliveryDataChange('billing.postal_code', e.target.value)}
                        required
                      />
                      <Input
                        label="Linn"
                        name="billing_city"
                        value={deliveryData.billing?.city || ''}
                        onChange={(e) => handleDeliveryDataChange('billing.city', e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label="Telefon"
                      name="billing_phone"
                      value={deliveryData.billing?.phone || ''}
                      onChange={(e) => handleDeliveryDataChange('billing.phone', e.target.value)}
                      required
                      placeholder="+372..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pause' && (
            <div className="space-y-6">
              {/* Skip Next Delivery */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SkipForward className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Jäta järgmine tarne vahele</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Järgmine tarne lükatakse edasi: {format(calculateSkipDate(), 'dd. MMMM yyyy', { locale: et })}
                </p>
                <KrapsButton 
                  variant="secondary" 
                  onClick={() => handleConfirmAction('skip')}
                  className="w-full"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Jäta vahele
                </KrapsButton>
              </div>

              {/* Pause Subscription */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pause className="h-5 w-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Peata püsitellimus</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Kui kauaks soovite peatada?
                  </div>
                  {pauseOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="pause_duration"
                        value={option.value}
                        checked={pauseDuration === option.value}
                        onChange={(e) => setPauseDuration(e.target.value)}
                        className="text-yellow-600 focus:ring-yellow-400"
                      />
                      <span className="text-sm text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
                <KrapsButton 
                  variant="secondary" 
                  onClick={() => handleConfirmAction('pause')}
                  className="w-full"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Peata tellimus
                </KrapsButton>
              </div>
            </div>
          )}

          {activeTab === 'cancel' && (
            <div className="space-y-6">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <X className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium text-red-900">Tühista püsitellimus</h3>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Püsitellimuse tühistamine on lõplik. Seda ei saa tagasi võtta.
                </p>
                
                <div className="space-y-3 mb-4">
                  <label htmlFor="cancel-reason" className="block text-sm font-medium text-red-800 mb-2">
                    Tühistamise põhjus *
                  </label>
                  <select
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    required
                  >
                    <option value="">Vali põhjus...</option>
                    {cancelReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <KrapsButton 
                  variant="secondary" 
                  onClick={() => handleConfirmAction('cancel')}
                  disabled={!cancelReason}
                  className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Tühista püsitellimus
                </KrapsButton>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <KrapsButton variant="secondary" onClick={onClose}>
              Loobu
            </KrapsButton>
            {activeTab === 'modify' && (
              <KrapsButton 
                variant="primary" 
                onClick={async () => {
                  try {
                    // If pet association changed, update subscription metadata first
                    if (selectedPetId !== subscription.pet_id) {
                      await updateSubPet.mutateAsync({
                        subscriptionId: subscription.id,
                        petId: selectedPetId,
                        petName: pets.find(p => (p.id || p.name) === selectedPetId)?.name
                      })
                    }
                    handleConfirmAction('modify')
                  } catch (e) {
                    console.error(e)
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Salvestamine...' : 'Salvesta muudatused'}
              </KrapsButton>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kinnita muudatus
              </h3>
              <p className="text-gray-600 mb-6">
                {showConfirmation === 'modify' && 'Kas olete kindel, et soovite tellimust muuta?'}
                {showConfirmation === 'skip' && 'Kas olete kindel, et soovite järgmise tarne vahele jätta?'}
                {showConfirmation === 'pause' && 'Kas olete kindel, et soovite tellimuse peatada?'}
                {showConfirmation === 'cancel' && 'Kas olete kindel, et soovite tellimuse tühistada?'}
              </p>
              <div className="flex gap-3">
                <KrapsButton 
                  variant="secondary" 
                  onClick={() => setShowConfirmation(null)}
                  className="flex-1"
                >
                  Loobu
                </KrapsButton>
                <KrapsButton 
                  variant="primary" 
                  onClick={executeAction}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Töötleb...' : 'Kinnita'}
                </KrapsButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagementModal 