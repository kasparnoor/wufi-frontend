import { updateLineItemMetadata } from "@lib/data/cart";
import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";
import { clx } from "@medusajs/ui";
import { getAvailableIntervals, getDefaultInterval, isRecommendedInterval } from "@lib/util/subscription-intervals";
import { Info, Percent } from "lucide-react";
import { ModernTooltip } from "@lib/components";

interface SubscribeToggleProps {
  lineId: string;
  initialMetadata: Record<string, any> | null | undefined;
  onStateChange?: (isSubscribed: boolean, newInterval?: string) => Promise<void> | void;
  forceEnable?: boolean;
  isLoading?: boolean;
  productMetadata?: Record<string, any> | null | undefined;
  quantity: number;
}

const SubscribeToggle: React.FC<SubscribeToggleProps> = ({ 
  lineId, 
  initialMetadata, 
  onStateChange,
  forceEnable,
  isLoading: parentIsLoading,
  productMetadata,
  quantity
}) => {
  // Get available intervals for this product
  const availableIntervals = getAvailableIntervals(
    productMetadata?.available_intervals as string[] | undefined
  );
  
  // Initialize based on purchase_type (preferred) or fallback to subscribe field
  const getInitialSubscriptionState = () => {
    if (forceEnable !== undefined) return forceEnable;
    
    // Check purchase_type first (main way products are added to cart)
    if (initialMetadata?.purchase_type === "subscription") return true;
    if (initialMetadata?.purchase_type === "one_time") return false;
    
    // Fallback to subscribe field
    return initialMetadata?.subscribe === true || String(initialMetadata?.subscribe) === "true";
  };
  
  const [enabled, setEnabled] = useState(getInitialSubscriptionState());
  
  // Get the default interval for this product
  const defaultInterval = getDefaultInterval(productMetadata || undefined);
  
  console.log('🔍 SubscribeToggle initialization:', {
    lineId,
    productMetadata,
    defaultInterval,
    initialMetadata,
    initialSubscriptionState: enabled,
    initialMetadataInterval: initialMetadata?.interval,
    finalInitialInterval: initialMetadata?.interval || defaultInterval,
    purchaseType: initialMetadata?.purchase_type
  });
  
  const [interval, setInterval] = useState(initialMetadata?.interval || defaultInterval);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (forceEnable !== undefined) {
      setEnabled(forceEnable);
      if (forceEnable && (!initialMetadata?.interval && interval === "4w")) {
        // No need to set interval if it already has a value or metadata has one
      }
    }
  }, [forceEnable, initialMetadata?.interval, interval]);

  const handleToggle = async (newEnabledState: boolean) => {
    console.log('🔄 SubscribeToggle: handleToggle called', {
      lineId,
      newEnabledState,
      currentInterval: interval,
      initialMetadata,
      productMetadata
    });
    
    setEnabled(newEnabledState);
    setLoading(true);
    setError(null); // Clear any previous errors
    const currentInterval = newEnabledState ? interval : undefined;

    try {
      if (onStateChange) {
        console.log('🔄 SubscribeToggle: Using onStateChange callback');
        await onStateChange(newEnabledState, currentInterval);
      } else {
        console.log('🔄 SubscribeToggle: Using updateLineItemMetadata directly');
        const newMetadata = { 
          ...(initialMetadata || {}),
          subscribe: newEnabledState, 
          interval: currentInterval,
          purchase_type: newEnabledState ? "subscription" : "one_time"
        };
        console.log('🔄 SubscribeToggle: Updating metadata', newMetadata);
        
        await updateLineItemMetadata({ 
          lineId, 
          metadata: newMetadata,
          quantity
        });
        
        console.log('✅ SubscribeToggle: Metadata updated successfully');
      }
    } catch (error: any) {
      console.error('❌ SubscribeToggle: Error updating metadata', error);
      setError(error.message || 'Viga tellimuse uuendamisel');
      // Revert the state if the update failed
      setEnabled(!newEnabledState);
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = e.target.value;
    console.log('🔄 SubscribeToggle: handleIntervalChange called', {
      lineId,
      newInterval,
      enabled,
      initialMetadata
    });
    
    setInterval(newInterval);
    if (enabled) {
      setLoading(true);
      setError(null); // Clear any previous errors
      try {
        if (onStateChange) {
          console.log('🔄 SubscribeToggle: Using onStateChange callback for interval change');
          await onStateChange(true, newInterval);
        } else {
          console.log('🔄 SubscribeToggle: Using updateLineItemMetadata directly for interval change');
          const newMetadata = { 
            ...(initialMetadata || {}), 
            subscribe: true, 
            interval: newInterval,
            purchase_type: "subscription"
          };
          console.log('🔄 SubscribeToggle: Updating interval metadata', newMetadata);
          
          await updateLineItemMetadata({ 
            lineId, 
            metadata: newMetadata,
            quantity
          });
          
          console.log('✅ SubscribeToggle: Interval metadata updated successfully');
        }
      } catch (error: any) {
        console.error('❌ SubscribeToggle: Error updating interval metadata', error);
        setError(error.message || 'Viga intervalli uuendamisel');
        // Revert the interval if the update failed
        setInterval(initialMetadata?.interval || availableIntervals[0]?.value || "2w");
      } finally {
        setLoading(false);
      }
    }
  };

  const isDisabled = parentIsLoading || loading;

  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold mb-2">💰 Püsitellimuse eelised:</div>
      <ul className="text-sm space-y-1">
        <li>• <strong>30% soodustus (kuni 20€)</strong> esimesel tellimusel</li>
        <li>• <strong>5% soodustus</strong> kõigil järgnevatel</li>
        <li>• Automaatsed tarned</li>
        <li>• Muuda või tühista igal ajal</li>
      </ul>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            Püsitellimus
          </span>
          <ModernTooltip 
            content={tooltipContent} 
            side="top" 
            align="start"
            className="bg-white border border-gray-200 text-gray-900 shadow-lg"
          >
            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </ModernTooltip>
        </div>
        <Switch
          checked={enabled}
          onChange={handleToggle}
          disabled={isDisabled}
          className={clx(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
            enabled ? "bg-green-600" : "bg-gray-300",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="sr-only">Enable subscription</span>
          <span
            className={clx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </Switch>
      </div>

      {enabled && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="mb-3">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              <Percent className="h-3 w-3" />
              Säästad 30% (kuni 20€) + 5% regulaarselt
            </div>
          </div>
          
          <div>
            <label htmlFor={`interval-select-${lineId}`} className="block text-xs font-medium text-gray-700 mb-2">
              Tarneintervall
            </label>
            <select
              id={`interval-select-${lineId}`}
              className={clx(
                "block w-full text-sm border border-gray-300 rounded-md p-2 focus:border-green-500 focus:ring-green-500 bg-white",
                isDisabled && "opacity-50 cursor-not-allowed bg-gray-100"
              )}
              value={interval}
              onChange={handleIntervalChange}
              disabled={isDisabled}
            >
              {availableIntervals.map((intervalOption) => (
                <option key={intervalOption.value} value={intervalOption.value}>
                  {intervalOption.label}
                  {isRecommendedInterval(intervalOption.value, productMetadata || undefined) && " (Soovitatav ajavahemik)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
          Uuendame...
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default SubscribeToggle; 