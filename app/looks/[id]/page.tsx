import { CompleteLookSlider } from '@/components/products/CompleteLookSlider';
import { completeLooks } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CompleteLookPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params in Next.js 15+
  const resolvedParams = await params;
  const look = completeLooks.find(l => l.id === resolvedParams.id || l.slug === resolvedParams.id);

  if (!look) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/style-guide" className="text-gray-600 hover:text-black transition-colors">
                Complete Looks
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="font-semibold text-black">{look.name}</li>
          </ol>
        </nav>

        <CompleteLookSlider look={look} />

        {/* Description */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">{look.name}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">{look.description}</p>
        </div>
      </div>
    </div>
  );
}
