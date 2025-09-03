"use client"

import { useState, useCallback, useMemo } from "react"
import { useCustomerPets, useUpdateCustomerPets, useDeleteCustomerPets } from "@lib/hooks/use-customer-dashboard"
import { Heart, Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react"
import { KrapsButton } from "../../../../lib/components"
import breeds from './pet-breeds.json'
import { SearchableSelect } from "../../../../lib/components"

interface Pet {
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other'
  breed?: string
  age_years?: number
  age_months?: number
  age_total_months?: number
  weight?: number
  notes?: string
}

interface PetManagementProps {
  customer: any
}

const PetManagement = ({ customer }: PetManagementProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingPets, setEditingPets] = useState<Pet[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: petsData, isLoading, error } = useCustomerPets()
  const updatePets = useUpdateCustomerPets()
  const deletePets = useDeleteCustomerPets()

  const pets = petsData?.pets || []

  // Memoized helper functions for better performance
  const petEmojis = useMemo(() => ({
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    fish: '🐠',
    other: '🐾'
  }), [])

  const petTypeTexts = useMemo(() => ({
    dog: 'Koer',
    cat: 'Kass',
    bird: 'Lind',
    rabbit: 'Küülik',
    fish: 'Kala',
    other: 'Muu'
  }), [])

  const handleStartEditing = useCallback(() => {
    setEditingPets([...pets])
    setIsEditing(true)
  }, [pets])

  const handleCancelEditing = useCallback(() => {
    setEditingPets([])
    setIsEditing(false)
    setShowAddForm(false)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      // compute canonical total months before saving and ensure name/type present
      const normalized = editingPets.map(p => {
        const years = typeof p.age_years === 'number' ? Math.max(0, p.age_years) : 0
        const months = typeof p.age_months === 'number' ? Math.max(0, Math.min(11, p.age_months)) : 0
        return { ...p, age_total_months: years * 12 + months }
      })
      await updatePets.mutateAsync({ pets: normalized })
      setIsEditing(false)
      setShowAddForm(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }, [editingPets, updatePets])

  const handleDeleteAllPets = useCallback(async () => {
    if (window.confirm('Kas olete kindel, et soovite kõik lemmikloomad eemaldada?')) {
      try {
        await deletePets.mutateAsync()
        setIsEditing(false)
        setEditingPets([])
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }, [deletePets])

  const handleAddPet = useCallback(() => {
    const newPet: Pet = {
      name: '',
      type: 'dog',
      breed: '',
      age_years: 0,
      age_months: 0,
      weight: 0,
      notes: ''
    }
    setEditingPets(prev => [...prev, newPet])
    setShowAddForm(true)
  }, [])

  const handleRemovePet = useCallback((index: number) => {
    setEditingPets(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handlePetChange = useCallback((index: number, field: keyof Pet, value: any) => {
    setEditingPets(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const isFormValid = useMemo(() => {
    return editingPets.every(pet => pet.name.trim())
  }, [editingPets])

  const getPetEmoji = useCallback((type: string) => {
    return petEmojis[type as keyof typeof petEmojis] || '🐾'
  }, [petEmojis])

  const getPetTypeText = useCallback((type: string) => {
    return petTypeTexts[type as keyof typeof petTypeTexts] || 'Muu'
  }, [petTypeTexts])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-yellow-100 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
          <span className="ml-2 text-yellow-800">Lemmikloomade andmete laadimine...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-yellow-100 p-6">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Andmete laadimine ebaõnnestus
          </h3>
          <p className="text-gray-600 mb-4">
            Lemmikloomade andmeid ei õnnestunud laadida
          </p>
          <KrapsButton onClick={() => window.location.reload()}>
            Proovi uuesti
          </KrapsButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 border border-yellow-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <Heart className="h-7 w-7" />
              Minu lemmikloomad
            </h1>
            <p className="text-yellow-800">
              Hallige oma lemmikloomade andmeid, et saaksime pakkuda personaliseeritud toite.
            </p>
          </div>
          {!isEditing && pets.length > 0 && (
            <div className="flex gap-2">
              <KrapsButton variant="secondary" onClick={handleStartEditing}>
                <Edit2 className="h-4 w-4 mr-2" />
                Muuda
              </KrapsButton>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-yellow-100 p-6">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-yellow-900">
                Lemmikloomade andmete muutmine
              </h2>
              <div className="flex gap-2">
                <KrapsButton 
                  variant="secondary" 
                  size="small" 
                  onClick={handleCancelEditing}
                  disabled={updatePets.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Tühista
                </KrapsButton>
                <KrapsButton 
                  size="small" 
                  onClick={handleSave}
                  disabled={updatePets.isPending || !isFormValid}
                >
                  {updatePets.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Salvesta
                </KrapsButton>
              </div>
            </div>

            {/* Pet Edit Forms */}
            <div className="space-y-4">
              {editingPets.map((pet, index) => {
                const petId = `pet-${index}`
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {pet.name || `Lemmikloom ${index + 1}`}
                      </h3>
                      <button
                        onClick={() => handleRemovePet(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eemalda lemmikloom"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label htmlFor={`${petId}-name`} className="block text-sm font-medium text-gray-700 mb-1">
                          Nimi *
                        </label>
                        <input
                          id={`${petId}-name`}
                          type="text"
                          value={pet.name}
                          onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Lemmiklooma nimi"
                          required
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label htmlFor={`${petId}-type`} className="block text-sm font-medium text-gray-700 mb-1">
                          Liik *
                        </label>
                        <select
                          id={`${petId}-type`}
                          value={pet.type}
                          onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="dog">Koer</option>
                          <option value="cat">Kass</option>
                          <option value="bird">Lind</option>
                          <option value="rabbit">Küülik</option>
                          <option value="fish">Kala</option>
                          <option value="other">Muu</option>
                        </select>
                      </div>

                      {/* Breed/Species */}
                      <div>
                        <label htmlFor={`${petId}-breed`} className="block text-sm font-medium text-gray-700 mb-1">
                          {(pet.type === 'bird' || pet.type === 'fish') ? 'Liik' : 'Tõug'}
                        </label>
                        {(() => {
                          const map: Record<string, string[]> = {
                            dog: breeds['koeratõud'] || [],
                            cat: breeds['kassitõud'] || [],
                            bird: breeds['linnuliigid'] || [],
                            fish: breeds['kalaliigid'] || [],
                            rabbit: breeds['küülikutõud'] || [],
                          }
                          const base = map[pet.type] || []
                          const dedupedBase = Array.from(new Set(base))
                          const options = dedupedBase.map((b) => ({ value: b, label: b }))
                          // Ensure the generic mixed is first and selected by default if none chosen
                          const mixed = pet.type === 'dog' ? 'Segavereline koer'
                            : pet.type === 'cat' ? 'Segavereline kass'
                            : pet.type === 'bird' ? 'Segavereline lind'
                            : pet.type === 'fish' ? 'Segavereline kala'
                            : pet.type === 'rabbit' ? 'Segavereline küülik'
                            : 'Muu'
                          const withMixed = [{ value: mixed, label: mixed }, ...options.filter(o => o.label !== mixed)]
                          return (
                            <SearchableSelect
                              options={withMixed}
                              value={pet.breed || mixed}
                              onChange={(v) => handlePetChange(index, 'breed', v)}
                              placeholder={(pet.type === 'bird' || pet.type === 'fish') ? 'Vali liik…' : 'Vali tõug…'}
                              searchPlaceholder={(pet.type === 'bird' || pet.type === 'fish') ? 'Otsi liiki…' : 'Otsi tõugu…'}
                            />
                          )
                        })()}
                      </div>

                      {/* Age */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor={`${petId}-age-years`} className="block text-sm font-medium text-gray-700 mb-1">
                            Vanus (aastat)
                          </label>
                          <input
                            id={`${petId}-age-years`}
                            type="number"
                            value={pet.age_years ?? ''}
                            onChange={(e) => handlePetChange(index, 'age_years', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="0"
                            min="0"
                            max="30"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${petId}-age-months`} className="block text-sm font-medium text-gray-700 mb-1">
                            Vanus (kuud)
                          </label>
                          <input
                            id={`${petId}-age-months`}
                            type="number"
                            value={pet.age_months ?? ''}
                            onChange={(e) => handlePetChange(index, 'age_months', Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="0"
                            min="0"
                            max="11"
                          />
                        </div>
                      </div>

                      {/* Weight */}
                      <div>
                        <label htmlFor={`${petId}-weight`} className="block text-sm font-medium text-gray-700 mb-1">
                          Kaal (kg)
                        </label>
                        <input
                          id={`${petId}-weight`}
                          type="number"
                          value={pet.weight || ''}
                          onChange={(e) => handlePetChange(index, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="0.0"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label htmlFor={`${petId}-notes`} className="block text-sm font-medium text-gray-700 mb-1">
                          Märkused
                        </label>
                        <textarea
                          id={`${petId}-notes`}
                          value={pet.notes || ''}
                          onChange={(e) => handlePetChange(index, 'notes', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Täiendavad märkused lemmiklooma kohta..."
                          rows={3}
                          maxLength={500}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Pet Button */}
              <button
                onClick={handleAddPet}
                type="button"
                className="w-full p-4 border-2 border-dashed border-yellow-300 rounded-lg text-yellow-600 hover:text-yellow-800 hover:border-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Lisa lemmikloom
              </button>
            </div>

            {/* Delete All Pets */}
            {pets.length > 0 && (
              <div className="border-t pt-4">
                <KrapsButton
                  variant="secondary"
                  size="small"
                  onClick={handleDeleteAllPets}
                  disabled={deletePets.isPending}
                  className="text-red-600 hover:text-red-800"
                >
                  {deletePets.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Eemalda kõik lemmikloomad
                </KrapsButton>
              </div>
            )}
          </div>
        ) : (
          // View Mode
          <div>
            {pets.length === 0 ? (
              // No Pets State
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lemmikloomad puuduvad
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Lisage oma lemmikloomade andmed, et saaksime pakkuda neile sobivamat toitu ja teenust.
                </p>
                <KrapsButton onClick={handleStartEditing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Lisa esimene lemmikloom
                </KrapsButton>
              </div>
            ) : (
              // Pets List
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-yellow-900">
                    Teie lemmikloomad ({pets.length})
                  </h2>
                  <KrapsButton size="small" onClick={handleStartEditing}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Muuda
                  </KrapsButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet: Pet, index: number) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">
                          {getPetEmoji(pet.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-yellow-900 text-lg">
                            {pet.name}
                          </h3>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p>
                              <span className="font-medium">Liik:</span> {getPetTypeText(pet.type)}
                            </p>
                            {pet.breed && (
                              <p>
                                <span className="font-medium">Tõug:</span> {pet.breed}
                              </p>
                            )}
                            {(() => {
                                const total = typeof pet.age_total_months === 'number' ? pet.age_total_months : (pet.age_years || 0) * 12 + (pet.age_months || 0)
                                if (!total) return null
                                const yrs = Math.floor(total / 12)
                                const mos = total % 12
                                return (
                                  <p>
                                    <span className="font-medium">Vanus:</span> {yrs} {yrs === 1 ? 'aasta' : 'aastat'} {mos ? `ja ${mos} kuud` : ''}
                                  </p>
                                )
                              })()}
                            {pet.weight && (
                              <p>
                                <span className="font-medium">Kaal:</span> {pet.weight} kg
                              </p>
                            )}
                            {pet.notes && (
                              <p>
                                <span className="font-medium">Märkused:</span> {pet.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PetManagement 