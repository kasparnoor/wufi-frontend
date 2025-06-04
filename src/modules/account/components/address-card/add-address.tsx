"use client"

import { Button, Heading } from "@medusajs/ui"
import { Plus } from "lucide-react"
import { useEffect, useState, useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { CountrySelect } from "@lib/components"
import { ModernInput as Input } from "@lib/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@lib/components"
import { SubmitButton } from "@lib/components"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"

const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <Dialog open={state} onOpenChange={(isOpen) => isOpen ? open() : close()}>
      <DialogTrigger asChild>
        <button
          className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
          data-testid="add-address-button"
        >
          <span className="text-base-semi">New address</span>
          <Plus />
        </button>
      </DialogTrigger>
      <DialogContent data-testid="add-address-modal">
        <DialogHeader>
          <DialogTitle>
            <Heading className="mb-2">Add address</Heading>
          </DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="flex flex-col gap-y-2">
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                label="First name"
                name="first_name"
                required
                autoComplete="given-name"
                data-testid="first-name-input"
              />
              <Input
                label="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                data-testid="last-name-input"
              />
            </div>
            <Input
              label="Company"
              name="company"
              autoComplete="organization"
              data-testid="company-input"
            />
            <Input
              label="Address"
              name="address_1"
              required
              autoComplete="address-line1"
              data-testid="address-1-input"
            />
            <Input
              label="Apartment, suite, etc."
              name="address_2"
              autoComplete="address-line2"
              data-testid="address-2-input"
            />
            <div className="grid grid-cols-[144px_1fr] gap-x-2">
              <Input
                label="Postal code"
                name="postal_code"
                required
                autoComplete="postal-code"
                data-testid="postal-code-input"
              />
              <Input
                label="City"
                name="city"
                required
                autoComplete="locality"
                data-testid="city-input"
              />
            </div>
            <Input
              label="Province / State"
              name="province"
              autoComplete="address-level1"
              data-testid="state-input"
            />
            <CountrySelect
              region={region}
              name="country_code"
              required
              autoComplete="country"
              data-testid="country-select"
            />
            <Input
              label="Phone"
              name="phone"
              autoComplete="phone"
              data-testid="phone-input"
            />
          </div>
          {formState.error && (
            <div
              className="text-rose-500 text-small-regular py-2"
              data-testid="address-error"
            >
              {formState.error}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              type="reset"
              variant="secondary"
              onClick={close}
              className="h-10"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <SubmitButton data-testid="save-button">Save</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddress
