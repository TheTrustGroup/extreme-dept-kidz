"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  products?: Array<{ productId: string }>;
}

export function CollectionManagement(): JSX.Element {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections(): Promise<void> {
    try {
      const response = await fetch("/api/admin/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections(collections.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete collection");
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Failed to delete collection");
    }
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charcoal-600">Loading collections...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Collections</h1>
        <Link href="/admin/collections/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Collection
          </Button>
        </Link>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 mb-6">
        <div className="p-4 border-b border-cream-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search collections..."
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
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-charcoal-600">
                    {searchTerm ? "No collections found" : "No collections yet. Add your first collection!"}
                  </td>
                </tr>
              ) : (
                filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-charcoal-900">
                        {collection.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {collection.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-600">
                      {collection.description || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                      {collection.products?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          collection.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {collection.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/collections/${collection.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(collection.id)}
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
