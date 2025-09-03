import { MarkdownData } from "../../../../types/content-page"
import { AnimatedSection } from "../animated-section"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownSectionProps {
  data: MarkdownData
}

const getMaxWidthClass = (width: MarkdownData['max_width']) => {
  switch (width) {
    case 'sm': return 'max-w-2xl'
    case 'md': return 'max-w-4xl'
    case 'lg': return 'max-w-6xl'
    case 'xl': return 'max-w-7xl'
    case 'full': return 'max-w-none'
    default: return 'max-w-4xl'
  }
}

const getTextAlignClass = (align: MarkdownData['text_align']) => {
  switch (align) {
    case 'left': return 'text-left'
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return 'text-left'
  }
}

const MarkdownSection = ({ data }: MarkdownSectionProps) => {
  const maxWidthClass = getMaxWidthClass(data.max_width)
  const textAlignClass = getTextAlignClass(data.text_align)

  return (
    <AnimatedSection variant="default" className="content-container">
      <div className={`${maxWidthClass} mx-auto ${textAlignClass}`}>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
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
                  className="text-yellow-600 hover:text-yellow-800 underline font-medium"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-yellow-300 pl-6 italic mb-6 bg-yellow-50 py-4 rounded-r-lg">
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
            }}
          >
            {data.content}
          </ReactMarkdown>
        </div>
      </div>
    </AnimatedSection>
  )
}

export default MarkdownSection 