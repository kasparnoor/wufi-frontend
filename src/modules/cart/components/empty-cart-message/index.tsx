import { Heading, Text } from "@medusajs/ui"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { LocalizedClientLink } from "@lib/components"
import { WufiButton } from "@lib/components"

const EmptyCartMessage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4" data-testid="empty-cart-message">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        
        <Heading
          level="h1"
          className="heading-hero mb-4"
        >
          Teie ostukorv on tühi
        </Heading>
        
        <Text className="text-gray-600 text-lg mb-8 leading-relaxed">
          Sirvige meie kvaliteetseid lemmikloomade tooteid ja lisage midagi oma korvi.
        </Text>
        
        <div className="space-y-4">
          <LocalizedClientLink href="/store" className="block">
            <WufiButton 
              variant="primary" 
              size="large"
              className="w-full sm:w-auto justify-center group"
            >
              Sirvi tooteid
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </WufiButton>
          </LocalizedClientLink>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-gray-500">
            <LocalizedClientLink href="/categories/koerad" className="hover:text-gray-700 transition-colors">
              Koerte tooted
            </LocalizedClientLink>
            <span className="hidden sm:inline">•</span>
            <LocalizedClientLink href="/categories/kassid" className="hover:text-gray-700 transition-colors">
              Kasside tooted
            </LocalizedClientLink>
            <span className="hidden sm:inline">•</span>
            <LocalizedClientLink href="/categories/aksessuaarid" className="hover:text-gray-700 transition-colors">
              Aksessuaarid
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
