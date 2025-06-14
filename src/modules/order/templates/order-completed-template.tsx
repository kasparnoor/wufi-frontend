import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import { CartTotals } from "@lib/components"
import Help from "@modules/account/components/help"
import Items from "@modules/account/components/items"
import OnboardingCta from "@modules/account/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/account/components/shipping-details"
import PaymentDetails from "@modules/account/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Täname!</span>
            <span>Teie tellimus on edukalt esitatud.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Kokkuvõte
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} hasShippingMethod={true} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
