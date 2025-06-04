"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { completeAccountSetup, requestNewSetupToken } from "@lib/data/customer"
import { AccountSetupData, Pet } from "../../../../types/customer"
import { Container } from "@medusajs/ui"
import { 
  User, 
  Lock, 
  PawPrint, 
  Plus, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Mail
} from "lucide-react"
import toast from "react-hot-toast"

// Zod schemas
const PetSchema = z.object({
  name: z.string().min(1, "Lemmiklooma nimi on kohustuslik"),
  type: z.string().min(1, "Lemmiklooma tüüp on kohustuslik"),
  breed: z.string().optional(),
  age: z.number().min(0).max(30).optional(),
  weight: z.number().min(0).max(200).optional(),
  notes: z.string().optional(),
})

const AccountSetupSchema = z.object({
  first_name: z.string().min(1, "Eesnimi on kohustuslik"),
  last_name: z.string().min(1, "Perekonnanimi on kohustuslik"),
  password: z.string().min(6, "Parool peab olema vähemalt 6 tähemärki"),
  confirmPassword: z.string(),
  pets: z.array(PetSchema).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Paroolid ei kattu",
  path: ["confirmPassword"],
})

type AccountSetupFormData = z.infer<typeof AccountSetupSchema>

const AccountSetup = () => {
  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'expired' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestingNewToken, setRequestingNewToken] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  const form = useForm<AccountSetupFormData>({
    resolver: zodResolver(AccountSetupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      pets: [],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pets"
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (!tokenParam || !emailParam) {
      setStep('error')
      return
    }

    setToken(tokenParam)
    setEmail(emailParam)
    setStep('form')
  }, [searchParams])

  const handleSubmit = async (data: AccountSetupFormData) => {
    setIsSubmitting(true)
    
    try {
      const setupData: AccountSetupData = {
        token,
        email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        pets: data.pets?.length ? data.pets : undefined,
      }

      await completeAccountSetup(setupData)
      setStep('success')
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/account')
      }, 3000)
      
    } catch (error: any) {
      if (error.response?.status === 410) {
        setStep('expired')
      } else {
        toast.error('Viga konto seadistamisel: ' + (error.message || 'Tundmatu viga'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestNewToken = async () => {
    setRequestingNewToken(true)
    
    try {
      await requestNewSetupToken(email)
      toast.success('Uus seadistamise link on saadetud teie e-posti aadressile!')
    } catch (error: any) {
      toast.error('Viga uue lingi saatmisel: ' + (error.message || 'Tundmatu viga'))
    } finally {
      setRequestingNewToken(false)
    }
  }

  const addPet = () => {
    append({
      name: '',
      type: '',
      breed: '',
      age: undefined,
      weight: undefined,
      notes: '',
    })
  }

  if (step === 'loading') {
    return <LoadingState />
  }

  if (step === 'error') {
    return <ErrorState />
  }

  if (step === 'expired') {
    return (
      <ExpiredTokenState 
        email={email}
        onRequestNew={handleRequestNewToken}
        isRequesting={requestingNewToken}
      />
    )
  }

  if (step === 'success') {
    return <SuccessState />
  }

  return (
    <Container className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tere tulemast Kraps perekonda!
        </h1>
        <p className="text-gray-600">
          Lõpetage oma konto seadistamine ja lisage oma lemmikloomade andmed
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Seadistamine: <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Isikuandmed</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eesnimi *
              </label>
              <input
                {...form.register('first_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teie eesnimi"
              />
              {form.formState.errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perekonnanimi *
              </label>
              <input
                {...form.register('last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teie perekonnanimi"
              />
              {form.formState.errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Setup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Parooli seadistamine</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parool *
              </label>
              <input
                type="password"
                {...form.register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Vähemalt 6 tähemärki"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinnita parool *
              </label>
              <input
                type="password"
                {...form.register('confirmPassword')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Korrake parooli"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pet Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Lemmikloomad (valikuline)</h3>
            </div>
            <button
              type="button"
              onClick={addPet}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Lisa lemmikloom
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Lisage oma lemmikloomade andmed, et saada personaalseid soovitusi ja paremaid teenuseid.
          </p>

          {fields.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-gray-600 mb-4">Lemmikloomad pole veel lisatud</p>
              <button
                type="button"
                onClick={addPet}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                Lisa esimene lemmikloom
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Lemmikloom #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nimi *
                      </label>
                      <input
                        {...form.register(`pets.${index}.name`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="nt. Buddy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tüüp *
                      </label>
                      <select
                        {...form.register(`pets.${index}.type`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Valige tüüp</option>
                        <option value="dog">Koer 🐕</option>
                        <option value="cat">Kass 🐱</option>
                        <option value="bird">Lind 🐦</option>
                        <option value="rabbit">Küülik 🐰</option>
                        <option value="fish">Kala 🐠</option>
                        <option value="hamster">Hamster 🐹</option>
                        <option value="guinea_pig">Merisiga</option>
                        <option value="other">Muu</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tõug
                      </label>
                      <input
                        {...form.register(`pets.${index}.breed`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="nt. Labrador"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vanus (aastat)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        {...form.register(`pets.${index}.age`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="nt. 3"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Märkused
                    </label>
                    <textarea
                      {...form.register(`pets.${index}.notes`)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Lisainfo lemmiklooma kohta..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Seadistamine...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Lõpeta konto seadistamine
              </>
            )}
          </button>
        </div>
      </form>
    </Container>
  )
}

// Loading State
const LoadingState = () => (
  <Container className="bg-white rounded-lg shadow-lg p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p className="text-gray-600">Laadime seadistamise lehte...</p>
  </Container>
)

// Error State
const ErrorState = () => (
  <Container className="bg-white rounded-lg shadow-lg p-8 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Vigane seadistamise link
    </h3>
    <p className="text-gray-600">
      Seadistamise link on vigane või puudub. Palun kontrollige linki või võtke meiega ühendust.
    </p>
  </Container>
)

// Expired Token State
const ExpiredTokenState = ({ 
  email, 
  onRequestNew, 
  isRequesting 
}: { 
  email: string
  onRequestNew: () => void
  isRequesting: boolean
}) => (
  <Container className="bg-white rounded-lg shadow-lg p-8 text-center">
    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Seadistamise link on aegunud
    </h3>
    <p className="text-gray-600 mb-6">
      Teie seadistamise link on aegunud. Saadame teile uue lingi e-posti aadressile{' '}
      <span className="font-medium">{email}</span>
    </p>
    <button
      onClick={onRequestNew}
      disabled={isRequesting}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
    >
      {isRequesting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Saadame...
        </>
      ) : (
        <>
          <Mail className="h-5 w-5" />
          Saada uus link
        </>
      )}
    </button>
  </Container>
)

// Success State
const SuccessState = () => (
  <Container className="bg-white rounded-lg shadow-lg p-8 text-center">
    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Konto on edukalt seadistatud!
    </h3>
    <p className="text-gray-600 mb-4">
      Tere tulemast Kraps perekonda! Suuname teid oma kontole...
    </p>
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
  </Container>
)

export default AccountSetup 