/**
 * Database Seed API Route
 * 
 * ⚠️ SECURITY WARNING: Delete this file after seeding is complete!
 * 
 * This route allows seeding the database via API call.
 * It should only be used once during initial setup.
 * 
 * Usage:
 * curl -X POST https://your-app.vercel.app/api/seed \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret":"your-secret-key"}'
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { secret } = body;

    // Check for secret key (set this in Vercel environment variables)
    const expectedSecret = process.env.MIGRATION_SECRET || "change-this-secret";
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid secret key." },
        { status: 401 }
      );
    }

    // Import PrismaClient and execute seed logic directly
    // Ensure DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL environment variable is not set",
        },
        { status: 500 }
      );
    }
    
    // Directly create PrismaClient for seed route
    // This ensures it works in Vercel's serverless environment
    let prisma;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { PrismaClient } = require("@prisma/client");
      
      // Create PrismaClient - it reads DATABASE_URL from environment automatically
      // For Prisma 6, we can initialize without options
      prisma = new PrismaClient();
    } catch (prismaError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to initialize Prisma Client: ${prismaError instanceof Error ? prismaError.message : String(prismaError)}`,
          debug: {
            hasDatabaseUrl: !!databaseUrl,
            databaseUrlLength: databaseUrl.length,
            nodeEnv: process.env.NODE_ENV,
          },
        },
        { status: 500 }
      );
    }

    console.log("🌱 Starting database seed...");

    // Clear existing data
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
        image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2086&auto=format&fit=crop",
        isActive: true,
      },
    });

    const girlsCategory = await prisma.category.create({
      data: {
        name: "Girls",
        slug: "girls",
        description: "Luxury fashion for girls",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
        isActive: true,
      },
    });

    await prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Premium accessories and essentials",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
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
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        isActive: true,
      },
    });

    const streetEssentialsCollection = await prisma.collection.create({
      data: {
        name: "Street Essentials",
        slug: "street-essentials",
        description: "Urban-inspired streetwear for modern kids",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
        isActive: true,
      },
    });

    // Create Sample Products
    console.log("👕 Creating products...");

    // Product 1: Heritage Denim Jacket
    await prisma.product.create({
      data: {
        name: "Heritage Denim Jacket",
        slug: "heritage-denim-jacket",
        description: "A timeless statement piece crafted from premium Japanese selvedge denim. Meticulously constructed with vintage-inspired hardware and a thoughtfully designed relaxed fit.",
        price: 12900,
        sku: "HDJ-001",
        categoryId: boysCategory.id,
        inStock: true,
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop",
            alt: "Heritage Denim Jacket",
            isPrimary: true,
            order: 0,
          }],
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
          create: [{ collectionId: newArrivalsCollection.id, order: 0 }],
        },
      },
    });

    // Product 2: Premium Cotton Tee
    await prisma.product.create({
      data: {
        name: "Premium Cotton Tee",
        slug: "premium-cotton-tee",
        description: "The foundation of effortless style. Crafted from ultra-soft organic cotton with a refined relaxed fit.",
        price: 4500,
        sku: "PCT-001",
        categoryId: boysCategory.id,
        inStock: true,
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
            alt: "Premium Cotton Tee",
            isPrimary: true,
            order: 0,
          }],
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
          create: [{ collectionId: streetEssentialsCollection.id, order: 0 }],
        },
      },
    });

    // Product 3: Classic Chino Pants
    await prisma.product.create({
      data: {
        name: "Classic Chino Pants",
        slug: "classic-chino-pants",
        description: "Versatile chinos that seamlessly transition from playdates to family outings. Made from premium cotton twill.",
        price: 6800,
        sku: "CCP-001",
        categoryId: boysCategory.id,
        inStock: true,
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2070&auto=format&fit=crop",
            alt: "Classic Chino Pants",
            isPrimary: true,
            order: 0,
          }],
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
    await prisma.product.create({
      data: {
        name: "Floral Garden Dress",
        slug: "floral-garden-dress",
        description: "A whimsical dress that captures the essence of childhood wonder. Delicate floral patterns on premium cotton fabric.",
        price: 8900,
        sku: "FGD-001",
        categoryId: girlsCategory.id,
        inStock: true,
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
            alt: "Floral Garden Dress",
            isPrimary: true,
            order: 0,
          }],
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
          create: [{ collectionId: newArrivalsCollection.id, order: 1 }],
        },
      },
    });

    const categoryCount = await prisma.category.count();
    const collectionCount = await prisma.collection.count();
    const productCount = await prisma.product.count();
    const variantCount = await prisma.productVariant.count();

    // Disconnect Prisma client
    await prisma.$disconnect();

    console.log("✅ Database seeded successfully!");
    console.log(`   - Created ${categoryCount} categories`);
    console.log(`   - Created ${collectionCount} collections`);
    console.log(`   - Created ${productCount} products`);
    console.log(`   - Created ${variantCount} product variants`);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        categories: categoryCount,
        collections: collectionCount,
        products: productCount,
        variants: variantCount,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    
    // Note: We don't disconnect here as we're using the singleton
    // The singleton manages its own lifecycle

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        note: "You may need to run the seed script manually via Supabase SQL Editor or locally."
      },
      { status: 500 }
    );
  }
}
