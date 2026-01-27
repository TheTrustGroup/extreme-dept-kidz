import { ProductForm } from "@/components/admin/ProductForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<JSX.Element> {
  const { id } = await params;
  
  return (
    <ErrorBoundary>
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Edit Product</h1>
        <ProductForm productId={id} />
      </div>
    </ErrorBoundary>
  );
}
