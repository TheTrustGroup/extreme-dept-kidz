import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import JustDroppedClient from '@/components/home/JustDroppedClient'
import ShopByCategory from '@/components/home/ShopByCategory'
import NewsletterSection from '@/components/home/NewsletterSection'
import ClientErrorBoundary from '@/components/ui/ClientErrorBoundary'
import { getProducts } from '@/lib/data/products'
import type { Product } from '@/types'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Extreme Dept Kidz | Luxury Kids Fashion',
  description:
    'Premium streetwear for young legends. Elevated style for kids aged 2–12. Shop boys and girls collections — based in Accra, Ghana.',
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const all = await getProducts({ storefrontOnly: true })
    const sorted = [...all].sort((a, b) => {
      const aAt = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bAt = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bAt - aAt
    })
    return sorted.slice(0, 8)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getNewArrivals()

  return (
    <main id="main-content">
      <HeroSection />

      <TrustBar />

      <ClientErrorBoundary message="Unable to load new arrivals.">
        <JustDroppedClient products={products} />
      </ClientErrorBoundary>

      <ClientErrorBoundary message="Unable to load collections.">
        <ShopByCategory />
      </ClientErrorBoundary>

      <NewsletterSection />
    </main>
  )
}
