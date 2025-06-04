"use client"

import { Select } from "@medusajs/ui"

export type SortOptions = "created_at" | "price_asc" | "price_desc" | "popularity"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  'data-testid'?: string
}

const SortProducts = ({ sortBy, setQueryParams, 'data-testid': dataTestId }: SortProductsProps) => {
  const sortOptions = [
    {
      value: "created_at",
      label: "Uusimad ees",
    },
    {
      value: "price_asc",
      label: "Hind: odavamast",
    },
    {
      value: "price_desc",
      label: "Hind: kallimast",
    },
    {
      value: "popularity",
      label: "Populaarsemad",
    },
  ]

  return (
    <Select
      value={sortBy}
      onValueChange={(value) => setQueryParams("sortBy", value)}
      data-testid={dataTestId}
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}

export default SortProducts
