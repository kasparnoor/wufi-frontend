# Wufi Component System Guide

This document explains how the Wufi storefront's unified component system works, integrating both Medusa UI components and shadcn/ui components.

## Component Locations

### 1. shadcn/ui Components
**Location**: `src/lib/components/ui/`
**Import from**: `@lib/components/ui`

These are modern, accessible components built with Radix UI primitives:
- `Button` - shadcn button component
- `Input` - shadcn input component  
- `Label` - shadcn label component
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` - shadcn select components
- `Textarea` - shadcn textarea component
- `Form`, `FormControl`, `FormDescription`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` - React Hook Form integration

### 2. Medusa UI Components  
**Location**: Re-exported from `@medusajs/ui`
**Import from**: `@lib/components/ui` (for unified imports) or `@medusajs/ui` (direct)

These are the official Medusa design system components:
- `MedusaButton` (aliased to avoid conflict with shadcn Button)
- `Container`, `Text`, `Heading`, `Table`, `Badge`, `IconBadge`, `clx`

### 3. Custom Wufi Components
**Location**: `src/modules/common/components/`
**Import from**: `@lib/components/ui` (for unified imports) or direct module paths

These are custom components built for the Wufi brand:
- `WufiButton` - Brand-styled button with yellow accent
- `WufiTooltip`, `InfoTooltip` - Custom tooltip components  
- `Modal` - Custom modal component
- `NativeSelect` - Enhanced native select component
- `ToastProvider`, `useToast`, `ToastStyles` - Toast notification system
- `Divider` - Custom divider component

## Component Overlaps & Conflict Resolution

⚠️ **Several components exist in both systems with the same functionality:**

| Component Type | shadcn/ui (Preferred) | Medusa UI (Aliased) | Recommendation |
|----------------|----------------------|-------------------|----------------|
| **Button** | `Button` | `MedusaButton` | Use shadcn `Button` for new UI |
| **Input** | `Input` | `MedusaInput` | Use shadcn `Input` for forms |
| **Label** | `Label` | `MedusaLabel` | Use shadcn `Label` with forms |
| **Select** | `Select` | `MedusaSelect` | Use shadcn `Select` for new dropdowns |
| **Textarea** | `Textarea` | `MedusaTextarea` | Use shadcn `Textarea` for forms |

### Why shadcn is Preferred for Overlapping Components
1. **Better Accessibility** - Built on Radix UI primitives
2. **React Hook Form Integration** - Seamless form validation
3. **Perfect Centering** - No more alignment issues
4. **Modern Patterns** - Latest React and TypeScript practices
5. **Consistent API** - Similar patterns across all components

### Import Strategy for Overlapping Components

```tsx
import { 
  // Preferred: shadcn components for new forms/UI
  Button, Input, Label, Select, Textarea,
  
  // Aliased: Medusa components for existing code
  MedusaButton, MedusaInput, MedusaLabel,
  
  // Unique: Medusa components with no shadcn equivalent
  Container, Text, Table, clx
} from "@lib/components/ui"
```

## Recommended Usage Patterns

### For New Forms (Recommended)
Use shadcn components with React Hook Form for the best developer experience:

```tsx
import { 
  Button, 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  Input 
} from "@lib/components/ui"

// Perfect centering, accessibility, validation
```

### For Existing Medusa Integration
Continue using Medusa components where they're already established:

```tsx
import { Container, Text, Table } from "@lib/components/ui"
// or
import { Container, Text, Table } from "@medusajs/ui"
```

### For Wufi Brand Elements
Use custom Wufi components for brand consistency:

```tsx
import { WufiButton, WufiTooltip } from "@lib/components/ui"

<WufiButton variant="primary">Brand Button</WufiButton>
```

## Migration Strategy

### Immediate Use
- ✅ New forms → shadcn components
- ✅ New UI elements → shadcn components  
- ✅ Brand elements → Custom Wufi components
- ✅ Data display → Continue with Medusa components

### Gradual Migration
- Replace problematic components (like the old Input) with shadcn equivalents
- Keep working Medusa components until there's a need to change
- Maintain visual consistency with custom Wufi styling

## Import Examples

### Unified Import (Recommended)
```tsx
import { 
  // shadcn components
  Button, Input, Label, Form, FormField,
  // Medusa components  
  MedusaButton, Container, Text, Table,
  // Custom Wufi components
  WufiButton, WufiTooltip, Modal
} from "@lib/components/ui"
```

### Direct Imports (When Needed)
```tsx
// For shadcn CLI additions
import { Button } from "@lib/components/ui/button"

// For specific Medusa components
import { Heading } from "@medusajs/ui"

// For custom components
import WufiButton from "@modules/common/components/wufi-button"
```

## Adding New Components

### shadcn Components
```bash
npx shadcn@latest add <component-name>
```
Components install to `src/lib/components/ui/` and are auto-imported in the index.

### Custom Components  
Create in `src/modules/common/components/` and add to the unified export in `src/lib/components/ui/index.ts`.

## Best Practices

1. **Use unified imports** from `@lib/components/ui` for consistency
2. **Prefer shadcn components** for new form elements and interactive UI
3. **Keep Medusa components** for data display and layouts where they work well
4. **Use Wufi components** for brand-specific styling and unique functionality
5. **Follow accessibility patterns** established by shadcn components
6. **Maintain visual consistency** with the Wufi design system

This system provides the best of all worlds: modern, accessible components from shadcn, proven e-commerce components from Medusa, and custom brand elements for Wufi. 