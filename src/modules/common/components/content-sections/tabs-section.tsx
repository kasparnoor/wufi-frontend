"use client"

import { useState } from "react"
import { TabsData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface TabsSectionProps {
  data: TabsData
}

const TabsSection = ({ data }: TabsSectionProps) => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {data.tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  activeTab === index
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                aria-current={activeTab === index ? "page" : undefined}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`tabpanel-${index}`}
                id={`tab-${index}`}
              >
                {tab.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="relative">
          {data.tabs.map((tab, index) => (
            <div
              key={index}
              className={cn(
                "transition-opacity duration-300",
                activeTab === index ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
              )}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`tab-${index}`}
              id={`tabpanel-${index}`}
            >
              <div className="prose prose-lg max-w-none text-gray-700">
                {tab.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TabsSection 