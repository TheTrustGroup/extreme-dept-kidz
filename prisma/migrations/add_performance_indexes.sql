-- Performance indexes for high-traffic storefront/admin read paths.
-- Safe to run repeatedly with IF NOT EXISTS guards.

CREATE INDEX IF NOT EXISTS "Product_visibleOnStore_createdAt_idx"
  ON "Product" ("visibleOnStore", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Product_categoryId_visibleOnStore_createdAt_idx"
  ON "Product" ("categoryId", "visibleOnStore", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Order_paymentStatus_createdAt_idx"
  ON "Order" ("paymentStatus", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "User_role_createdAt_idx"
  ON "User" ("role", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ProductVariant_isActive_stock_idx"
  ON "ProductVariant" ("isActive", "stock");
