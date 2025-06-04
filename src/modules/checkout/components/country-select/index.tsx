import { forwardRef, useMemo } from "react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@lib/components"
import { HttpTypes } from "@medusajs/types"

interface CountrySelectProps {
  placeholder?: string
  region?: HttpTypes.StoreRegion
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
}

const CountrySelect = forwardRef<HTMLButtonElement, CountrySelectProps>(
  ({ placeholder = "Country", region, value, onValueChange, disabled, name }, ref) => {
    const countryOptions = useMemo(() => {
      if (!region) {
        return []
      }

      return region.countries?.map((country) => ({
        value: country.iso_2,
        label: country.display_name,
      })) || []
    }, [region])

    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
        <SelectTrigger ref={ref} className="h-16">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {countryOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
