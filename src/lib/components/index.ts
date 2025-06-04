// ========================================
// 🎯 UNIFIED COMPONENT SYSTEM
// Single import point for all components
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

// Modern UI enhancements (alias Input as ModernInput for backward compatibility)
export { Input as ModernInput } from "./ui/input"
export { Tooltip as ModernTooltip } from "./ui/tooltip"

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

// ============= COMMON COMPONENTS =============
export { default as LocalizedClientLink } from "@modules/common/components/localized-client-link"
export { CartStateProvider, useCartState } from "@modules/common/components/cart-state"
export { default as CartTotals } from "@modules/common/components/cart-totals"
export { default as InteractiveLink } from "@modules/common/components/interactive-link"
export { default as LineItemOptions } from "@modules/common/components/line-item-options"
export { default as LineItemPrice } from "@modules/common/components/line-item-price"
export { default as LineItemUnitPrice } from "@modules/common/components/line-item-unit-price"
export { default as DeleteButton } from "@modules/common/components/delete-button"
export { BentoGrid, BentoCard } from "@modules/common/components/bento-grid"
export { default as FilterRadioGroup } from "@modules/common/components/filter-radio-group"
export { default as Divider } from "@modules/common/components/divider"
export { default as Modal } from "@modules/common/components/modal"
export { default as NativeSelect } from "@modules/common/components/native-select"
export { default as Radio } from "@modules/common/components/radio"

// Toast exports
export { ToastProvider, useToast, ToastStyles } from "@modules/common/components/toast"

// ============= LAYOUT COMPONENTS =============
export { default as CartButton } from "@modules/layout/components/cart-button"
export { default as SearchBar } from "@modules/layout/components/search-bar"
export { default as CountrySelect } from "@modules/layout/components/country-select"
export { default as MegaMenu } from "@modules/layout/components/mega-menu"
export { default as CartDropdown } from "@modules/layout/components/cart-dropdown"
export { default as SideMenu } from "@modules/layout/components/side-menu"
export { default as MedusaCTA } from "@modules/layout/components/medusa-cta"

// ============= ACCOUNT COMPONENTS =============
export { default as Dashboard } from "@modules/account/components/dashboard"
export { default as AddressManagement } from "@modules/account/components/address-management"
export { default as BillingManagement } from "@modules/account/components/billing-management"
export { default as OrdersManagement } from "@modules/account/components/orders-management"
export { default as PetManagement } from "@modules/account/components/pet-management"
export { default as ProfileManagement } from "@modules/account/components/profile-management"
export { default as SubscriptionManagement } from "@modules/account/components/subscription-management"
export { default as AccountSetup } from "@modules/account/components/account-setup"
export { default as Login } from "@modules/account/components/login"
export { default as Register } from "@modules/account/components/register"

// ============= CHECKOUT COMPONENTS =============
export { default as DiscountCode } from "@modules/checkout/components/discount-code"
export { default as CheckoutErrorBoundary } from "@modules/checkout/components/checkout-error-boundary"
export { default as AutoshipOptions } from "@modules/checkout/components/autoship-options"
export { default as Addresses } from "@modules/checkout/components/addresses"
export { default as Shipping } from "@modules/checkout/components/shipping"
export { default as Payment } from "@modules/checkout/components/payment"
export { default as Review } from "@modules/checkout/components/review"
export { default as PaymentWrapper } from "@modules/checkout/components/payment-wrapper"
export { default as ErrorMessage } from "@modules/checkout/components/error-message"
export { SubmitButton } from "@modules/checkout/components/submit-button"

// ============= ORDER COMPONENTS =============
export { default as TransferImage } from "@modules/order/components/transfer-image"
export { default as TransferActions } from "@modules/order/components/transfer-actions"

// ============= PRODUCT COMPONENTS =============
export { default as ProductPreview } from "@modules/products/components/product-preview"
export { default as Thumbnail } from "@modules/products/components/thumbnail"

// ============= STORE COMPONENTS =============
export { default as Search } from "@modules/store/components/search"
export { Pagination } from "@modules/store/components/pagination"
export { default as RefinementList } from "@modules/store/components/refinement-list"

// ============= HOME COMPONENTS =============
export { default as FeaturedProducts } from "@modules/home/components/featured-products"

// ============= SHIPPING COMPONENTS =============
export { default as FreeShippingPriceNudge } from "@modules/shipping/components/free-shipping-price-nudge"

// ============= SEARCH COMPONENTS =============
export { default as SearchProductCard } from "@modules/search/components/search-product-card"
export { default as SearchFilters } from "@modules/search/components/search-filters"

// ============= CATEGORY COMPONENTS =============
export { default as CategoryFilters } from "@modules/categories/components/category-filters"
export { default as CategorySearchResults } from "@modules/categories/components/category-search-results" 