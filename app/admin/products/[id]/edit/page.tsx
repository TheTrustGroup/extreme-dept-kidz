import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<JSX.Element> {
  const { id } = await params;
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Edit Product</h1>
      <ProductForm productId={id} />
    </div>
  );
}
