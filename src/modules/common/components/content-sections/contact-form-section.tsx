"use client"

import { useState } from "react"
import { Send, Check, User, Mail, MessageSquare } from "lucide-react"
import { ContactFormData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface ContactFormSectionProps {
  data: ContactFormData
}

const ContactFormSection = ({ data }: ContactFormSectionProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Here you would integrate with your contact form service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
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
              Message Sent Successfully!
            </h3>
            <p className="text-green-600">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {data.subtitle}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  )}
                  placeholder="What is this about?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "resize-vertical"
                  )}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm",
                    "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    "transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactFormSection 