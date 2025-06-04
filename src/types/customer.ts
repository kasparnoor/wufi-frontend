// Customer Dashboard Types - Simplified for Order Placement Focus

export interface Pet {
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other'
  breed?: string
  age?: number
  food_type?: string
  next_order?: string  // Changed from next_delivery to next_order
  weight?: number
  notes?: string
}

export interface AccountStats {
  total_orders: number
  active_subscriptions: number
  paused_subscriptions: number
  total_spent: number
  member_since: string
  next_order: string | null  // Changed from next_delivery to next_order
  overdue_orders: number     // Changed from overdue_deliveries to overdue_orders
}

export interface SubscriptionSummary {
  id: string
  status: 'active' | 'paused' | 'cancelled'
  interval: string
  next_delivery: string  // Keep for internal use but represents order placement date
  days_until_next: number
  is_overdue: boolean
  items: SubscriptionItem[]
  total_items: number
  estimated_total: number
  can_modify: boolean
}

export interface SubscriptionItem {
  variant_id: string
  quantity: number
  unit_price: number
  product_title?: string
}

export interface OrderInfo {  // Renamed from DeliveryInfo to OrderInfo
  id: string
  status: string
  next_order: string         // Changed from next_delivery to next_order
  days_until_next: number
}

export interface OrderSummary {
  id: string
  display_id: number
  status: string
  total: number
  currency_code: string
  created_at: string
  items_count: number
  is_subscription_order: boolean
}

export interface QuickAction {
  action: string
  label: string
  count: number
  enabled: boolean
}

export interface NotificationData {
  overdue_count: number
  next_order_days: number | null  // Changed from next_delivery_days to next_order_days
  requires_attention: boolean
  missing_pets: boolean
  setup_incomplete: boolean
}

export interface DashboardData {
  customer: {
    id: string
    email: string
    first_name: string
    last_name: string
    pets: Pet[]
  }
  account_stats: AccountStats
  subscriptions: {
    active: SubscriptionSummary[]
    paused: SubscriptionSummary[]
    total_count: number
  }
  upcoming_deliveries: OrderInfo[]  // Changed from DeliveryInfo[] to OrderInfo[]
  recent_orders: OrderSummary[]
  quick_actions: QuickAction[]
  notifications: NotificationData
}

export interface SubscriptionDetail {
  id: string
  status: 'active' | 'paused' | 'cancelled'
  interval: string
  next_delivery: string  // Keep for internal use but represents order placement date
  items: SubscriptionDetailItem[]
  delivery_info: {
    address: {
      address_1: string
      city: string
      postal_code: string
    }
  }
  modification_history: ModificationHistory[]
  estimated_total: number
  can_modify: boolean
  is_overdue: boolean
}

export interface SubscriptionDetailItem {
  variant_id: string
  quantity: number
  unit_price: number
  product_title: string
}

export interface ModificationHistory {
  action: string
  timestamp: string
  reason: string
}

export interface AccountSetupData {
  token: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  pets?: Pet[]
} 