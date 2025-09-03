import { Inter } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { ToastProvider, ToastStyles, TooltipProvider, OrganizationSchema, WebsiteSchema } from "@lib/components"
import { CartStateProvider } from "@lib/components"
import QueryProvider from "@lib/context/query-provider"
import GlobalErrorHandler from "@lib/components/global-error-handler"
import { CookieConsentProvider, CookieConsentManager } from "@lib/components/cookie-consent"
import ConditionalScripts from "@lib/components/cookie-consent/conditional-scripts"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Kraps - Eesti lemmikloomade pood",
    template: "%s | Kraps"
  },
  description: "Kraps - tänapäevane Eesti lemmikloomade e-pood. Kvaliteetsed tooted, kiire kohaletoimetamine ja isikupärastatud teenus.",
  keywords: "lemmikloomade toit, koerte toit, kasside toit, lemmikloomade aksessuaarid, Eesti lemmikloomade pood, koerte maiused, kasside maiused",
  authors: [{ name: "Kraps" }],
  creator: "Kraps",
  publisher: "Kraps",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "et_EE",
    url: getBaseURL(),
    siteName: "Kraps",
    title: "Kraps - Eesti lemmikloomade pood",
    description: "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kraps - Eesti lemmikloomade pood",
    description: "Tänapäevane lemmikloomade e-pood Eestis. Kvaliteetsed toidud, maiused ja aksessuaarid koertele ja kassidele.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalErrorHandler />
        <OrganizationSchema />
        <WebsiteSchema />
        <CookieConsentProvider>
          <QueryProvider>
            <TooltipProvider>
              <ToastProvider>
                <CartStateProvider>
                  <ToastStyles />
                  <main className="relative">{children}</main>
                  <ConditionalScripts />
                  <CookieConsentManager />
                </CartStateProvider>
              </ToastProvider>
            </TooltipProvider>
          </QueryProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}
