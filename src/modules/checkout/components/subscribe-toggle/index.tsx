import { updateLineItemMetadata } from "@lib/data/cart";
import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";
import { clx } from "@medusajs/ui";
import { getAvailableIntervals } from "@lib/util/subscription-intervals";
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

  const tooltipContent = (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border max-w-xs">
      <div className="font-semibold mb-2">💰 Püsitellimuse eelised:</div>
      <ul className="text-sm space-y-1">
        <li>• <strong>30% soodustus</strong> esimesel tellimusel</li>
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
              Säästad 30% + 5% regulaarselt
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
              {availableIntervals.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
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
    </div>
  );
};

export default SubscribeToggle; 