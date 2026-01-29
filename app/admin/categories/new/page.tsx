'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { SingleImageUpload } from '@/components/admin/SingleImageUpload';

export default function NewCategoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
  });

  // Ensure slug is sent as empty string or undefined, not null
  const prepareFormData = () => {
    return {
      ...formData,
      slug: formData.slug || undefined, // Convert empty string to undefined
      description: formData.description || undefined,
      image: formData.image || undefined, // Convert empty string to undefined
    };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(prepareFormData()),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: "Category Created",
          message: `${formData.name} has been created successfully`,
        });
        // Dispatch event to refresh categories list
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('category-created'));
        }
        // Refresh the categories list and redirect
        router.push('/admin/categories');
        router.refresh(); // Force refresh to show new category
      } else {
        const msg = data.error || data.message || 'Failed to create category';
        const isAuthError = response.status === 401 || /token|expired|auth/i.test(String(msg));
        if (data.errors && typeof data.errors === 'object' && !isAuthError) {
          const errorMessages = Object.values(data.errors).join(', ');
          showToast({
            type: "error",
            title: "Validation Failed",
            message: errorMessages,
          });
        } else {
          showToast({
            type: "error",
            title: isAuthError ? "Session expired" : "Create Failed",
            message: isAuthError ? "Please log in again and try again." : msg,
          });
          if (isAuthError) {
            router.push('/admin/login');
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating category:', error);
      }
      showToast({
        type: "error",
        title: "Create Failed",
        message: 'An error occurred while creating the category',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create New Category</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Activewear"
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
            placeholder="e.g., activewear"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly identifier (auto-generated from name if left blank)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of this category"
            rows={4}
          />
        </div>

        <SingleImageUpload
          imageUrl={formData.image || null}
          onChange={(url) => setFormData({ ...formData, image: url || '' })}
          label="Category Image (Optional)"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm font-medium">
            Active (visible to customers)
          </label>
        </div>

        <div className="flex gap-4">
          <Link href="/admin/categories">
            <Button type="button" variant="ghost" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
}
