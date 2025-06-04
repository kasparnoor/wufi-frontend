import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="heading-primary">Ostukorvis</h2>
          <p className="text-gray-600 text-sm">
            {items?.length ? `${items.length} ${items.length === 1 ? 'toode' : 'toodet'}` : 'Tühi ostukorv'}
          </p>
        </div>
      </div>
      
      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items
            .sort((a, b) => {
              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            })
            .map((item) => {
              return (
                <Item
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency_code}
                  type="card"
                />
              )
            })
          }
        </div>
      ) : (
        <div className="space-y-3">
          {repeat(5).map((i) => {
            return <SkeletonLineItem key={i} />
          })}
        </div>
      )}
    </div>
  )
}

export default ItemsTemplate
