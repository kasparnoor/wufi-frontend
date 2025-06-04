import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { ToastProvider, ToastStyles, TooltipProvider } from "@lib/components"
import { CartStateProvider } from "@lib/components"
import QueryProvider from "@lib/context/query-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <QueryProvider>
          <TooltipProvider>
            <ToastProvider>
              <CartStateProvider>
                <ToastStyles />
                <main className="relative">{props.children}</main>
              </CartStateProvider>
            </ToastProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
