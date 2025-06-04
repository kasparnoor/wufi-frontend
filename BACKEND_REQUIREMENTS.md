# Backend API Requirements for Megamenu Implementation

## Overview
We need to implement backend API endpoints to support a high-performance e-commerce megamenu that displays product categories with their subcategories. The implementation uses Medusa Commerce as the primary backend.

## Required API Endpoints

### 1. Categories API
**Endpoint:** `GET /api/categories`

**Purpose:** Fetch product categories with hierarchy and metadata for megamenu display

**Requirements:**
- Return categories with parent-child relationships
- Include category metadata (images, descriptions)
- Support for nested category structures (subcategories)
- Caching for performance (categories change infrequently)

**Expected Response:**
```typescript
interface Category {
  id: string
  name: string
  handle: string  // URL slug
  description?: string
  metadata?: {
    image?: string
    featured?: boolean
  }
  parent_category?: Category
  category_children?: Category[]
}

// Response: Category[]
```

**Current Implementation Status:** ✅ **COMPLETED** - Using Medusa API
```typescript
// Already implemented in: src/app/api/categories/route.ts
const { product_categories } = await sdk.client.fetch(
  "/store/product-categories", {
    query: {
      fields: "*category_children, *products, *parent_category",
      limit: 100
    }
  }
)
```

### 2. Regions API
**Endpoint:** `GET /api/regions`

**Purpose:** Fetch available regions/countries for navigation components

**Requirements:**
- Return regions with country information
- Include currency codes
- Caching for performance

**Expected Response:**
```typescript
interface Region {
  id: string
  name: string
  currency_code: string
  countries: Array<{
    iso_2: string
    iso_3: string
    name: string
    display_name: string
  }>
}

// Response: Region[]
```

**Current Implementation Status:** ✅ **COMPLETED** - Using Medusa API
```typescript
// Already implemented in: src/app/api/regions/route.ts
const { regions } = await sdk.client.fetch("/store/regions", {
  method: "GET",
  cache: "force-cache"
})
```

## Performance Requirements

### Caching Strategy
1. **Categories:** Server-side caching (24 hours) - categories rarely change
2. **Regions:** Server-side caching (24 hours) - regions rarely change

### Response Time Targets
- Categories API: < 100ms (cached)
- Regions API: < 100ms (cached)
- Total megamenu load time: < 200ms

## Database Considerations

### Required Data Points
For the megamenu functionality, ensure your database has:
- Product categories with hierarchy support
- Category `metadata` for images and descriptions
- Category `handle` slugs for URLs
- Parent-child category relationships

### Indexing Recommendations
```sql
-- For faster category queries
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);
CREATE INDEX idx_categories_handle ON categories(handle);
```

## Medusa Configuration

### Required Medusa Features
- Product categories with hierarchy support
- Category metadata handling for images
- Category handle/slug generation

### API Query Optimization
```typescript
// Categories with full hierarchy
fields: "*category_children, *products, *parent_category, *parent_category.parent_category"

// Essential category fields
const requiredFields = [
  "id", "name", "handle", "description", "metadata", 
  "parent_category", "category_children"
]
```

## Current Megamenu Features

### ✅ Implemented Features
1. **2-Column Layout** - Categories on left, subcategories on right
2. **Hover Interaction** - Show subcategories when hovering over main categories  
3. **Category Images** - Display category thumbnails from metadata
4. **Responsive Design** - Proper width constraints (max-w-4xl)
5. **Accessibility** - Keyboard navigation and screen reader support

### 🎯 Current User Experience
- **Main Categories**: Display up to 8 top-level categories
- **Subcategories**: Show on hover with up to 8 subcategories per category
- **Visual Feedback**: Smooth transitions and hover states
- **Estonian Text**: Fully localized for Estonian market

## Error Handling

### Required Error Responses
```typescript
// Server error
{ error: 'Failed to fetch categories', status: 500 }

// No categories found
{ error: 'No categories available', status: 404 }
```

### Fallback Behavior
- If categories API fails, show simple navigation links
- If no subcategories exist, show "view all products" link
- Always provide graceful degradation

## Security Considerations

### Rate Limiting
- Categories API: 100 requests/minute per IP
- Regions API: 100 requests/minute per IP

### Data Validation
- Validate category IDs are valid UUIDs
- Sanitize all string inputs
- Ensure proper category hierarchy

## Monitoring & Analytics

### Key Metrics to Track
1. **API Performance:**
   - Response times for each endpoint
   - Cache hit/miss rates
   - Error rates by endpoint

2. **User Behavior:**
   - Category click-through rates
   - Megamenu hover interactions
   - Subcategory navigation patterns

3. **Business Metrics:**
   - Conversion from megamenu clicks
   - Category page traffic from megamenu

### Recommended Logging
```typescript
// Log megamenu interactions
{
  event: 'megamenu_category_hover',
  category_id: 'cat_123',
  category_name: 'Kassid',
  subcategories_count: 5,
  timestamp: '2024-01-01T00:00:00Z'
}
```

## Testing Requirements

### Unit Tests
- Test category hierarchy building
- Test error handling scenarios
- Test metadata parsing

### Integration Tests
- Test API response formats
- Test cache invalidation
- Test category relationship integrity

### Frontend Integration
- Test megamenu displays correctly
- Test hover interactions work
- Test mobile menu functionality

## Current Implementation Status

### ✅ Completed Features
1. **Categories API** - Fetching categories with full hierarchy
2. **Regions API** - Fetching regions and countries  
3. **Simplified Megamenu** - 2-column layout with categories and subcategories
4. **Caching** - Force-cache enabled on all endpoints
5. **Error Handling** - Basic error responses implemented
6. **Estonian Localization** - All text in Estonian

### 🔄 Future Enhancements (Optional)
1. **Sales Tracking** - Implement bestsellers when sales_count is available
2. **Advanced Caching** - Implement Redis for better cache control
3. **Analytics** - Track user interactions with megamenu
4. **A/B Testing** - Test different layouts and content

## Questions for Backend Team

1. **Category Structure:** Do you have proper category hierarchy set up in Medusa?
2. **Category Metadata:** Are category images stored in the metadata field?
3. **Caching Infrastructure:** What's your current caching setup?
4. **Monitoring Tools:** What tools do you use for API performance tracking?

## Implementation Notes

The current simplified implementation focuses on core functionality:

- **Categories**: Uses `/store/product-categories` with hierarchy expansion
- **Subcategories**: Displayed on hover for better space utilization  
- **Caching**: Utilizes Next.js `force-cache` for optimal performance
- **Responsive**: Properly sized to fit on screen (max-w-4xl)

The system is production-ready and provides excellent user experience for category navigation without requiring complex sales tracking or additional services. 