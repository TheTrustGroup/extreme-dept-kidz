'use client'

import { useMemo } from 'react'
import JustDropped from './JustDropped'
import type { ProductCardProps } from '@/components/product/ProductCard'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/stores/cart-store'

function productToCardProps(p: Product): ProductCardProps {
  const priceNum = typeof p.price === 'number' ? p.price : Number(p.price)
  const originalNum =
    p.originalPrice != null
      ? typeof p.originalPrice === 'number'
        ? p.originalPrice
        : Number(p.originalPrice)
      : undefined
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: priceNum / 100,
    compareAtPrice: originalNum != null ? originalNum / 100 : undefined,
    currency: '₵',
    imageUrl: p.images?.find((img) => img.isPrimary)?.url ?? p.images?.[0]?.url ?? '/placeholder.jpg',
    imageAlt: p.images?.[0]?.alt ?? p.name,
    badge: p.tags?.includes('new')
      ? 'new'
      : !p.inStock
        ? 'sold-out'
        : originalNum != null && originalNum > priceNum
          ? 'sale'
          : null,
    isAvailable: p.inStock ?? true,
  }
}

export default function JustDroppedClient({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem)
  const cardProducts = useMemo(
    () => products.map(productToCardProps),
    [products]
  )

  const handleAddToCart = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (!product || !product.inStock) return
      const firstSize =
        product.sizes?.find((s) => s.inStock)?.size ??
        product.sizes?.[0]?.size
      if (!firstSize) return
      addItem(product, firstSize)
    } catch (e) {
      console.error('Add to cart failed:', e)
    }
  }

  return <JustDropped products={cardProducts} onAddToCart={handleAddToCart} />
}
