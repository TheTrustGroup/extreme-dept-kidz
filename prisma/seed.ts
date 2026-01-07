/**
 * Database Seed Script
 * 
 * Populates the database with initial data (categories, collections, products)
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  console.log("📁 Creating categories...");
  const boysCategory = await prisma.category.create({
    data: {
      name: "Boys",
      slug: "boys",
      description: "Premium fashion for boys",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2086&auto=format&fit=crop",
      isActive: true,
    },
  });

  const girlsCategory = await prisma.category.create({
    data: {
      name: "Girls",
      slug: "girls",
      description: "Luxury fashion for girls",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
      isActive: true,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Premium accessories and essentials",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      isActive: true,
    },
  });

  // Create Collections
  console.log("📚 Creating collections...");
  const newArrivalsCollection = await prisma.collection.create({
    data: {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Discover our latest premium pieces",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      isActive: true,
    },
  });

  const streetEssentialsCollection = await prisma.collection.create({
    data: {
      name: "Street Essentials",
      slug: "street-essentials",
      description: "Urban-inspired streetwear for modern kids",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
      isActive: true,
    },
  });

  // Create Sample Products
  console.log("👕 Creating products...");

  // Product 1: Heritage Denim Jacket
  const product1 = await prisma.product.create({
    data: {
      name: "Heritage Denim Jacket",
      slug: "heritage-denim-jacket",
      description:
        "A timeless statement piece crafted from premium Japanese selvedge denim. Meticulously constructed with vintage-inspired hardware and a thoughtfully designed relaxed fit. Built to become a cherished wardrobe essential that ages beautifully with every adventure.",
      price: 12900, // $129.00
      sku: "HDJ-001",
      categoryId: boysCategory.id,
      inStock: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop",
            alt: "Heritage Denim Jacket",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          { size: "4T", sku: "HDJ-001-4T", stock: 10 },
          { size: "5T", sku: "HDJ-001-5T", stock: 15 },
          { size: "6", sku: "HDJ-001-6", stock: 12 },
          { size: "8", sku: "HDJ-001-8", stock: 8 },
          { size: "10", sku: "HDJ-001-10", stock: 5 },
          { size: "12", sku: "HDJ-001-12", stock: 3 },
        ],
      },
      tags: {
        create: [{ name: "new" }, { name: "bestseller" }],
      },
      collections: {
        create: [
          {
            collectionId: newArrivalsCollection.id,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 2: Premium Cotton Tee
  const product2 = await prisma.product.create({
    data: {
      name: "Premium Cotton Tee",
      slug: "premium-cotton-tee",
      description:
        "The foundation of effortless style. Crafted from ultra-soft organic cotton with a refined relaxed fit. Designed to layer beautifully or stand alone, this essential piece elevates everyday moments. Available in carefully curated colorways.",
      price: 4500, // $45.00
      sku: "PCT-001",
      categoryId: boysCategory.id,
      inStock: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
            alt: "Premium Cotton Tee",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          { size: "2T", sku: "PCT-001-2T", stock: 20 },
          { size: "3T", sku: "PCT-001-3T", stock: 25 },
          { size: "4T", sku: "PCT-001-4T", stock: 30 },
          { size: "5T", sku: "PCT-001-5T", stock: 28 },
          { size: "6", sku: "PCT-001-6", stock: 22 },
          { size: "8", sku: "PCT-001-8", stock: 18 },
          { size: "10", sku: "PCT-001-10", stock: 15 },
          { size: "12", sku: "PCT-001-12", stock: 12 },
        ],
      },
      tags: {
        create: [{ name: "bestseller" }],
      },
      collections: {
        create: [
          {
            collectionId: streetEssentialsCollection.id,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 3: Classic Chino Pants
  const product3 = await prisma.product.create({
    data: {
      name: "Classic Chino Pants",
      slug: "classic-chino-pants",
      description:
        "Versatile chinos that seamlessly transition from playdates to family outings. Made from premium cotton twill with a comfortable stretch waistband and reinforced knees for durability. The perfect balance of style and functionality.",
      price: 6800, // $68.00
      sku: "CCP-001",
      categoryId: boysCategory.id,
      inStock: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2070&auto=format&fit=crop",
            alt: "Classic Chino Pants",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          { size: "4T", sku: "CCP-001-4T", stock: 8 },
          { size: "5T", sku: "CCP-001-5T", stock: 10 },
          { size: "6", sku: "CCP-001-6", stock: 12 },
          { size: "8", sku: "CCP-001-8", stock: 15 },
          { size: "10", sku: "CCP-001-10", stock: 10 },
          { size: "12", sku: "CCP-001-12", stock: 7 },
        ],
      },
      tags: {
        create: [{ name: "bestseller" }],
      },
    },
  });

  // Product 4: Girls' Floral Dress
  const product4 = await prisma.product.create({
    data: {
      name: "Floral Garden Dress",
      slug: "floral-garden-dress",
      description:
        "A whimsical dress that captures the essence of childhood wonder. Delicate floral patterns on premium cotton fabric, with a comfortable A-line silhouette and adjustable straps. Perfect for special occasions and everyday elegance.",
      price: 8900, // $89.00
      sku: "FGD-001",
      categoryId: girlsCategory.id,
      inStock: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
            alt: "Floral Garden Dress",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          { size: "2T", sku: "FGD-001-2T", stock: 12 },
          { size: "3T", sku: "FGD-001-3T", stock: 15 },
          { size: "4T", sku: "FGD-001-4T", stock: 18 },
          { size: "5T", sku: "FGD-001-5T", stock: 20 },
          { size: "6", sku: "FGD-001-6", stock: 16 },
          { size: "8", sku: "FGD-001-8", stock: 14 },
          { size: "10", sku: "FGD-001-10", stock: 10 },
          { size: "12", sku: "FGD-001-12", stock: 8 },
        ],
      },
      tags: {
        create: [{ name: "new" }],
      },
      collections: {
        create: [
          {
            collectionId: newArrivalsCollection.id,
            order: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - Created ${await prisma.category.count()} categories`);
  console.log(`   - Created ${await prisma.collection.count()} collections`);
  console.log(`   - Created ${await prisma.product.count()} products`);
  console.log(
    `   - Created ${await prisma.productVariant.count()} product variants`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

