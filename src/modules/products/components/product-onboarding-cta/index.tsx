import { Button, Container, Text } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          Teie demotoode on edukalt loodud! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          Nüüd saate jätkata oma poe seadistamist administraatoriliideses.
        </Text>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full">Jätka seadistamist administraatoriliideses</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
