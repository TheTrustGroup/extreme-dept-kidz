import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
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
    // DB orders by createdAt desc; take 8 only — avoid loading entire catalog (timeouts / blank page).
    return await getProducts({ storefrontOnly: true, limit: 4 })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getNewArrivals()

  return (
    <main id="main-content">
      <HeroSection />

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
