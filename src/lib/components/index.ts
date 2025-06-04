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
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
export { Checkbox } from "./ui/checkbox"
export { RadioGroup, RadioGroupItem } from "./ui/radio-group"
export { Separator } from "./ui/separator"

// Modern component replacements (enhanced shadcn)
export { ModernInput } from "./ui/modern-input"
export { ModernTooltip, InfoTooltip, WufiTooltip } from "./ui/modern-tooltip"

// Toast system - now from modules
export { ToastProvider, useToast, ToastStyles } from "@modules/common/components/toast"

// ============= WUFI COMPONENTS (Brand-specific) =============
// Wufi-specific components that use ModernInput internally
export { default as WufiButton } from "./wufi/wufi-button"
export { default as EmailInput } from "./wufi/email-input"
export { default as PhoneInput } from "./wufi/phone-input"
export { default as EstonianAddressInput } from "./wufi/estonian-address-input"

// ============= MEDUSA COMPONENTS (E-commerce) =============
// Re-export from modules
export { default as LineItemOptions } from "@modules/common/components/line-item-options"
export { default as LineItemPrice } from "@modules/common/components/line-item-price"
export { default as LineItemUnitPrice } from "@modules/common/components/line-item-unit-price"
export { default as CartTotals } from "@modules/common/components/cart-totals"
export { CartStateProvider, useCartState } from "@modules/common/components/cart-state"
export { default as InteractiveLink } from "@modules/common/components/interactive-link"
export { default as LocalizedClientLink } from "@modules/common/components/localized-client-link"

// Account components
export { default as Login } from "@modules/account/components/login"
export { default as Register } from "@modules/account/components/register"

// Common utility components
export { default as ErrorMessage } from "@modules/checkout/components/error-message"
export { SubmitButton } from "@modules/checkout/components/submit-button"

// Recovered components
export { default as DeleteButton } from "@modules/common/components/delete-button"
export { default as Modal } from "@modules/common/components/modal"
export { default as Divider } from "@modules/common/components/divider"
export { default as NativeSelect } from "@modules/common/components/native-select"
export { default as Radio } from "@modules/common/components/radio"
export { default as CartMismatchBanner } from "@modules/layout/components/cart-mismatch-banner"
export { default as Search } from "@modules/store/components/search"

// ============= LAYOUT COMPONENTS (Layout & utility) =============
// Re-export from modules
export { BentoGrid, BentoCard } from "@modules/common/components/bento-grid"
export { default as FilterRadioGroup } from "@modules/common/components/filter-radio-group"

// Layout components
export { default as CartButton } from "@modules/layout/components/cart-button"
export { default as SearchBar } from "@modules/layout/components/search-bar"
export { default as CountrySelect } from "@modules/layout/components/country-select"
export { default as MegaMenu } from "@modules/layout/components/mega-menu"

// Home components
export { default as Hero } from "@modules/home/components/hero"
export { default as FeaturedProducts } from "@modules/home/components/featured-products"

// Product components
export { default as ProductPreview } from "@modules/products/components/product-preview"

// ============= MEDUSA UI (Legacy support) =============
// Re-export commonly used Medusa UI components (aliased to avoid conflicts)
export { 
  Button as MedusaButton, 
  Container,
  Text,
  Heading,
  Table,
  Badge,
  IconBadge,
  clx
} from "@medusajs/ui"

// Additional Medusa UI components (aliased)
export { 
  Label as MedusaLabel,
  Select as MedusaSelect,
  Textarea as MedusaTextarea,
  Input as MedusaInput,
  Checkbox as MedusaCheckbox,
  RadioGroup as MedusaRadioGroup
} from "@medusajs/ui" 