# 📸 Image Upload Guide - Admin Dashboard

## ✅ How to Upload Images Successfully

### Step-by-Step Instructions:

1. **Navigate to Product Form**
   - Go to `/admin/products/new` (for new products)
   - Or `/admin/products/[id]` (to edit existing products)

2. **Upload Images from Your Device**
   - Scroll to the **"Product Images"** section
   - You'll see a drag-and-drop area with the text: *"Upload images from your device or drag and drop"*
   
3. **Choose Your Upload Method:**
   - **Option A: Click to Browse**
     - Click anywhere in the upload area
     - Select images from your device's gallery/camera roll
     - You can select multiple images at once
   
   - **Option B: Drag and Drop**
     - Drag image files from your computer
     - Drop them into the upload area
   
   - **Option C: Camera (Mobile)**
     - On mobile devices, you can take photos directly
     - The camera option will appear automatically

4. **Wait for Upload to Complete**
   - You'll see "Uploading images..." with a spinner
   - Wait until the upload completes
   - Images will appear in a grid below the upload area

5. **Verify Images Are Uploaded**
   - You should see thumbnail previews of your uploaded images
   - The first image will be marked as "Primary"
   - You can reorder images by clicking the arrow buttons
   - You can remove images by clicking the X button

6. **Fill Out All Required Fields**
   - **Product Name** (required)
   - **Description** (required, minimum 10 characters)
   - **SKU** (required)
   - **Price** (required)
   - **Category** (required - select from dropdown)
   - **At least one image** (required)

7. **Click "Save Changes" or "Create Product"**
   - The form will validate all fields
   - If there are errors, you'll see toast notifications
   - On success, you'll be redirected to the products list

---

## ⚠️ Common Issues and Solutions

### Issue: "The string did not match the expected pattern" Error

**Cause:** This error typically occurs when:
- A required field is empty
- The form validation is triggered before images are fully uploaded
- Browser HTML5 validation conflicts with React Hook Form

**Solutions:**
1. **Ensure all required fields are filled:**
   - Product Name ✓
   - Description (at least 10 characters) ✓
   - SKU ✓
   - Price ✓
   - Category (select from dropdown) ✓
   - At least one image uploaded ✓

2. **Wait for image upload to complete:**
   - Don't click "Save" while images are still uploading
   - Wait for the "Uploading images..." message to disappear
   - Verify images appear in the grid before submitting

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check the Console tab for any error messages
   - Look for validation errors

4. **Try these steps:**
   - Refresh the page
   - Clear browser cache
   - Try uploading images one at a time
   - Ensure you have a stable internet connection

---

## 🔧 Technical Details

### Image Upload Process:
1. Images are uploaded to `/public/uploads/` directory
2. Each image gets a unique filename: `timestamp-randomstring.extension`
3. Images are accessible at `/uploads/filename.jpg`
4. Maximum file size: 5MB per image
5. Supported formats: JPEG, PNG, WebP, GIF
6. Maximum images per product: 10

### Form Validation:
- Uses React Hook Form with Zod schema validation
- Browser HTML5 validation is disabled (`noValidate` attribute)
- All validation happens through React Hook Form
- Error messages appear as toast notifications

---

## 📝 Best Practices

1. **Image Quality:**
   - Use high-quality images (but keep file size under 5MB)
   - Recommended: 1200x1200px or larger
   - Use JPEG for photos, PNG for graphics with transparency

2. **Image Order:**
   - The first image is used as the primary/featured image
   - Reorder images by clicking the arrow buttons
   - Make sure your best image is first

3. **Alt Text:**
   - Add descriptive alt text for each image (for SEO and accessibility)
   - Alt text fields appear below the image grid

4. **Before Submitting:**
   - Double-check all required fields are filled
   - Verify images are uploaded and visible
   - Ensure prices are correct (numbers only, no currency symbols)
   - Select the correct category

---

## 🆘 Still Having Issues?

If you continue to experience the "string did not match" error:

1. **Check the browser console** for detailed error messages
2. **Try a different browser** (Chrome, Firefox, Safari)
3. **Clear browser cache and cookies**
4. **Try uploading one image at a time**
5. **Ensure all required fields are properly filled**

The form now includes better error handling and validation. If issues persist, check the browser console for specific error messages.
