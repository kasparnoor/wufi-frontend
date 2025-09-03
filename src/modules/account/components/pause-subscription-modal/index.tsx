import { X } from "lucide-react"
import { useState } from "react"
import { KrapsButton } from "../../../../lib/components"

interface PauseSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onPause: (weeks: number) => void
}

const PauseSubscriptionModal = ({
  isOpen,
  onClose,
  onPause
}: PauseSubscriptionModalProps) => {
  const [selectedWeeks, setSelectedWeeks] = useState(2)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-yellow-900">Tellimuse peatamine</h3>
          <button
            onClick={onClose}
            className="text-yellow-700 hover:text-yellow-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-yellow-800 mb-4">
          Vali, kui kauaks soovid tellimust peatada. Saad selle igal ajal taasaktiveerida.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[2, 4, 8].map((weeks) => (
              <button
                key={weeks}
                onClick={() => setSelectedWeeks(weeks)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedWeeks === weeks
                    ? "bg-yellow-100 border-yellow-300 text-yellow-900"
                    : "border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                }`}
              >
                {weeks} nädalat
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <KrapsButton
              variant="secondary"
              size="small"
              onClick={onClose}
            >
              Tühista
            </KrapsButton>
            <KrapsButton
              variant="primary"
              size="small"
              onClick={() => onPause(selectedWeeks)}
            >
              Peata tellimus
            </KrapsButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PauseSubscriptionModal 