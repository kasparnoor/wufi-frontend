'use client';

import { HttpTypes } from "@medusajs/types";
import { RadioGroup } from "@headlessui/react";
import { clx } from "@medusajs/ui";
import { RadioGroup as MedusaRadio, RadioGroupItem } from "@lib/components";
import { updateLineItemMetadata } from "@lib/data/cart";
import { useState, useEffect } from "react";
import { Thumbnail } from "@lib/components";
import { CheckCircle } from "lucide-react";
import { getAvailableIntervals } from "@lib/util/subscription-intervals";

interface AutoshipOptionsProps {
  cart: HttpTypes.StoreCart;
}

// Constants for discounts (can be centralized later if needed)
const FIRST_ORDER_DISCOUNT_PERCENT = 30;
const RECURRING_DISCOUNT_PERCENT = 5;

const AutoshipOptions: React.FC<AutoshipOptionsProps> = ({ cart }) => {
  // Filter for items whose *product* is marked as eligible for autoship in Medusa Admin.
  const autoshipEligibleItems = (cart.items || []).filter(
    (item) => {
      const productMetadata = (item.product as any)?.metadata;
      return productMetadata?.autoship === true; // Check for boolean true
    }
  );

  if (autoshipEligibleItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Püsitellimuse Seadistamine</h3>
      <p className="text-sm text-gray-600">
        Vali, kuidas soovid oma tooteid saada. Püsitellimusega säästad!
      </p>
      <div className="space-y-6 md:space-y-8">
        {autoshipEligibleItems.map((item: HttpTypes.StoreCartLineItem) => (
          <AutoshipItemOption key={item.id} item={item} cart={cart} />
        ))}
      </div>
    </div>
  );
};

interface AutoshipItemOptionProps {
  item: HttpTypes.StoreCartLineItem;
  cart: HttpTypes.StoreCart;
}

