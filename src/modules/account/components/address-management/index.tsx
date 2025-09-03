"use client"

import { useState } from "react"
import { KrapsButton } from "../../../../lib/components"
import { Plus } from "lucide-react"

interface KrapsCardProps {
  children: React.ReactNode
  className?: string
}

const KrapsCard = ({ children, className = "" }: KrapsCardProps) => (
  <div className={`bg-white rounded-lg border border-yellow-200/50 p-6 shadow-sm ${className}`}>
    {children}
  </div>
)

const AddressManagement = () => {
  const [addresses, setAddresses] = useState<any[]>([])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-xl font-bold">Aadressid</h2>
        <p className="text-gray-700">
          Halda oma aadresse siin. Saad lisada uusi aadresse ja muuta olemasolevaid.
        </p>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <KrapsCard>
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-gray-400 text-lg mb-4">
                Sul pole veel ühtegi aadressi lisatud
              </span>
              <KrapsButton variant="secondary" size="small">
                <Plus className="w-4 h-4 mr-2" />
                Lisa aadress
              </KrapsButton>
            </div>
          </KrapsCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Address cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressManagement 