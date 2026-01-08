import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-8">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
