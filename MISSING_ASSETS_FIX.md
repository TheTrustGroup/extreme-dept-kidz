# Missing Assets Fix Guide

## Issue: apple-touch-icon.png Missing

**Status:** ⚠️ **Action Required**

The file `/public/apple-touch-icon.png` is referenced in:
- `app/layout.tsx` (line 98)
- `public/site.webmanifest` (line 22)

But the file does not exist in the `/public` directory.

## Solution

### Option 1: Create from Existing Logo (Recommended)

1. Use the existing logo file: `public/Extreme Logo.png`
2. Resize to 180x180px
3. Save as `public/apple-touch-icon.png`

**Using ImageMagick:**
```bash
convert "public/Extreme Logo.png" -resize 180x180 -background transparent -gravity center -extent 180x180 public/apple-touch-icon.png
```

**Using Online Tool:**
- Upload `Extreme Logo.png` to any image resizer
- Set dimensions to 180x180px
- Download as `apple-touch-icon.png`
- Place in `/public` directory

### Option 2: Generate from Favicon

If you have a favicon.ico:
```bash
# Convert favicon to PNG and resize
convert favicon.ico -resize 180x180 public/apple-touch-icon.png
```

### Option 3: Create Placeholder

Create a simple 180x180px PNG with your brand colors:
- Background: Cream (#fefdfb)
- Text/Logo: Navy (#102a43)
- Size: 180x180px

## Verification

After creating the file:
1. Run `npm run build` - should not show 404 errors
2. Check browser DevTools → Network tab
3. Verify `/apple-touch-icon.png` loads with 200 status
4. Test on iOS device - icon should appear when adding to home screen

## Additional Missing Icons

Check if these also exist:
- `/favicon.ico` (referenced in layout.tsx)
- `/favicon-16x16.png` (referenced in manifest)
- `/favicon-32x32.png` (referenced in manifest)

If missing, create them using the same process.
