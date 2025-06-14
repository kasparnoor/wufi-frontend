"use client"

import React, { useEffect, useActionState } from "react"
import { ModernInput as Input } from "@lib/components"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { toast } from "@medusajs/ui"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // TODO: Add support for password updates
  const updatePassword = async () => {
    toast.info("Parooli uuendamine ei ole veel toetatud")
  }

  const clearState = () => {
    setSuccessState(false)
  }

  return (
    <form
      action={updatePassword}
      onReset={() => clearState()}
      className="w-full"
    >
      <AccountInfo
        label="Parool"
        currentInfo={
          <span>Parooli ei näidata turvalisuse huvides</span>
        }
        isSuccess={successState}
        isError={false}
        errorMessage={undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vana parool"
            name="old_password"
            required
            type="password"
            data-testid="old-password-input"
          />
          <Input
            label="Uus parool"
            type="password"
            name="new_password"
            required
            data-testid="new-password-input"
          />
          <Input
            label="Kinnita parool"
            type="password"
            name="confirm_password"
            required
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
