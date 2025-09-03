"use client"

import React from "react"

type ActivationRequiredProps = {
  customerEmail?: string
  title?: string
  description?: string
  onResendClick?: () => void
  onLogoutClick?: () => void
}

/**
 * Displays an account activation required message with optional actions
 * to resend the activation email or navigate back.
 */
const ActivationRequired: React.FC<ActivationRequiredProps> = ({
  customerEmail,
  title = "Account activation required",
  description = "Please activate your account before logging in.",
  onResendClick,
  onLogoutClick,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        {customerEmail ? (
          <p className="text-sm text-gray-500">{customerEmail}</p>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onResendClick}
          className="inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
          data-testid="resend-activation-button"
        >
          Saada aktiviseerimislink uuesti
        </button>
        <button
          type="button"
          onClick={onLogoutClick}
          className="inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Tagasi
        </button>
      </div>
    </div>
  )
}

export default ActivationRequired




