"use client"

import { clx } from "@medusajs/ui"
import { LogOut, ChevronDown, User, MapPin, CreditCard } from "lucide-react"
import { useParams, usePathname } from "next/navigation"
import { LocalizedClientLink } from "@lib/components"
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
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
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
                    href="/account/profile"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/profile"),
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
                    href="/account/addresses"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/addresses"),
                      }
                    )}
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin />
                        <span>Aadressid</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/billing"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/billing"),
                      }
                    )}
                    data-testid="billing-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Arveldus</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/orders"),
                      }
                    )}
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <User />
                      <span>Tellimused</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/subscriptions"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/subscriptions"),
                      }
                    )}
                    data-testid="subscriptions-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <User />
                      <span>Püsitellimused</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/pets"
                    className={clx(
                      "flex items-center justify-between py-4 border-b border-gray-200 px-8",
                      {
                        "bg-blue-50 text-blue-700 font-semibold": isActiveRoute("/account/pets"),
                      }
                    )}
                    data-testid="pets-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <User />
                      <span>Lemmikloomad</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <LogOut />
                      <span>Logi välja</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="text-base-semi">Konto</h3>
          </div>
          <div className="text-base-regular">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
              <li>
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  Ülevaade
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                >
                  Profiil
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                >
                  Aadressid
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/billing"
                  route={route!}
                  data-testid="billing-link"
                >
                  Arveldus
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                >
                  Tellimused
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/subscriptions"
                  route={route!}
                  data-testid="subscriptions-link"
                >
                  Püsitellimused
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/pets"
                  route={route!}
                  data-testid="pets-link"
                >
                  Lemmikloomad
                </AccountNavLink>
              </li>
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  Logi välja
                </button>
              </li>
            </ul>
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
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx("text-ui-fg-subtle hover:text-ui-fg-base", {
        "text-blue-600 font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
