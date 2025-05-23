import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { ToastProvider, ToastStyles } from "@modules/common/components/toast"
import { CartStateProvider } from "@modules/common/components/cart-state"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <ToastProvider>
          <CartStateProvider>
            <ToastStyles />
            <main className="relative">{props.children}</main>
          </CartStateProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
