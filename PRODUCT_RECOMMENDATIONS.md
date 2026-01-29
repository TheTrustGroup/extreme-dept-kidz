# Product Recommendations Implementation

## Overview
A reusable, intelligent product recommendation system with priority-based filtering logic and responsive grid layouts.

## Components

### 1. ProductRecommendations Component (`components/product/ProductRecommendations.tsx`)
Reusable component for displaying product recommendations with multiple use cases.

**Features:**
- Multiple recommendation types
- Responsive grid (2/3/4 columns)
- Smart filtering logic
- Smooth animations
- Theme-aware styling

### 2. Recommendation Utilities (`lib/utils/product-recommendations.ts`)
Core recommendation logic with priority-based filtering.

**Priority Order:**
1. Same category products
2. Same collection products (based on category slug patterns)
3. Similar price range (±20% tolerance)
4. New arrivals (products with "new" tag or created recently)
5. Random selection from remaining products

## Usage Examples

### 1. "You May Also Like" on Product Pages

```tsx
import { ProductRecommendations } from "@/components/product/ProductRecommendations";

<ProductRecommendations
  currentProduct={product}
  allProducts={allProducts}
  type="you-may-also-like"
  limit={4}
/>
```

### 2. "Complete the Look" Section

```tsx
<ProductRecommendations
  currentProduct={product}
  allProducts={allProducts}
  type="complete-the-look"
  title="Complete the Look"
  limit={4}
/>
```

### 3. "Popular in Category" on Collection Pages

```tsx
<ProductRecommendations
  allProducts={allProducts}
  type="popular-in-category"
  categoryId={category.id}
  limit={6}
/>
```

### 4. "Recently Viewed" Products

```tsx
<ProductRecommendations
  allProducts={allProducts}
  type="recently-viewed"
  limit={4}
/>
```

### 5. Custom Title

```tsx
<ProductRecommendations
  currentProduct={product}
  allProducts={allProducts}
  type="you-may-also-like"
  title="Customers Also Bought"
  limit={4}
/>
```

## Recommendation Types

| Type | Description | Required Props |
|------|-------------|---------------|
| `you-may-also-like` | Standard recommendations based on category/price | `currentProduct`, `allProducts` |
| `complete-the-look` | Style recommendations (same as you-may-also-like) | `currentProduct`, `allProducts` |
| `popular-in-category` | Products from specific category | `allProducts`, `categoryId` |
| `recently-viewed` | Recently viewed products (requires localStorage/API) | `allProducts` |
| `frequently-bought-together` | Analytics-based recommendations (future) | `currentProduct`, `allProducts` |

## Options

```tsx
interface RecommendationOptions {
  /** Maximum number of recommendations */
  limit?: number; // Default: 4
  
  /** Exclude out-of-stock products */
  excludeOutOfStock?: boolean; // Default: false
  
  /** Price range tolerance (percentage) */
  priceRangeTolerance?: number; // Default: 0.2 (20%)
}
```

## Responsive Grid

The component automatically handles responsive layouts:

- **Mobile (< 768px)**: 2 columns
- **Tablet (768px - 1024px)**: 3 columns
- **Desktop (> 1024px)**: 4 columns

Grid uses CSS Grid with gap spacing:
```tsx
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

## Recommendation Logic Details

### Priority 1: Same Category
Filters products with matching `category.id`. If enough products found, returns shuffled results.

### Priority 2: Same Collection
Extracts collection name from category slug (e.g., "boys-t-shirts" → "boys"). Includes products from same collection but different categories.

### Priority 3: Similar Price Range
Filters products within ±20% price range (configurable via `priceRangeTolerance`).

### Priority 4: New Arrivals
Includes products with "new" tag or created within last 30 days.

### Priority 5: Random Fallback
If not enough products from above criteria, fills remaining slots with random products.

## Performance Considerations

- **Memoization**: Recommendations are calculated using `useMemo` to prevent unnecessary recalculations
- **Lazy Loading**: First 2 products use `priority` prop for faster LCP
- **Image Optimization**: Uses `fetchPriority` based on position in grid
- **Suspense Boundaries**: Recommendations can stream in separately from main content

## Integration Points

### Product Page
Already integrated in `app/products/[slug]/ProductPageClient.tsx`:
- Fetches all products on server
- Passes to client component
- Renders in Suspense boundary for streaming

### Collection Pages
Can be added to collection pages for "Popular in Category":
```tsx
<ProductRecommendations
  allProducts={products}
  type="popular-in-category"
  categoryId={category.id}
  limit={6}
/>
```

## Future Enhancements

1. **Recently Viewed**: Implement localStorage tracking
2. **Frequently Bought Together**: Add analytics/ML-based recommendations
3. **Personalization**: User-based recommendations (requires user tracking)
4. **A/B Testing**: Test different recommendation algorithms
5. **Performance**: Add caching for recommendation calculations

## Files Created/Modified

### New Files
- `lib/utils/product-recommendations.ts` - Recommendation logic utilities
- `components/product/ProductRecommendations.tsx` - Reusable component

### Modified Files
- `app/products/[slug]/ProductPageClient.tsx` - Updated to use new component
- `app/products/[slug]/page.tsx` - Fetches all products for recommendations

## Testing

To test recommendations:

1. **Same Category**: View a product, check recommendations show same category
2. **Same Collection**: View a "boys" product, check other "boys" categories appear
3. **Price Range**: View a mid-range product, check similar-priced products appear
4. **New Arrivals**: If no matches, check new products appear
5. **Responsive**: Test grid layout on mobile/tablet/desktop

## Example Output

```
Product: "Boys Classic T-Shirt" (Category: Boys > T-Shirts, Price: ₵150)

Recommendations (Priority Order):
1. Boys Graphic T-Shirt (Same category, ₵160)
2. Boys Polo Shirt (Same collection, ₵180)
3. Girls Classic T-Shirt (Similar price, ₵145)
4. Boys Hoodie (New arrival, ₵200)
```
