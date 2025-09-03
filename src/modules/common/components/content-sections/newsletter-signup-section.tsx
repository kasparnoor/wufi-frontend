"use client"

import { useState } from "react"
import { Mail, Check } from "lucide-react"
import { NewsletterData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface NewsletterSignupSectionProps {
  data: NewsletterData
}

const NewsletterSignupSection = ({ data }: NewsletterSignupSectionProps) => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Here you would integrate with your newsletter service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
      setEmail("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 p-8 rounded-lg">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Thank you for subscribing!
            </h3>
            <p className="text-green-600">
              You&apos;ll receive a confirmation email shortly.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div 
          className={cn(
            "rounded-lg p-8",
            data.background_color === 'blue' ? "bg-blue-50" :
            data.background_color === 'gray' ? "bg-gray-50" :
            "bg-white border border-gray-200"
          )}
        >
          <div className="text-center mb-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600">
              {data.description}
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "placeholder-gray-400"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm",
                  "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  "transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </form>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a> apply.
          </p>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSignupSection 