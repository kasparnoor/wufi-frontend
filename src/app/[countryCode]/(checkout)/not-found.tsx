import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404",
  description: "Midagi läks valesti",
}

export default async function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Lehte ei leitud</h1>
      <p className="text-small-regular text-ui-fg-base">
        Lehekülge, mida proovisite avada, ei eksisteeri.
      </p>
      <InteractiveLink href="/">Mine avalehele</InteractiveLink>
    </div>
  )
}
