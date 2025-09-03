import React from "react"
import { HelpCircle, ArrowRight } from "lucide-react"

import { LocalizedClientLink, KrapsButton } from "@lib/components"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  // If no customer (i.e., login/register form), render without the account layout wrapper
  if (!customer) {
    return <>{children}</>
  }

  // For logged-in customers, render the full account layout
  return (
    <div className="flex-1 small:py-12 small:pt-12 bg-yellow-50/30" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-yellow-200/50 flex flex-col">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] gap-x-8 py-6 small:py-12 px-6 small:px-8">
          <div><AccountNav customer={customer} /></div>
          <div className="flex-1">{children}</div>
        </div>
        
        {/* Improved Customer Service Section with Kraps Brand Colors */}
        <div className="border-t border-yellow-200 mt-8 mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/60 rounded-lg p-6 small:p-8 mx-4 small:mx-8 mt-8 mb-6 border border-yellow-200/50">
            <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <HelpCircle className="h-6 w-6 text-yellow-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">
                    Küsimused? Oleme siin, et aidata!
                  </h3>
                  <p className="text-yellow-800 max-w-md">
                    Leidke vastused korduma kippuvatele küsimustele või võtke meiega otse ühendust.
                  </p>
                </div>
              </div>
              
              <LocalizedClientLink href="/klienditugi">
                <KrapsButton 
                  variant="secondary" 
                  size="medium"
                  className="bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400 text-yellow-800 hover:text-yellow-900 shadow-sm hover:shadow-md group"
                >
                  Klienditugi
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </KrapsButton>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
