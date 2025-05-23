"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()
  
  // Ensure href has a leading slash if it doesn't already
  const formattedHref = href.startsWith("/") ? href : `/${href}`
  
  // Only prepend countryCode if it exists
  const finalHref = countryCode ? `/${countryCode}${formattedHref}` : formattedHref

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
