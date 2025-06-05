// ========================================
// 🎯 FOUNDATION COMPONENT EXPORTS ONLY
// UI primitives and brand components
// ========================================

// ============= UI COMPONENTS (Universal) =============
// shadcn/ui components - modern, accessible, universal
export { Button } from "./ui/button"
export { Input } from "./ui/input"
export { Label } from "./ui/label"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
export { Textarea } from "./ui/textarea"
export { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "./ui/form"
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
export { Separator } from "./ui/separator"
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
export { RadioGroup, RadioGroupItem } from "./ui/radio-group"
export { Checkbox } from "./ui/checkbox"
export { Toaster } from "./ui/sonner"

// Modern UI enhancements (enhanced components)
export { ModernInput } from "./ui/modern-input"
export { ModernTooltip, InfoTooltip } from "./ui/modern-tooltip"

// ============= SKELETON COMPONENTS =============
export { default as SkeletonProductPreview } from "./ui/skeleton-product-preview"
export { default as SkeletonCartItem } from "./ui/skeleton-cart-item"
export { default as SkeletonCodeForm } from "./ui/skeleton-code-form"
export { default as SkeletonOrderSummary } from "./ui/skeleton-order-summary"
export { default as SkeletonLineItem } from "./ui/skeleton-line-item"
export { default as SkeletonCardDetails } from "./ui/skeleton-card-details"
export { default as SkeletonCartTotals } from "./ui/skeleton-cart-totals"
export { default as SkeletonButton } from "./ui/skeleton-button"
export { default as SkeletonOrderConfirmedHeader } from "./ui/skeleton-order-confirmed-header"
export { default as SkeletonOrderItems } from "./ui/skeleton-order-items"
export { default as SkeletonOrderInformation } from "./ui/skeleton-order-information"

// ============= WUFI COMPONENTS =============
export { default as WufiButton } from "./wufi/wufi-button"
export { default as EmailInput } from "./wufi/email-input"
export { default as PhoneInput } from "./wufi/phone-input"
export { default as EstonianAddressInput } from "./wufi/estonian-address-input"

// ========================================
// 🚨 TEMPORARY RE-EXPORTS FOR MIGRATION
// These will be removed once imports are updated
// ========================================

// Common components (temporary re-exports)
export { default as LocalizedClientLink } from "@modules/common/components/localized-client-link"
export { CartStateProvider, useCartState } from "@modules/common/components/cart-state"
export { default as InteractiveLink } from "@modules/common/components/interactive-link"
export { ToastProvider, useToast as UseToastLegacy, ToastStyles } from "@modules/common/components/toast"
export { default as LineItemOptions } from "@modules/common/components/line-item-options"
export { default as LineItemPrice } from "@modules/common/components/line-item-price"
export { default as LineItemUnitPrice } from "@modules/common/components/line-item-unit-price"
export { default as CartTotals } from "@modules/common/components/cart-totals"

// Layout components (temporary re-exports)
export { default as CartButton } from "@modules/layout/components/cart-button"
export { default as SearchBar } from "@modules/layout/components/search-bar"
export { default as CountrySelect } from "@modules/layout/components/country-select"
export { default as MegaMenu } from "@modules/layout/components/mega-menu"
export { default as MedusaCTA } from "@modules/layout/components/medusa-cta"

// Account components (temporary re-exports)
export { default as Login } from "@modules/account/components/login"
export { default as Register } from "@modules/account/components/register"
export { default as AddressManagement } from "@modules/account/components/address-management"
export { default as BillingManagement } from "@modules/account/components/billing-management"
export { default as OrdersManagement } from "@modules/account/components/orders-management"
export { default as PetManagement } from "@modules/account/components/pet-management"
export { default as ProfileManagement } from "@modules/account/components/profile-management"
export { default as SubscriptionManagement } from "@modules/account/components/subscription-management"
export { default as Dashboard } from "@modules/account/components/dashboard"

// Checkout components (temporary re-exports)
export { default as ErrorMessage } from "@modules/checkout/components/error-message"
export { default as PaymentWrapper } from "@modules/checkout/components/payment-wrapper"
export { SubmitButton } from "@modules/checkout/components/submit-button"

// Account components (additional)
export { default as AccountSetup } from "@modules/account/components/account-setup"

// Product components (temporary re-exports)
export { default as ProductPreview } from "@modules/products/components/product-preview"
export { default as Thumbnail } from "@modules/products/components/thumbnail"

// Order components (temporary re-exports)
export { default as TransferImage } from "@modules/order/components/transfer-image"

// Common utility components (temporary re-exports)
export { default as DeleteButton } from "@modules/common/components/delete-button"

// Modern toast hook (from sonner)
export { toast as useToast } from "sonner"

// ========================================
// 📝 TODO: UPDATE IMPORTS TO USE MODULES
// ========================================
// 
// These components should be imported directly from modules:
// 
// Layout Components:
// import CartButton from "@/modules/layout/components/cart-button"
// import SearchBar from "@/modules/layout/components/search-bar"
// import MegaMenu from "@/modules/layout/components/mega-menu"
// 
// Common Components:
// import LocalizedClientLink from "@/modules/common/components/localized-client-link"
// import { CartStateProvider, useCartState } from "@/modules/common/components/cart-state"
// import { ToastProvider, useToast, ToastStyles } from "@/modules/common/components/toast"
// 
// ======================================== 