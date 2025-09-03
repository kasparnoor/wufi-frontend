"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { HttpTypes } from "@medusajs/types"
import { Shield, Truck, RotateCcw, Package } from "lucide-react"

import Accordion from "./accordion"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Tehnilised andmed",
      icon: <Package className="h-5 w-5 text-gray-600" />,
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Kohaletoimetamine ja tagastamine",
      icon: <Truck className="h-5 w-5 text-gray-600" />,
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            icon={tab.icon}
            headingSize="medium"
            value={tab.label}
            className="border-b border-gray-200 last:border-b-0"
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const specs = [
    { label: "Materjal", value: product.material },
    { label: "Päritolumaa", value: product.origin_country },
    { label: "Tüüp", value: product.type?.value },
    { label: "Kaal", value: product.weight ? `${product.weight} g` : null },
    { 
      label: "Mõõtmed", 
      value: product.length && product.width && product.height
        ? `${product.length} × ${product.width} × ${product.height} cm`
        : null
    },
  ].filter(spec => spec.value && spec.value !== 'Unknown')

  return (
    <div className="py-6">
      {specs.length > 0 ? (
        <div className="space-y-4">
          {specs.map((spec, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600 font-medium">{spec.label}</span>
              <span className="text-gray-900">{spec.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Tehnilised andmed pole saadaval</p>
      )}
    </div>
  )
}

const ShippingInfoTab = () => {
  const policies = [
    {
      icon: <Truck className="h-5 w-5 text-blue-600" />,
      title: "Tasuta kohaletoimetamine",
      description: "Tellimused üle 50€ - tasuta transport kogu Eestis"
    },
    {
      icon: <RotateCcw className="h-5 w-5 text-green-600" />,
      title: "14-päevane tagastamine",
      description: "Tagastage toode 14 päeva jooksul, kui see ei sobi"
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      title: "Maitsegarantii",
      description: "Kui pakk on 80% täis ja lemmikule ei maitsenud, võtame tagasi 14 päeva jooksul - isegi kui pakk on avatud!"
    }
  ]

  return (
    <div className="py-6">
      <div className="space-y-6">
        {policies.map((policy, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
              {policy.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {policy.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductTabs
