import { updateLineItemMetadata } from "@lib/data/cart";
import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";
import { clx } from "@medusajs/ui";
import { getAvailableIntervals } from "@lib/util/subscription-intervals";

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
  
  const [enabled, setEnabled] = useState(forceEnable ?? (initialMetadata?.subscribe === true || String(initialMetadata?.subscribe) === "true"));
  const [interval, setInterval] = useState(initialMetadata?.interval || availableIntervals[0]?.value || "2w");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forceEnable !== undefined) {
      setEnabled(forceEnable);
      if (forceEnable && (!initialMetadata?.interval && interval === "4w")) {
        // No need to set interval if it already has a value or metadata has one
      }
    }
  }, [forceEnable, initialMetadata?.interval, interval]);

  const handleToggle = async (newEnabledState: boolean) => {
    setEnabled(newEnabledState);
    setLoading(true);
    const currentInterval = newEnabledState ? interval : undefined;

    if (onStateChange) {
      await onStateChange(newEnabledState, currentInterval);
    } else {
      await updateLineItemMetadata({ 
        lineId, 
        metadata: { 
          ...(initialMetadata || {}),
          subscribe: newEnabledState, 
          interval: currentInterval 
        },
        quantity
      });
    }
    setLoading(false);
  };

  const handleIntervalChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = e.target.value;
    setInterval(newInterval);
    if (enabled) {
      setLoading(true);
      if (onStateChange) {
        await onStateChange(true, newInterval);
      } else {
        await updateLineItemMetadata({ 
            lineId, 
            metadata: { 
              ...(initialMetadata || {}), 
              subscribe: true, 
              interval: newInterval 
            },
            quantity
        });
      }
      setLoading(false);
    }
  };

  const isDisabled = parentIsLoading || loading;

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-between">
        <label htmlFor={`subscribe-switch-${lineId}`} className="text-sm font-medium text-gray-700">
          Püsitellimus aktiivne
        </label>
        <Switch
          id={`subscribe-switch-${lineId}`}
          checked={enabled}
          onChange={handleToggle}
          disabled={isDisabled}
          className={clx(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            enabled ? "bg-blue-600" : "bg-gray-300",
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
        <div>
          <label htmlFor={`interval-select-${lineId}`} className="block text-xs font-medium text-gray-500 mb-1">
            Tarne intervall
          </label>
          <select
            id={`interval-select-${lineId}`}
            className={clx(
                "block w-full text-sm border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500",
                isDisabled && "opacity-50 cursor-not-allowed bg-gray-100"
            )}
            value={interval}
            onChange={handleIntervalChange}
            disabled={isDisabled}
          >
            {availableIntervals.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SubscribeToggle; 