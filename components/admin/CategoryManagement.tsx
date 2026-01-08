"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  products?: Array<{ id: string }>;
}

export function CategoryManagement(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories(): Promise<void> {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Categories</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 mb-6">
        <div className="p-4 border-b border-cream-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-charcoal-600">
                    {searchTerm ? "No categories found" : "No categories yet. Add your first category!"}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-charcoal-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-600">
                      {category.description || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {category.products?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
