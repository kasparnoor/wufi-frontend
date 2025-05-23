import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ReactMarkdown from "react-markdown"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-6">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-relaxed font-bold text-gray-900"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <div className="prose prose-lg max-w-none text-gray-600">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 list-disc pl-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 list-decimal pl-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
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
