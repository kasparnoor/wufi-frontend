// shadcn/ui components
export { Button } from "./button"
export { Input } from "./input"
export { Label } from "./label"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
export { Textarea } from "./textarea"
export { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "./form"

// New shadcn components for migration
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
export { Checkbox } from "./checkbox"
export { RadioGroup, RadioGroupItem } from "./radio-group"
export { Separator } from "./separator"

// Modern component replacements
export { ModernInput } from "./modern-input"
export { ModernTooltip, InfoTooltip, KrapsTooltip } from "./modern-tooltip"

// Re-export commonly used Medusa UI components for cohesive imports
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

// Medusa UI components aliased to avoid conflicts
export { 
  Label as MedusaLabel,
  Select as MedusaSelect,
  Textarea as MedusaTextarea,
  Input as MedusaInput,
  Checkbox as MedusaCheckbox,
  RadioGroup as MedusaRadioGroup
} from "@medusajs/ui"


export { ToastProvider, useToast, ToastStyles } from "@modules/common/components/toast" 