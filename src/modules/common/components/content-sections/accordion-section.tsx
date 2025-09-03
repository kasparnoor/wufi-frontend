"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { AccordionData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface AccordionSectionProps {
  data: AccordionData
}

const AccordionSection = ({ data }: AccordionSectionProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      if (data.allow_multiple) {
        newExpanded.add(index)
      } else {
        newExpanded.clear()
        newExpanded.add(index)
      }
    }
    setExpandedItems(newExpanded)
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="mt-4 text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Accordion Items */}
        <div className="space-y-4">
          {data.items.map((item, index) => {
            const isExpanded = expandedItems.has(index)
            
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={cn(
                    "w-full px-6 py-4 text-left transition-colors",
                    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                    "flex items-center justify-between"
                  )}
                  aria-expanded={isExpanded}
                  aria-controls={`accordion-content-${index}`}
                >
                  <span className="text-lg font-medium text-gray-900">
                    {item.title}
                  </span>
                  
                  {data.style === 'arrow' ? (
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  ) : (
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>

                {/* Content Panel */}
                <div
                  id={`accordion-content-${index}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AccordionSection 