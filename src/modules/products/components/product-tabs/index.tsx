"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useMemo, useState } from "react"
import { Disclosure } from "@headlessui/react"
import { Info, Shield } from "lucide-react"

import Accordion from "./accordion"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Toote tehniline info",
      icon: <Info className="h-5 w-5 text-yellow-800" />,
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Garantii ja tagastamine",
      icon: <Shield className="h-5 w-5 text-yellow-800" />,
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            icon={tab.icon}
            headingSize="medium"
            value={tab.label}
            className="hover:bg-yellow-50/30 transition-colors duration-200"
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-y-4">
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <span className="font-semibold text-yellow-800">Materjal</span>
            <p className="text-gray-600 mt-1">{product.material ? product.material : "-"}</p>
          </div>
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <span className="font-semibold text-yellow-800">Päritolumaa</span>
            <p className="text-gray-600 mt-1">{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <span className="font-semibold text-yellow-800">Tüüp</span>
            <p className="text-gray-600 mt-1">{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <span className="font-semibold text-yellow-800">Kaal</span>
            <p className="text-gray-600 mt-1">{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <span className="font-semibold text-yellow-800">Mõõtmed</span>
            <p className="text-gray-600 mt-1">
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8 px-6">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
          <div className="flex items-start gap-x-4">
            <FastDelivery className="h-6 w-6 text-yellow-800 mt-1" />
            <div>
              <span className="font-semibold text-yellow-800">Kiire ja turvaline tarne</span>
              <p className="text-gray-600 mt-2 max-w-sm">
                Teie tellimus jõuab teieni 3-5 tööpäeva jooksul. Kogu teekonna võite jälgida meie veebilehel.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
          <div className="flex items-start gap-x-4">
            <Refresh className="h-6 w-6 text-yellow-800 mt-1" />
            <div>
              <span className="font-semibold text-yellow-800">14-päevane tagastamine</span>
              <p className="text-gray-600 mt-2 max-w-sm">
                Kui toode ei sobi või ei vasta teie ootustele, tagastage see 14 päeva jooksul. Tagastamine on tasuta.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
          <div className="flex items-start gap-x-4">
            <Shield className="h-6 w-6 text-yellow-800 mt-1" />
            <div>
              <span className="font-semibold text-yellow-800">2-aastane garantii</span>
              <p className="text-gray-600 mt-2 max-w-sm">
                Kõik meie tooted on kaetud 2-aastase garantiiaga. Kui toode peaks rikki minema, asendame selle uue vastu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
