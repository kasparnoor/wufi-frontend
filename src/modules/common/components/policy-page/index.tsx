"use client"

import PageTemplate from "@modules/common/components/page-template"
import { AnimatedSection } from "@modules/common/components/animated-section"
import { PolicyPage } from "types/policy"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Shield, FileText, Cookie, Scale, ShoppingBag, Info } from "lucide-react"

interface PolicyPageProps {
  page: PolicyPage
}

const getIconForType = (type: PolicyPage['type']) => {
  switch (type) {
    case 'privacy_policy':
      return Shield
    case 'terms_of_service':
      return Scale
    case 'cookie_policy':
      return Cookie
    case 'refund_policy':
      return ShoppingBag
    case 'shipping_policy':
      return ShoppingBag
    default:
      return Info
  }
}

const getGradientForType = (type: PolicyPage['type']) => {
  switch (type) {
    case 'privacy_policy':
      return "from-blue-400/20 via-indigo-300/20 to-purple-400/20"
    case 'terms_of_service':
      return "from-purple-400/20 via-pink-300/20 to-red-400/20"
    case 'cookie_policy':
      return "from-yellow-400/20 via-orange-300/20 to-red-400/20"
    case 'refund_policy':
      return "from-green-400/20 via-emerald-300/20 to-teal-400/20"
    case 'shipping_policy':
      return "from-teal-400/20 via-cyan-300/20 to-blue-400/20"
    default:
      return "from-gray-400/20 via-slate-300/20 to-zinc-400/20"
  }
}

const getBadgeForType = (type: PolicyPage['type']) => {
  switch (type) {
    case 'privacy_policy':
      return "Andmekaitse"
    case 'terms_of_service':
      return "Õiguslik teave"
    case 'cookie_policy':
      return "Küpsised"
    case 'refund_policy':
      return "Tagastamine"
    case 'shipping_policy':
      return "Saatmine"
    default:
      return "Info"
  }
}

const PolicyPageComponent = ({ page }: PolicyPageProps) => {
  const Icon = getIconForType(page.type)
  
  return (
    <PageTemplate
      title={page.title}
      subtitle={page.seo_description || `${page.title} - Kraps lemmikloomade toidupood`}
      badge={getBadgeForType(page.type)}
      breadcrumb={{
        href: "/",
        label: "Tagasi avalehele"
      }}
      hero={{
        backgroundGradient: getGradientForType(page.type)
      }}
    >
      <AnimatedSection variant="default" className="content-container">
        <div className="max-w-4xl mx-auto">
          {/* Header Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>Viimati uuendatud:</strong> {new Date(page.updated_at).toLocaleDateString('et-EE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for different elements
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-300 pl-6 italic mb-6 bg-blue-50 py-4 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    {children}
                  </td>
                ),
                tr: ({ children, ...props }) => (
                  <tr className="even:bg-gray-50" {...props}>
                    {children}
                  </tr>
                ),
                code: ({ children, className }) => {
                  const isInline = !className
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-6">
                      {children}
                    </code>
                  )
                },
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>
        </div>
      </AnimatedSection>
    </PageTemplate>
  )
}

export default PolicyPageComponent 