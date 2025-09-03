"use client"

import React, { useState, useRef, useEffect } from "react"
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { subscribeToNewsletter, NewsletterSubscriptionRequest } from "@lib/data/newsletter"
import { cn } from "@lib/utils"
import { toast } from "sonner"
import { trackLead } from "@lib/util/meta-pixel"

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface NewsletterFormProps {
  variant?: "default" | "footer" | "homepage" | "checkout"
  source: "homepage" | "footer" | "checkout"
  className?: string
  showNameField?: boolean
  defaultEmail?: string
  defaultName?: string
  tags?: string[]
  placeholder?: string
  buttonText?: string
  onSuccess?: () => void
}

export function NewsletterForm({
  variant = "default",
  source,
  className,
  showNameField = false,
  defaultEmail = "",
  defaultName = "",
  tags = [],
  placeholder = "sinu@email.ee",
  buttonText = "Liitu",
  onSuccess
}: NewsletterFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null) // To store the reCAPTCHA widget ID
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && recaptchaRef.current) {
        window.grecaptcha.ready(() => {
          // Only render if it hasn't been rendered yet for this instance
          if (widgetIdRef.current === null) {
            const widgetId = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
              size: "invisible",
              callback: (token: string) => {
                // This callback is not directly used for invisible reCAPTCHA
                // The token is obtained via grecaptcha.execute()
              },
              "error-callback": () => {
                setError("reCAPTCHA laadimine ebaõnnestus. Palun proovige lehte uuesti laadida.")
                setRecaptchaReady(false)
              },
              "expired-callback": () => {
                setError("reCAPTCHA aegus. Palun proovige uuesti.")
              }
            })
            widgetIdRef.current = widgetId // Store the widget ID
            setRecaptchaReady(true)
          }
        })
      }
    }

    // Check if grecaptcha is already loaded, otherwise wait for it
    if (window.grecaptcha) {
      loadRecaptcha()
    } else {
      const interval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(interval)
          loadRecaptcha()
        }
      }, 100) // Check every 100ms
    }

    // Cleanup function: reset reCAPTCHA when component unmounts
    return () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current)
        widgetIdRef.current = null // Clear the widget ID
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Palun sisestage e-posti aadress")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Palun sisestage kehtiv e-posti aadress")
      return
    }

    if (!recaptchaReady) {
      setError("reCAPTCHA ei ole veel laetud. Palun oodake hetk ja proovige uuesti.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const recaptchaToken = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'newsletter_subscribe' });

      const subscriptionData: NewsletterSubscriptionRequest = {
        email_address: email.trim(),
        metadata: {
          source,
          ...(name.trim() && { name: name.trim() }),
          recaptchaToken, // Add reCAPTCHA token here
        },
        tags: [...tags, source === "checkout" ? "customer" : "prospect"]
      }

      const result = await subscribeToNewsletter(subscriptionData)
      
      setIsSuccess(true)
      
      // Track newsletter signup as a Lead event
      trackLead()
      
      toast(result.message, { 
        icon: <CheckCircle className="h-4 w-4" />
      })
      
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        setEmail("")
        setName("")
        setIsSuccess(false)
        window.grecaptcha.reset(); // Reset reCAPTCHA after successful submission
      }, 3000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Midagi läks valesti. Palun proovige uuesti."
      setError(errorMessage)
      toast(errorMessage, { 
        icon: <AlertCircle className="h-4 w-4" />
      })
      if (window.grecaptcha) {
        window.grecaptcha.reset(); // Reset reCAPTCHA on error
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "footer":
        return {
          container: "flex flex-col sm:flex-row items-center gap-2",
          input: "px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all",
          button: "px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        }
      case "homepage":
        return {
          container: "space-y-4",
          input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all",
          button: "w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
        }
      case "checkout":
        return {
          container: "space-y-3",
          input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm",
          button: "w-full px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md text-sm font-medium transition-colors"
        }
      default:
        return {
          container: "space-y-3",
          input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400",
          button: "w-full px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
        }
    }
  }

  const styles = getVariantStyles()

  if (isSuccess && variant !== "checkout") {
    return (
      <div className={cn("text-center space-y-2", className)}>
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
        <p className={cn(
          "text-sm font-medium",
          variant === "footer" ? "text-white" : "text-green-600"
        )}>
          Täname! Kontrollige oma e-posti.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn(styles.container, className)}>
      {showNameField && (
        <input
          type="text"
          placeholder="Teie nimi (valikuline)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          disabled={isLoading}
        />
      )}
      
      <div className="flex-1 w-full">
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          className={cn(
            styles.input,
            error && "border-red-400 focus:border-red-400 focus:ring-red-400"
          )}
          disabled={isLoading}
          required
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || isSuccess || !recaptchaReady}
        className={cn(
          styles.button,
          (isLoading || !recaptchaReady) && "opacity-50 cursor-not-allowed",
          isSuccess && "bg-green-500 hover:bg-green-500"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Liitub...</span>
          </div>
        ) : isSuccess ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Liitunud!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{buttonText}</span>
          </div>
        )}
      </button>
      <div ref={recaptchaRef} className="g-recaptcha" data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}></div>
      <style jsx global>{`
        .grecaptcha-badge { visibility: hidden; }
      `}</style>
    </form>
  )
}  