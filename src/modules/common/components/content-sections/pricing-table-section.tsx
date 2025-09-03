"use client"

import { Check, X } from "lucide-react"
import { PricingTableData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface PricingTableSectionProps {
  data: PricingTableData
}

const PricingTableSection = ({ data }: PricingTableSectionProps) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
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

        {/* Pricing Cards */}
        <div className={cn(
          "grid gap-8",
          data.plans.length === 2 ? "md:grid-cols-2" : 
          data.plans.length === 3 ? "md:grid-cols-3" : 
          "md:grid-cols-2 lg:grid-cols-4"
        )}>
          {data.plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-white rounded-lg shadow-lg overflow-hidden",
                plan.featured && "ring-2 ring-blue-500 scale-105"
              )}
            >
              {/* Featured Badge */}
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="mt-2 text-gray-600">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      €{plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 ml-2">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {plan.original_price && (
                    <div className="mt-1">
                      <span className="text-gray-500 line-through">
                        €{plan.original_price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <span 
                        className={cn(
                          "text-sm",
                          feature.included ? "text-gray-900" : "text-gray-500"
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="text-center">
                  <a
                    href={plan.cta_url}
                    className={cn(
                      "w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-colors duration-200",
                      plan.featured
                        ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2"
                    )}
                  >
                    {plan.cta_text}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        {data.additional_info && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              {data.additional_info}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default PricingTableSection 