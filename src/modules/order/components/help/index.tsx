import { Heading } from "@medusajs/ui"
import { LocalizedClientLink } from "@lib/components"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Vajad abi?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">Kontakt</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              Tagastused ja vahetused
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
