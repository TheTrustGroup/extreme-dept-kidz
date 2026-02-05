'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { formatPrice } from '@/lib/utils';
import { SimpleOptimizedImage } from '@/components/ui/SimpleOptimizedImage';
import { apiUrl } from '@/lib/config/api-base';

interface Product {
  id: string;
  name: string;
  price: number;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category: { name: string };
}

export default function NewCompleteLookPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [requiredProducts, setRequiredProducts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    mainImage: '',
    bundlePrice: '',
    bundleDiscount: '',
    featured: false,
    isActive: true,
    ageRange: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl("/api/admin/products"), {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const productsList = data.data?.products || data.products || [];
        setProducts(productsList);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching products:', error);
      }
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        const newSelected = prev.filter(id => id !== productId);
        setRequiredProducts(prevReq => {
          const newReq = new Set(prevReq);
          newReq.delete(productId);
          return newReq;
        });
        return newSelected;
      } else {
        return [...prev, productId];
      }
    });
  };

  const toggleRequired = (productId: string) => {
    setRequiredProducts(prev => {
      const newReq = new Set(prev);
      if (newReq.has(productId)) {
        newReq.delete(productId);
      } else {
        newReq.add(productId);
      }
      return newReq;
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Complete look name is required",
        });
        setLoading(false);
        return;
      }

      if (!formData.description.trim() || formData.description.trim().length < 10) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Description must be at least 10 characters",
        });
        setLoading(false);
        return;
      }

      if (!formData.mainImage.trim()) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Main image is required",
        });
        setLoading(false);
        return;
      }

      if (selectedProducts.length < 2) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Please select at least 2 products",
        });
        setLoading(false);
        return;
      }

      if (!formData.bundlePrice || parseFloat(formData.bundlePrice) <= 0) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Bundle price must be greater than 0",
        });
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description.trim(),
        mainImage: formData.mainImage.trim(),
        bundlePrice: parseFloat(formData.bundlePrice),
        bundleDiscount: formData.bundleDiscount ? parseFloat(formData.bundleDiscount) : undefined,
        featured: formData.featured,
        isActive: formData.isActive,
        ageRange: formData.ageRange.trim() || undefined,
        tags: formData.tags,
        productIds: selectedProducts,
        requiredProductIds: Array.from(requiredProducts),
      };

      const response = await fetch(apiUrl('/api/admin/complete-looks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Complete Look Created",
          message: `${formData.name} has been created successfully`,
        });
        router.push('/admin/looks');
        router.refresh();
      } else {
        if (data.errors && typeof data.errors === 'object') {
          const errorMessages = Object.values(data.errors).join(', ');
          showToast({
            type: "error",
            title: "Validation Failed",
            message: errorMessages,
            duration: 5000,
          });
        } else {
          showToast({
            type: "error",
            title: "Create Failed",
            message: data.error || data.message || 'Failed to create complete look',
          });
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating complete look:', error);
      }
      showToast({
        type: "error",
        title: "Create Failed",
        message: 'An error occurred while creating the complete look',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProductsList = products.filter(p => selectedProducts.includes(p.id));

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/looks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Complete Looks
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create New Complete Look</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Look Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Smart Casual Gentleman"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., smart-casual-gentleman"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (auto-generated from name if left blank)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe this complete look..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Main Image URL *
            </label>
            <input
              type="text"
              value={formData.mainImage}
              onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/images/complete-look.jpg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Or use the image upload below
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Main Image Upload
            </label>
            <ImageUpload
              images={formData.mainImage ? [formData.mainImage] : []}
              onChange={(urls) => {
                if (urls.length > 0) {
                  setFormData({ ...formData, mainImage: urls[0] });
                }
              }}
              maxImages={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bundle Price (GHS) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bundlePrice}
                onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="900.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bundle Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.bundleDiscount}
                onChange={(e) => setFormData({ ...formData, bundleDiscount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Age Range
            </label>
            <input
              type="text"
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 8-12, 13-16"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Select Products ({selectedProducts.length} selected, minimum 2 required)
          </h2>

          {selectedProducts.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Selected Products:</h3>
              <div className="space-y-2">
                {selectedProductsList.map((product) => {
                  const isRequired = requiredProducts.has(product.id);
                  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center gap-3">
                        {primaryImage && (
                          <SimpleOptimizedImage
                            src={primaryImage.url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRequired(product.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            isRequired
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isRequired ? (
                            <>
                              <Check className="w-4 h-4 inline mr-1" />
                              Required
                            </>
                          ) : (
                            'Optional'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              const isRequired = requiredProducts.has(product.id);
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              
              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {primaryImage && (
                    <SimpleOptimizedImage
                      src={primaryImage.url}
                      alt={product.name}
                      width={256}
                      height={128}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="font-medium text-sm mb-1">{product.name}</p>
                  <p className="text-xs text-gray-600 mb-2">{formatPrice(product.price)}</p>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <Check className="w-3 h-3" />
                      {isRequired ? 'Required' : 'Selected'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/admin/looks">
            <Button type="button" variant="ghost" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || selectedProducts.length < 2}>
            {loading ? 'Creating...' : 'Create Complete Look'}
          </Button>
        </div>
      </form>
    </div>
  );
}
