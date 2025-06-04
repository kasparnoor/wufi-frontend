import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import { LocalizedClientLink } from "@lib/components"
import ReactMarkdown from "react-markdown"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 md:gap-y-6">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm md:text-base text-ui-fg-muted hover:text-ui-fg-subtle transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-xl md:text-2xl lg:text-3xl leading-tight md:leading-relaxed font-bold text-gray-900"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none text-gray-600">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-3 md:mb-4 leading-relaxed text-sm md:text-base">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 md:mb-4 list-disc pl-4 space-y-1.5 md:space-y-2 text-sm md:text-base">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 md:mb-4 list-decimal pl-4 space-y-1.5 md:space-y-2 text-sm md:text-base">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h3: ({ children }) => <h3 className="text-base md:text-lg font-semibold text-gray-800 mt-4 md:mt-6 mb-2 md:mb-3">{children}</h3>,
              h4: ({ children }) => <h4 className="text-sm md:text-base font-semibold text-gray-800 mt-3 md:mt-4 mb-2">{children}</h4>,
              strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
            }}
          >
            {product.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
