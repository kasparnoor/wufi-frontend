import { LocalizedClientLink } from "@lib/components"
import ChevronDown from "@modules/common/icons/chevron-down"
import { MedusaCTA } from "@lib/components"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              Tagasi ostukorvi
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Tagasi
            </span>
          </LocalizedClientLink>
          <span
            className="txt-compact-xlarge-plus text-ui-fg-subtle"
            data-testid="checkout-header-title"
          >
            Lõpeta tellimus
          </span>
          <div className="flex-1 basis-0 flex justify-end items-center">
            <LocalizedClientLink
              href="/"
              className="text-small-semi text-ui-fg-base flex items-center gap-x-2 hover:text-ui-fg-interactive"
              data-testid="homepage-link"
            >
              Avalehele
              {/* Add Home icon here if available - e.g., <HomeIcon className="h-5 w-5" /> */}
            </LocalizedClientLink>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
