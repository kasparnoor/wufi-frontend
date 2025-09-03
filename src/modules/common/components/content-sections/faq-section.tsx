"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { FaqData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface FaqSectionProps {
  data: FaqData
}

const FaqSection = ({ data }: FaqSectionProps) => {
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set())

  const toggleQuestion = (index: number) => {
    const newOpenQuestions = new Set(openQuestions)
    if (newOpenQuestions.has(index)) {
      newOpenQuestions.delete(index)
    } else {
      newOpenQuestions.add(index)
    }
    setOpenQuestions(newOpenQuestions)
  }

  const getLayoutClass = () => {
    return data.layout === '2-column' 
      ? 'grid md:grid-cols-2 gap-6' 
      : 'max-w-3xl mx-auto'
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {data.title}
          </h2>
          {data.description && (
            <p className="mt-4 text-lg text-gray-600">
              {data.description}
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className={getLayoutClass()}>
          {data.questions.map((faq, index) => {
            const isOpen = openQuestions.has(index)
            
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden mb-4"
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className={cn(
                    "w-full px-6 py-4 text-left transition-colors",
                    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                    "flex items-center justify-between"
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Answer Panel */}
                <div
                  id={`faq-answer-${index}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions? 
            <a href="/contact" className="text-blue-600 hover:text-blue-800 ml-1">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default FaqSection 