const AutoshipItemOption: React.FC<AutoshipItemOptionProps> = ({ item, cart }) => {
  // Get available intervals for this product
  const availableIntervals = getAvailableIntervals(
    (item.product as any)?.metadata?.available_intervals as string[] | undefined
  );
  
  // Initial purchase type respects what might have been set on product page (from item metadata),
  // otherwise defaults to 'one_time'.
  const getInitialPurchaseType = () => {
    if (item.metadata?.purchase_type) {
      return item.metadata.purchase_type as "one_time" | "subscription";
    }
    if (item.metadata?.subscribe === true || String(item.metadata?.subscribe) === "true") {
      return "subscription";
    }
    return "one_time"; // Default to one_time if no specific choice from product page
  };

  const [purchaseType, setPurchaseType] = useState<"one_time" | "subscription">(getInitialPurchaseType());
  const initialInterval = (item.metadata?.interval as string | undefined) || availableIntervals[0]?.value || "2w";
  const [selectedInterval, setSelectedInterval] = useState<string>(
    initialInterval
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateCartAndMetadata = async () => {
      setIsLoading(true);
      const newMetadata: Record<string, any> = {
        ...item.metadata,
        purchase_type: purchaseType,
        subscribe: purchaseType === "subscription",
      };

      if (purchaseType === "subscription") {
        newMetadata.interval = selectedInterval;
        newMetadata.subscription_discount = String(FIRST_ORDER_DISCOUNT_PERCENT);
        newMetadata.is_first_order = "true"; 
        newMetadata.autoship = "true";
      } else { // one_time purchase
        delete newMetadata.interval;
        delete newMetadata.subscription_discount;
        newMetadata.autoship = "false";
      }
      
      try {
        await updateLineItemMetadata({ 
          lineId: item.id, 
          metadata: newMetadata, 
          quantity: item.quantity 
        });

      } catch (error) {
        console.error("Failed to update cart/metadata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if ( 
        item.metadata?.purchase_type !== purchaseType || 
        (item.metadata?.subscribe !== (purchaseType === "subscription")) ||
        (purchaseType === "subscription" && item.metadata?.interval !== selectedInterval) ||
        (purchaseType === "subscription" && item.metadata?.autoship !== "true") ||
        (purchaseType === "one_time" && item.metadata?.autoship !== "false")
      ) {
       updateCartAndMetadata();
    }
  }, [purchaseType, selectedInterval, item.id, item.quantity]);


  const handlePurchaseTypeChange = (value: "one_time" | "subscription") => {
    setPurchaseType(value);
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInterval(event.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-xl z-10">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Product Info Card */}
      <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 mb-5 border-b border-gray-200">
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          className="w-20 h-20 flex-shrink-0"
        />
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{item.product_title}</h4>
          {item.variant?.title && (
            <p className="text-sm text-gray-600 mt-1">{item.variant.title}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">Kogus: {item.quantity}</p>
        </div>
      </div>
      
      {/* Subscription Options */}
      <RadioGroup value={purchaseType} onChange={handlePurchaseTypeChange} disabled={isLoading} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subscription Option */}
          <RadioGroup.Option
            value="subscription"
            className={({ checked }) =>
              clx(
                "p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out relative overflow-hidden",
                {
                  "border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-opacity-50": checked,
                  "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                  "opacity-70 cursor-not-allowed": isLoading,
                }
              )
            }
          >
            {({ checked }) => (
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-x-3">
                  <div className="mt-0.5">
                    <MedusaRadio checked={checked} />
                  </div>
                  <div className="flex-1">
                    <RadioGroup.Label as="span" className="text-base font-semibold text-gray-800 block">
                      Telli ja Säästa (Püsitellimus)
                    </RadioGroup.Label>
                    <div className="mt-2 bg-green-50 text-green-700 font-medium px-3 py-1.5 rounded-lg inline-block text-sm">
                      Säästa {FIRST_ORDER_DISCOUNT_PERCENT}% esimeselt, seejärel {RECURRING_DISCOUNT_PERCENT}% kõigilt järgmistelt
                    </div>
                  </div>
                </div>
                
                <div className={clx("mt-4", {"opacity-0 h-0 overflow-hidden": !checked, "opacity-100": checked})}>
                  <ul className="space-y-1.5 mt-3">
                    <li className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span>Regulaarsed tarned sinu valitud graafiku alusel</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span>Jäta vahele, muuda või tühista millal iganes</span>
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span>Automaatne tellimuse haldamine</span>
                    </li>
                  </ul>
                  
                  {checked && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label htmlFor={`interval-select-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Tarneintervall:
                      </label>
                      <select
                        id={`interval-select-${item.id}`}
                        name="interval"
                        value={selectedInterval}
                        onChange={handleIntervalChange}
                        disabled={isLoading}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm"
                      >
                        {availableIntervals.map(interval => (
                          <option key={interval.value} value={interval.value}>
                            {interval.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </RadioGroup.Option>

          {/* One-time Purchase Option */}
          <RadioGroup.Option
            value="one_time"
            className={({ checked }) =>
              clx(
                "p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out",
                {
                  "border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-opacity-50": checked,
                  "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300": !checked,
                  "opacity-70 cursor-not-allowed": isLoading,
                }
              )
            }
          >
            {({ checked }) => (
              <div className="flex items-start gap-x-3">
                <div className="mt-0.5">
                  <MedusaRadio checked={checked} />
                </div>
                <div>
                  <RadioGroup.Label as="span" className="text-base font-semibold text-gray-800 block">
                    Ühekordne Ost
                  </RadioGroup.Label>
                  <RadioGroup.Description as="span" className="text-sm text-gray-600 mt-2 block">
                    Saa see toode vaid üks kord.
                  </RadioGroup.Description>
                </div>
              </div>
            )}
          </RadioGroup.Option>
        </div>
      </RadioGroup>
    </div>
  );
};

export default AutoshipOptions; 