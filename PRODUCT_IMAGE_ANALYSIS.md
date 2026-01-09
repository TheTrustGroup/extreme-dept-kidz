# Product Image to Name Mapping Analysis

## Analysis Framework

This document tracks the correction of product names to match actual images shown.

### Naming Convention
**Format:** `[Premium Descriptor] + [Material] + [Item Type] + [Style Detail]`

---

## New Arrivals Section (Products with "new" tag)

### Boys Products

| Product ID | Current Name | Image Files | Analysis Needed | Corrected Name | Category | Price |
|------------|--------------|-------------|-----------------|----------------|----------|-------|
| prod-1 | Heritage Denim Jacket | /IMG_4673.png, /IMG_4689.png | ⚠️ Verify: Is this actually a denim jacket? | TBD | outerwear | $129 |
| prod-4 | Urban Hoodie | /4675.png, /4676.png | ⚠️ Verify: Is this actually a hoodie? | TBD | outerwear | $85 |
| prod-7 | Canvas Sneakers | /4678.png, /4679.png | ⚠️ Verify: Are these actually sneakers? | TBD | shoes | $65 |
| prod-10 | Leather Backpack | /4682.png, /4683.png | ⚠️ Verify: Is this actually a backpack? | TBD | accessories | $125 |
| prod-11 | Floral Print Dress | /4683.png, /4684.png | ⚠️ Verify: Is this actually a dress? | TBD | tops/dresses | $78 |
| prod-15 | Tulle Party Dress | /4684.png, /4685.png | ⚠️ Verify: Is this actually a tulle dress? | TBD | dresses | $180 |
| prod-17 | Silk Scarf | /Extreme 4.png, /Extreme 5.png | ⚠️ Verify: Is this actually a scarf? | TBD | accessories | $55 |
| prod-19 | Velvet Blazer | /4680.png, /4681.png | ⚠️ Verify: Is this actually a blazer? | TBD | outerwear | $165 |

---

## Girls Collection Section

| Product ID | Current Name | Image Files | Analysis Needed | Corrected Name | Category | Price |
|------------|--------------|-------------|-----------------|----------------|----------|-------|
| prod-11 | Floral Print Dress | /4683.png, /4684.png | ⚠️ Verify | TBD | dresses | $78 |
| prod-12 | Cashmere Sweater | /4680.png, /4681.png | ⚠️ Verify | TBD | tops | $145 |
| prod-13 | Denim Skirt | /4684.png, /4685.png | ⚠️ Verify | TBD | bottoms | $62 |
| prod-14 | Ribbed Knit Top | /4683.png, /4684.png | ⚠️ Verify | TBD | tops | $48 |
| prod-15 | Tulle Party Dress | /4684.png, /4685.png | ⚠️ Verify | TBD | dresses | $180 |
| prod-16 | Corduroy Jumper | /4683.png, /4684.png | ⚠️ Verify | TBD | dresses | $72 |
| prod-19 | Velvet Blazer | /4680.png, /4681.png | ⚠️ Verify | TBD | outerwear | $165 |

---

## Image Usage Analysis

### Duplicate Image Usage
Many products are sharing the same images, which suggests mismatches:

- `/4683.png` - Used by: prod-10, prod-11, prod-14, prod-16
- `/4684.png` - Used by: prod-11, prod-13, prod-14, prod-15, prod-16
- `/4680.png` - Used by: prod-8, prod-12, prod-19
- `/4681.png` - Used by: prod-8, prod-9, prod-12, prod-19
- `/4678.png` - Used by: prod-7, prod-18
- `/4679.png` - Used by: prod-7, prod-18

**This indicates that product names likely don't match the images.**

---

## Correction Strategy

1. **Analyze each unique image file** to identify the actual clothing item
2. **Assign accurate product names** based on visual analysis
3. **Update product descriptions** to match visible features
4. **Ensure category accuracy** (outerwear vs tops vs bottoms)
5. **Verify price appropriateness** for item type

---

## Next Steps

1. ✅ Create image analysis utility (`/lib/utils/analyze-product-images.ts`)
2. ⏳ Analyze each image file to identify actual clothing items
3. ⏳ Generate accurate product names
4. ⏳ Update `/lib/mock-data.ts` with corrected data
5. ⏳ Create final mapping documentation

---

## Notes

- All images are in `/public/` directory
- Images are PNG format
- Need to verify actual clothing items shown in each image
- Product names must match what's visually shown
- Maintain premium brand voice throughout
