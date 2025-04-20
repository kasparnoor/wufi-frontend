import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"
import { Check } from "@medusajs/icons"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  "data-testid"?: string
  disabled?: boolean
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Vali {title.toLowerCase()}</span>
        {current && (
          <span className="text-xs text-yellow-600 font-medium">
            Valitud
          </span>
        )}
      </div>
      <div
        className="grid grid-cols-2 gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "relative border text-sm font-medium rounded-xl p-3 transition-all duration-200 group",
                {
                  "border-yellow-400 bg-yellow-50 text-yellow-700": isSelected,
                  "border-gray-200 bg-white text-gray-700 hover:border-yellow-200 hover:bg-yellow-50/50": !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              <span className="flex items-center justify-between">
                <span>{v}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-yellow-600" />
                )}
              </span>
              {!isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-yellow-200 transition-all duration-200" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
