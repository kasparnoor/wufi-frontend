"use client"

import { clx } from "@medusajs/ui"
import { LogOut, ChevronDown, User, MapPin, CreditCard, Package, Heart } from "lucide-react"
import { useParams, usePathname } from "next/navigation"
import { LocalizedClientLink, KrapsButton } from "@lib/components"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    const currentPath = route.split(countryCode)[1]
    return currentPath === href
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/konto` ? (
          <LocalizedClientLink
            href="/konto"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Konto</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              Tere {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/konto/profiil"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-l-yellow-400": isActiveRoute("/konto/profile"),
                      }
                    )}
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User />
                        <span>Profiil</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/konto/lemmikloomad"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-l-yellow-400": isActiveRoute("/konto/pets"),
                      }
                    )}
                    data-testid="pets-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Heart />
                      <span>Lemmikloomad</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/konto/pusitellimused"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-l-yellow-400": isActiveRoute("/konto/subscriptions"),
                      }
                    )}
                    data-testid="subscriptions-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package />
                      <span>Püsitellimused</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/konto/tellimused"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-l-yellow-400": isActiveRoute("/konto/orders"),
                      }
                    )}
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package />
                      <span>Tellimused</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/konto/makseviis"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-l-yellow-400": isActiveRoute("/konto/payment"),
                      }
                    )}
                    data-testid="payment-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Makseviis</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden small:block" data-testid="account-nav">
        <div className="bg-yellow-50/50 rounded-lg p-4 border border-yellow-200/50">
          <div className="pb-4 border-b border-yellow-200">
            <h3 className="text-base-semi text-yellow-900">Konto</h3>
            <p className="text-sm text-yellow-700 mt-1">Tere, {customer?.first_name}</p>
          </div>
          <div className="text-base-regular pt-4">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-2">
              <li className="w-full">
                <AccountNavLink
                  href="/konto"
                  route={route!}
                  data-testid="overview-link"
                >
                  Ülevaade
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/konto/profiil"
                  route={route!}
                  data-testid="profile-link"
                >
                  Profiil
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/konto/lemmikloomad"
                  route={route!}
                  data-testid="pets-link"
                >
                  Lemmikloomad
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/konto/pusitellimused"
                  route={route!}
                  data-testid="subscriptions-link"
                >
                  Püsitellimused
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/konto/tellimused"
                  route={route!}
                  data-testid="orders-link"
                >
                  Tellimused
                </AccountNavLink>
              </li>
              {/* Removed Makseviis tab per request */}
            </ul>
          </div>
          
          {/* Logout Button with Kraps Styling */}
          <div className="pt-4 mt-4 border-t border-yellow-200">
            <KrapsButton
              variant="secondary"
              size="small"
              className="w-full justify-center bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400 text-yellow-800 hover:text-yellow-900"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logi välja
            </KrapsButton>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  'data-testid'?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  'data-testid': dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode } = useParams() as { countryCode: string }

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 w-full",
        {
          "bg-yellow-400 text-yellow-900 font-semibold shadow-sm": active,
          "text-gray-700 hover:bg-yellow-100 hover:text-yellow-800": !active,
        }
      )}
      data-testid={dataTestId}
    >
      <div className="flex items-center">
        <span>{children}</span>
      </div>
      {active && (
        <div className="w-2 h-2 rounded-full bg-yellow-900"></div>
      )}
    </LocalizedClientLink>
  )
}

export default AccountNav
