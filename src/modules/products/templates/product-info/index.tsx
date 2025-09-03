import { HttpTypes } from "@medusajs/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      
      {/* Main Product Description */}
      {product.description && (
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-yellow-600 hover:text-yellow-800 underline"
                  target={href && href.startsWith("http") ? "_blank" : undefined}
                  rel={href && href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              ),
              // Clean paragraph styling
              p: ({ children }) => (
                <p className="mb-4 text-gray-700 leading-relaxed text-base">
                  {children}
                </p>
              ),
              
              // Simple unordered lists with clean bullets
              ul: ({ children }) => (
                <ul className="mb-6 space-y-2">
                  {children}
                </ul>
              ),
              
              // Simple ordered lists
              ol: ({ children }) => (
                <ol className="mb-6 list-decimal list-inside space-y-2">
                  {children}
                </ol>
              ),
              
              // Clean list items with simple styling
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed flex items-start">
                  <span className="mr-2 text-yellow-500 font-medium">•</span>
                  <span>{children}</span>
                </li>
              ),
              
              // Clean heading styles
              h1: ({ children }) => (
                <h1 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  {children}
                </h1>
              ),
              
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  {children}
                </h2>
              ),
              
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                  {children}
                </h3>
              ),
              
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-gray-900 mb-2 mt-4">
                  {children}
                </h4>
              ),
              
              // Simple emphasis
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              
              em: ({ children }) => (
                <em className="italic text-gray-700">
                  {children}
                </em>
              ),
              
              // Clean blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-600 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {product.description}
          </ReactMarkdown>
        </div>
      )}

      {/* Key Product Details */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Toote üksikasjad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.weight && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Kaal:</span>
              <span className="font-medium text-gray-900">
                {product.weight > 1000 ? `${(product.weight / 1000).toFixed(1)} kg` : `${product.weight} g`}
              </span>
            </div>
          )}
          
          {product.origin_country && product.origin_country !== 'Unknown' && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Päritolumaa:</span>
              <span className="font-medium text-gray-900">{product.origin_country}</span>
            </div>
          )}
          
          {product.material && product.material !== 'Unknown' && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Materjal:</span>
              <span className="font-medium text-gray-900">{product.material}</span>
            </div>
          )}
          
          {product.type && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tüüp:</span>
              <span className="font-medium text-gray-900">{product.type.value}</span>
            </div>
          )}
          
          {product.length && product.width && product.height && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Mõõtmed:</span>
              <span className="font-medium text-gray-900">
                {product.length} × {product.width} × {product.height} cm
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
