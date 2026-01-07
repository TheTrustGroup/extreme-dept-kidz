# Responsive Design Guide

## Breakpoints

The application uses the following responsive breakpoints:

- **xs (Extra Small)**: 375px - Small mobile devices (iPhone SE, etc.)
- **sm (Small)**: 640px - Large mobile devices
- **md (Medium)**: 768px - Tablets (iPad, iPad Mini)
- **lg (Large)**: 1024px - Small desktops/large tablets
- **xl (Extra Large)**: 1280px - Desktop screens
- **2xl (2X Large)**: 1536px - Large desktop screens

## Test Points

### Mobile (375px, 390px, 428px)
- ✅ Header logo scales appropriately
- ✅ Mobile menu button visible
- ✅ Navigation hidden, accessible via hamburger menu
- ✅ Product grids show 1 column
- ✅ Forms stack vertically
- ✅ Buttons full-width on mobile
- ✅ Cart drawer full-width on mobile
- ✅ Typography scales appropriately

### Tablet (768px, 834px)
- ✅ Header shows icons but navigation still in menu
- ✅ Product grids show 2 columns
- ✅ Forms can use 2-column layouts where appropriate
- ✅ Filter sidebar accessible via button
- ✅ Cart drawer uses max-width constraint
- ✅ Footer shows 2 columns

### Desktop (1280px, 1440px, 1920px)
- ✅ Full navigation visible in header
- ✅ Product grids show 3-4 columns
- ✅ Filter sidebar visible on left
- ✅ Two-column checkout layout
- ✅ Footer shows 4 columns
- ✅ Optimal spacing and typography

## Component-Specific Responsive Behavior

### Header
- **Mobile (< 1024px)**: Hamburger menu, compact logo
- **Desktop (≥ 1024px)**: Full navigation, larger logo
- Logo scales: `h-12 xs:h-14 sm:h-16 md:h-20 lg:h-24 xl:h-28`
- Navigation breakpoint: `xl` (1280px) for full nav

### Product Grid
- **Mobile**: 1 column
- **Tablet (768px+)**: 2 columns
- **Desktop (1024px+)**: 3 columns
- **Large Desktop (1280px+)**: 4 columns
- Gap spacing: `gap-4 xs:gap-5 sm:gap-6 lg:gap-8 xl:gap-10`

### Checkout Form
- **Mobile**: Single column, stacked order summary
- **Desktop**: Two-column layout (form + sidebar)
- Progress indicator adapts to screen size
- Form fields stack on mobile, 2-column on tablet+
- Navigation buttons stack on mobile

### Product Gallery
- **Mobile**: Thumbnails below main image (4 columns)
- **Desktop**: Thumbnails to the right (1 column)
- Main image: Square on mobile, fixed height on desktop
- Touch swipe support on mobile

### Cart Drawer
- **Mobile**: Full-width drawer
- **Tablet+**: Max-width constraint (sm:max-w-md)
- Padding adapts: `p-4 xs:p-5 sm:p-6`

### Footer
- **Mobile**: 1 column
- **Tablet (768px+)**: 2 columns
- **Desktop (1024px+)**: 4 columns
- Newsletter form adapts to column width

## Spacing Scale

Responsive spacing uses progressive enhancement:
- Base: `py-12` (mobile)
- xs: `xs:py-14`
- sm: `sm:py-16`
- md: `md:py-20`
- lg: `lg:py-24`
- xl: `xl:py-32`

## Typography Scale

Headings scale responsively:
- H1: `text-2xl xs:text-3xl sm:text-4xl`
- H2: `text-2xl xs:text-3xl sm:text-4xl`
- Body: `text-base xs:text-lg`

## Testing Checklist

### Mobile (375px, 390px, 428px)
- [ ] Header logo visible and properly sized
- [ ] Mobile menu opens/closes smoothly
- [ ] Product cards display correctly (1 column)
- [ ] Forms are usable (no horizontal scroll)
- [ ] Buttons are tappable (min 44x44px)
- [ ] Text is readable without zooming
- [ ] Cart drawer doesn't overflow
- [ ] Images load and display correctly

### Tablet (768px, 834px)
- [ ] Product grid shows 2 columns
- [ ] Filter sidebar accessible via button
- [ ] Forms use appropriate column layouts
- [ ] Navigation still accessible
- [ ] Footer shows 2 columns
- [ ] Typography scales appropriately

### Desktop (1280px, 1440px, 1920px)
- [ ] Full navigation visible
- [ ] Product grid shows 3-4 columns
- [ ] Filter sidebar visible
- [ ] Two-column checkout layout
- [ ] Footer shows 4 columns
- [ ] Optimal spacing throughout
- [ ] No excessive white space

## Common Responsive Patterns

### Container Padding
```tsx
className="px-3 xs:px-4 sm:px-6 lg:px-8"
```

### Section Spacing
```tsx
className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24"
```

### Grid Layouts
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

### Typography
```tsx
className="text-2xl xs:text-3xl sm:text-4xl"
```

### Buttons
```tsx
className="w-full xs:w-auto"
```

## Performance Considerations

- Images use responsive `sizes` attribute
- Lazy loading for below-the-fold content
- Conditional rendering for mobile/desktop components
- Touch-optimized interactions on mobile

## Browser Testing

Test on:
- Chrome (mobile & desktop)
- Safari (iOS & macOS)
- Firefox
- Edge

## Device Testing

Physical devices:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (428px)
- iPad (768px)
- iPad Pro (834px)
- Desktop (1280px+)

## Notes

- All breakpoints use mobile-first approach
- `xs` breakpoint added for very small devices (375px)
- Touch targets minimum 44x44px on mobile
- No horizontal scrolling on any device
- Text remains readable at all sizes


