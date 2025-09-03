# 🎯 Foundation Component System

**Clean, logical foundation for all UI primitives and brand components**

## 📁 Structure

```
src/lib/components/
├── ui/          # shadcn/ui primitives (Button, Input, Dialog, etc.)
├── kraps/       # Kraps brand-specific components  
└── index.ts     # Foundation component exports ⭐
```

## 🚀 What's Included

### **UI Primitives** (`ui/`)
Modern, accessible components based on shadcn/ui:
- `Button`, `Input`, `Label`, `Dialog`
- `Select`, `Textarea`, `Checkbox`, `RadioGroup`
- `Form` components with validation
- `Tooltip`, `Separator`
- **Enhanced**: `ModernInput`, `ModernTooltip`
- **Skeletons**: Loading states for all components

### **Kraps Brand Components** (`kraps/`)
Kraps-specific branded components:
- `KrapsButton` - Brand-styled button
- `EmailInput` - Enhanced email input with validation
- `PhoneInput` - Estonian phone number input
- `EstonianAddressInput` - Estonian address autocomplete

## 💡 Import Strategy

### ✅ **Foundation Components** (from `@/lib/components`)
```tsx
import { 
  // UI primitives
  Button, Input, Dialog, Form,
  
  // Enhanced components  
  ModernInput, ModernTooltip, InfoTooltip,
  
  // Brand components
  KrapsButton, EmailInput, PhoneInput,
  
  // Utilities
  Toaster, Separator
} from "@/lib/components"
```

### ✅ **Feature Components** (from modules)
```tsx
import CartButton from "@/modules/layout/components/cart-button"
import ProductCard from "@/modules/products/components/product-card"
import Login from "@/modules/account/components/login"
```

## 🎨 Usage Examples

### Perfect Form with Enhanced Components
```tsx
import { Form, ModernInput, WufiButton } from "@/lib/components"

<Form>
  <ModernInput 
    type="email" 
    label="Email Address" 
    errors={["Invalid email format"]}
    touched={true}
  />
  <KrapsButton variant="primary">Subscribe</KrapsButton>
</Form>
```

### Brand-Specific Components
```tsx
import { EmailInput, PhoneInput, EstonianAddressInput } from "@/lib/components"

<EmailInput label="Your Email" />
<PhoneInput placeholder="Phone Number" />
<EstonianAddressInput label="Delivery Address" />
```

## 🎯 Decision Tree

### **Should it go in `@/lib/components`?**
1. **Is it a UI primitive?** (Button, Input, Dialog) → `ui/`
2. **Is it Kraps brand-specific?** (KrapsButton, EmailInput) → `kraps/`
3. **Is it feature-specific?** (CartButton, ProductCard) → `@/modules/{feature}/`

## 🔄 Migration Benefits

### ✅ **Problems Solved**
- **Clear Separation**: Foundation vs Feature components
- **No Confusion**: Know exactly where to import from
- **Better Organization**: Logical grouping by purpose
- **Enhanced UX**: Modern, accessible components
- **Brand Consistency**: Kraps-specific styling

### 📊 Before vs After

#### ❌ Before (Confusing)
```tsx
// Mixed imports from multiple locations
import Input from "@modules/common/components/input"
import KrapsButton from "@modules/layout/components/kraps-button"  
import { Button } from "@lib/components/ui"
```

#### ✅ After (Clean)
```tsx
// Foundation components from one place
import { ModernInput, KrapsButton, Button } from "@/lib/components"

// Feature components from their modules
import CartButton from "@/modules/layout/components/cart-button"
```

## 🎉 Key Takeaway

**Two-layer system: Foundation + Features**
- **Foundation** (`@/lib/components`): UI primitives & brand components
- **Features** (`@/modules/`): Business logic components

**No more confusion about where components belong!** 🎯 