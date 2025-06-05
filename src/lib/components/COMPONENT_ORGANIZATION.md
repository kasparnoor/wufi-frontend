# 🎯 Component Organization Guide

## **The System: Two-Layer Architecture**

### **Layer 1: Foundation Components** (`src/lib/components/`)
**Purpose**: Reusable, foundational components that don't belong to any specific feature

```
src/lib/components/
├── ui/          # shadcn/ui primitives (Button, Input, Dialog, etc.)
├── wufi/        # Wufi brand-specific components (WufiButton, EmailInput, etc.)
└── index.ts     # Re-exports foundation components only
```

### **Layer 2: Feature Components** (`src/modules/`)
**Purpose**: Feature-specific components organized by business domain

```
src/modules/
├── account/components/     # Account management (Login, Register, Dashboard)
├── cart/components/        # Shopping cart (CartItem, CartSummary)
├── checkout/components/    # Checkout flow (Payment, Shipping, Review)
├── layout/components/      # Layout & navigation (Header, Footer, MegaMenu)
├── products/components/    # Product display (ProductCard, ProductPreview)
├── common/components/      # Shared feature components (Modal, DeleteButton)
└── ...
```

## **Import Strategy**

### ✅ **For Foundation Components**
```tsx
// Import UI primitives and brand components
import { Button, Input, Dialog, WufiButton, EmailInput } from "@/lib/components"
```

### ✅ **For Feature Components**
```tsx
// Import directly from the feature module
import CartButton from "@/modules/layout/components/cart-button"
import ProductCard from "@/modules/products/components/product-card"
import Login from "@/modules/account/components/login"
```

## **Decision Tree: Where Does This Component Go?**

### 🤔 **Ask Yourself:**

1. **Is it a UI primitive?** (Button, Input, Dialog, etc.)
   → `src/lib/components/ui/`

2. **Is it Wufi brand-specific?** (WufiButton, EmailInput, etc.)
   → `src/lib/components/wufi/`

3. **Does it belong to a specific feature?** (Cart, Checkout, Account, etc.)
   → `src/modules/{feature}/components/`

4. **Is it shared across multiple features but not a UI primitive?**
   → `src/modules/common/components/`

## **Examples**

### ✅ **Foundation Components**
- `Button` → `src/lib/components/ui/button.tsx`
- `WufiButton` → `src/lib/components/wufi/wufi-button/`
- `Input` → `src/lib/components/ui/input.tsx`
- `EmailInput` → `src/lib/components/wufi/email-input/`

### ✅ **Feature Components**
- `CartButton` → `src/modules/layout/components/cart-button/`
- `ProductCard` → `src/modules/products/components/product-card/`
- `CheckoutForm` → `src/modules/checkout/components/checkout-form/`
- `AccountDashboard` → `src/modules/account/components/dashboard/`

### ✅ **Shared Feature Components**
- `Modal` → `src/modules/common/components/modal/`
- `DeleteButton` → `src/modules/common/components/delete-button/`
- `LoadingSpinner` → `src/modules/common/components/loading-spinner/`

## **Benefits of This System**

1. **🎯 Clear Mental Model**: Foundation vs Feature
2. **📁 Logical Organization**: Components grouped by purpose
3. **🔍 Easy to Find**: Know exactly where to look
4. **🚀 Scalable**: Easy to add new features without confusion
5. **🔄 Maintainable**: Changes stay within their domain

## **Migration Complete!**

The confusing `src/lib/components/layout/` directory has been removed. All layout components are now properly organized in `src/modules/layout/components/`.

**No more confusion! 🎉** 