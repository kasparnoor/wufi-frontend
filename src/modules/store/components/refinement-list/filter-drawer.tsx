import { Button } from "@medusajs/ui"
import { X } from "@medusajs/icons"
import { useState } from "react"

type FilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  setQueryParams: (name: string, value: string) => void
}

const FilterDrawer = ({ isOpen, onClose, setQueryParams }: FilterDrawerProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose()
          }
        }}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-yellow-800">Filtreeri</h2>
            <Button
              variant="secondary"
              size="small"
              className="p-2 hover:bg-yellow-50 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-yellow-600" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-yellow-800 mb-4">Hinna vahemik</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-yellow-600">
                  <span>0€</span>
                  <span>{priceRange[1]}€</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-yellow-800 mb-4">Kategooriad</h3>
              <div className="space-y-2">
                {['Koerad', 'Kassid', 'Linnud', 'Kalad', 'Muud loomad'].map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category])
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category))
                        }
                      }}
                      className="w-4 h-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-yellow-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1 bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                onClick={() => {
                  setPriceRange([0, 1000])
                  setSelectedCategories([])
                }}
              >
                Tühjenda
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={() => {
                  // Apply filters
                  setQueryParams('price', `${priceRange[0]}-${priceRange[1]}`)
                  if (selectedCategories.length > 0) {
                    setQueryParams('categories', selectedCategories.join(','))
                  }
                  onClose()
                }}
              >
                Rakenda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterDrawer 