"use client"

import { useState } from "react"
import { NewsletterForm } from "@lib/components/newsletter/newsletter-form"
import { Mail, Gift } from "lucide-react"
import { Checkbox } from "@lib/components"
import { HttpTypes } from "@medusajs/types"

interface NewsletterOptInProps {
  customer?: HttpTypes.StoreCustomer | null
  className?: string
}

export default function NewsletterOptIn({ customer, className }: NewsletterOptInProps) {
  const [optIn, setOptIn] = useState(false)

  if (!optIn) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-yellow-50/50 ${className}`}>
        <div className="flex items-start space-x-3">
          <Checkbox
            id="newsletter-opt-in"
            checked={optIn}
            onCheckedChange={(checked) => setOptIn(checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <label 
              htmlFor="newsletter-opt-in" 
              className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
            >
              <Mail className="h-4 w-4 text-yellow-600" />
              Liituge meie uudiskirjaga
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Saage teada uutest toodetest, eksklusiivsetest pakkumistest ja lemmikloomade hoolduse nippidest.
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Gift className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                Järgmisele ostule -10% soodustus
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-yellow-300 rounded-lg p-4 bg-yellow-50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-4 w-4 text-yellow-600" />
        <span className="text-sm font-medium text-gray-900">Uudiskirjaga liitumine</span>
      </div>
      
      <NewsletterForm
        variant="checkout"
        source="checkout"
        defaultEmail={customer?.email || ""}
        defaultName={
          customer?.first_name && customer?.last_name 
            ? `${customer.first_name} ${customer.last_name}`
            : ""
        }
        tags={["customer", "checkout-subscriber"]}
        buttonText="Liitu uudiskirjaga"
        onSuccess={() => {
          // Keep the form visible in checkout but show success state
        }}
      />
      <p className="text-xs text-gray-500 mt-2">
        See leht on kaitstud reCAPTCHA-ga ja kehtivad Google'i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">privaatsuspoliitika</a> ja <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">teenusetingimused</a>.
      </p>
      <button
        onClick={() => setOptIn(false)}
        className="text-xs text-gray-500 hover:text-gray-700 mt-2 underline"
      >
        Tühista
      </button>
    </div>
  )
} 