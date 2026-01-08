# Admin Panel Documentation

## Overview

The admin panel is a comprehensive command center for managing your Extreme Dept Kidz e-commerce business. It provides full control over products, inventory, pricing, and more.

## Access

1. **URL**: Navigate to `/admin` in your browser
2. **Login**: 
   - Default password: `admin123` (for development)
   - Set `ADMIN_PASSWORD` environment variable in production
   - Password is stored in session (cleared on browser close)

## Features

### 1. Dashboard (`/admin`)
- **Overview Statistics**:
  - Total Products
  - Total Orders
  - Total Revenue
  - Low Stock Items Alert
- **Quick Actions**:
  - Add New Product
  - Manage Inventory
  - View Orders

### 2. Product Management (`/admin/products`)
- **View All Products**: Table view with search functionality
- **Product Information**:
  - Product name and slug
  - Category
  - Price
  - Stock levels
  - Status (In Stock/Out of Stock)
- **Actions**:
  - Edit product
  - Delete product
  - Add new product (coming soon)

### 3. Inventory Management (`/admin/inventory`)
- **View All Variants**: Complete inventory across all products
- **Stock Information**:
  - Product name
  - Size
  - SKU
  - Current stock level
- **Low Stock Alerts**: Items with ≤10 units are highlighted
- **Update Stock**: Click "Edit" to update stock levels
- **Automatic Logging**: All inventory changes are logged for audit trail

### 4. Pricing Management (`/admin/pricing`)
- **View All Products**: List of all products with pricing
- **Price Information**:
  - Current price
  - Original price (for sale items)
- **Update Prices**: Click "Edit" to modify prices
- **Bulk Updates**: Edit multiple products (coming soon)

### 5. Orders (`/admin/orders`)
- View and manage customer orders (coming soon)

### 6. Categories (`/admin/categories`)
- Manage product categories (coming soon)

### 7. Collections (`/admin/collections`)
- Manage product collections (coming soon)

## API Endpoints

### Authentication
- `POST /api/admin/auth` - Authenticate admin user

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### Products
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create new product
- `GET /api/admin/products/[id]` - Get single product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

### Inventory
- `GET /api/admin/inventory` - List all variants with stock
- `PUT /api/admin/inventory/[variantId]` - Update variant stock

## Security

### Current Implementation
- Simple password-based authentication
- Session-based (stored in browser sessionStorage)
- Password set via `ADMIN_PASSWORD` environment variable

### Recommended for Production
1. **Set Strong Password**: 
   ```bash
   # In Vercel or your hosting platform
   ADMIN_PASSWORD=your-strong-password-here
   ```

2. **Consider Upgrading**:
   - Implement proper user authentication (NextAuth.js)
   - Add role-based access control
   - Add rate limiting
   - Add IP whitelisting (optional)

## Usage Examples

### Adding a New Product
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill in product details:
   - Name, slug, description
   - Price (in Ghana Cedis)
   - Category
   - Images (URLs)
   - Variants (sizes and stock)
   - Tags and collections

### Updating Inventory
1. Navigate to `/admin/inventory`
2. Find the product variant
3. Click "Edit" next to the stock number
4. Enter new stock level
5. Click "Save"

### Updating Prices
1. Navigate to `/admin/pricing`
2. Find the product
3. Click "Edit"
4. Update price and/or original price
5. Click "Save"

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Admin panel password (defaults to "admin123" if not set)

## Troubleshooting

### Can't Access Admin Panel
- Check that you're logged in at `/admin/login`
- Verify `ADMIN_PASSWORD` is set correctly
- Clear browser sessionStorage and try again

### Products Not Loading
- Check database connection (`DATABASE_URL`)
- Verify Prisma client is generated: `npx prisma generate`
- Check browser console for errors

### Inventory Updates Not Saving
- Verify database connection
- Check that variant exists
- Review API logs for errors

## Future Enhancements

- [ ] Product creation/editing form
- [ ] Image upload functionality
- [ ] Bulk operations (import/export)
- [ ] Order management interface
- [ ] Category and collection management
- [ ] Advanced analytics and reporting
- [ ] User management
- [ ] Activity logs and audit trail
