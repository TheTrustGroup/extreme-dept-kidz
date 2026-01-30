import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Product Page (Legacy Route)
 * 
 * Redirects to unified product edit route: /admin/products/[id]
 * This ensures all product editing uses ProductFormComprehensive.
 */
export default async function EditProductPage({ params }: EditProductPageProps): Promise<never> {
  const { id } = await params;
  
  // Redirect to unified product edit route
  redirect(`/admin/products/${id}`);
}
