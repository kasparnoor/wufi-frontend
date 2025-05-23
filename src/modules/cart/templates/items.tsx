import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Tooted ostukorvis</h2>
        <p className="text-gray-600 text-sm">Kokku {items?.length || 0} toodet</p>
      </div>
      
      <Table className="border-collapse">
        <Table.Header className="border-b border-gray-200">
          <Table.Row className="text-gray-700 font-medium">
            <Table.HeaderCell className="!pl-0 py-4">Toode</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell className="py-4">Kogus</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell py-4">
              Hind
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right py-4">
              Kokku
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
