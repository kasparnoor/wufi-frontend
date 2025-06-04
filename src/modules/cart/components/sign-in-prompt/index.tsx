import { Button, Heading, Text } from "@medusajs/ui"
import { LocalizedClientLink } from "@lib/components"
import { User, ArrowRight } from "lucide-react"
import { WufiButton } from "@lib/components"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-blue-600" />
          <Heading level="h3" className="heading-tertiary">
            Kas teil on juba konto?
          </Heading>
        </div>
        <Text className="text-gray-600 text-sm leading-relaxed">
          Sisselogimisel näete oma tellimuste ajalugu, jälgite saadetisi ja haldate oma kontot.
        </Text>
      </div>
      <div className="flex-shrink-0">
        <LocalizedClientLink href="/account">
          <WufiButton 
            variant="secondary" 
            size="medium"
            className="w-full sm:w-auto justify-center group"
            data-testid="sign-in-button"
          >
            Logi sisse
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </WufiButton>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
