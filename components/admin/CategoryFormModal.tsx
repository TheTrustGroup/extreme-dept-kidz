"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive: boolean;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
  };
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  image: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  general?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps): JSX.Element | null {
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [checkingSlug, setCheckingSlug] = React.useState(false);
  const [slugExists, setSlugExists] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    image: "",
    isActive: true,
    seoTitle: "",
    seoDescription: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [createAnother, setCreateAnother] = React.useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const isEditMode = !!category;

  // Load category data when editing
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parentId: category.parentId || "",
        image: category.image || "",
        isActive: category.isActive ?? true,
        seoTitle: category.metadata?.seoTitle || "",
        seoDescription: category.metadata?.seoDescription || "",
      });
      setErrors({});
      setSlugExists(false);
    } else {
      // Reset form for new category
      setFormData({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        image: "",
        isActive: true,
        seoTitle: "",
        seoDescription: "",
      });
      setErrors({});
      setSlugExists(false);
      setCreateAnother(false);
    }
  }, [category, isOpen]);

  // Focus name input when modal opens
  React.useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, onClose]);

  // Fetch parent categories
  const [parentCategories, setParentCategories] = React.useState<Array<{ id: string; name: string }>>([]);
  React.useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/categories", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          const cats = data.data?.categories || data.categories || [];
          // Filter out current category if editing (can't be its own parent)
          const filtered = category
            ? cats.filter((c: Category) => c.id !== category.id)
            : cats;
          setParentCategories(filtered);
        })
        .catch(() => setParentCategories([]));
    }
  }, [isOpen, category]);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Check if slug exists
  const checkSlugExists = React.useCallback(async (slug: string): Promise<void> => {
    if (!slug || slug === category?.slug) {
      setSlugExists(false);
      return;
    }

    setCheckingSlug(true);
    try {
      // Fetch all categories and check if slug exists
      const response = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const categories = data.data?.categories || data.categories || [];
        const exists = categories.some((c: Category) => c.slug === slug && c.id !== category?.id);
        setSlugExists(exists);
      }
    } catch (error) {
      console.error("Error checking slug:", error);
    } finally {
      setCheckingSlug(false);
    }
  }, [category]);

  // Debounced slug existence check when slug changes
  React.useEffect(() => {
    if (!formData.slug) {
      setSlugExists(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      checkSlugExists(formData.slug);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.slug, checkSlugExists]);

  // Handle name change - auto-generate slug
  const handleNameChange = (name: string): void => {
    setFormData((prev) => {
      const newSlug = prev.slug || generateSlug(name);
      return { ...prev, name, slug: newSlug };
    });
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  // Handle slug change - check for duplicates (effect above handles debounced check)
  const handleSlugChange = (slug: string): void => {
    const cleanSlug = generateSlug(slug);
    setFormData((prev) => ({ ...prev, slug: cleanSlug }));
    setErrors((prev) => ({ ...prev, slug: undefined }));
    if (!cleanSlug) {
      setSlugExists(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }

    if (slugExists) {
      newErrors.slug = "This slug is already in use";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Only send fields supported by the API
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
        image: formData.image || undefined,
        // Note: parentId and metadata not yet supported by API
        // Will be added when API is updated
      };

      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: "success",
          title: isEditMode ? "Category Updated" : "Category Created",
          message: `${formData.name} has been ${isEditMode ? "updated" : "created"} successfully`,
        });

        if (onSuccess) {
          onSuccess();
        }

        if (createAnother && !isEditMode) {
          // Reset form for another category
          setFormData({
            name: "",
            slug: "",
            description: "",
            parentId: "",
            image: "",
            isActive: true,
            seoTitle: "",
            seoDescription: "",
          });
          setErrors({});
          setSlugExists(false);
          nameInputRef.current?.focus();
        } else {
          onClose();
        }
      } else {
        const errorMsg = data.error || data.message || "Failed to save category";
        const isAuthError = response.status === 401 || /token|expired|auth/i.test(String(errorMsg));

        if (data.errors && typeof data.errors === "object" && !isAuthError) {
          const errorMessages = Object.values(data.errors).join(", ");
          setErrors({ general: errorMessages });
        } else {
          setErrors({ general: isAuthError ? "Session expired. Please refresh and try again." : errorMsg });
          if (isAuthError) {
            setTimeout(() => {
              window.location.href = "/admin/login";
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setErrors({ general: "An error occurred while saving the category" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.name.trim() && formData.slug.trim() && !slugExists && !errors.name && !errors.slug;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <m.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={loading ? undefined : onClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <m.div
          ref={drawerRef}
          className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white shadow-2xl z-[101] flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{
            type: "spring",
            damping: 35,
            stiffness: 400,
            mass: 0.8,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-form-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 id="category-form-title" className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {errors.general}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors",
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  )}
                  placeholder="e.g., Activewear"
                  disabled={loading}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors",
                      errors.slug || slugExists
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    )}
                    placeholder="e.g., activewear"
                    disabled={loading}
                    required
                  />
                  {checkingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
                {slugExists && !errors.slug && (
                  <p className="mt-1 text-sm text-yellow-600">
                    ⚠️ This slug is already in use. Please choose a different one.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors resize-none",
                    errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                  )}
                  placeholder="Brief description of this category"
                  disabled={loading}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className={cn(
                    "text-xs ml-auto",
                    formData.description.length > MAX_DESCRIPTION_LENGTH * 0.9
                      ? "text-yellow-600"
                      : "text-gray-500"
                  )}>
                    {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                  </p>
                </div>
              </div>

              {/* Parent Category */}
              {parentCategories.length > 0 && (
                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    value={formData.parentId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="">None (Top-level category)</option>
                    {parentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Make this a sub-category of another category
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <SingleImageUpload
                  imageUrl={formData.image || null}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url || "" }))}
                  label="Category Image (Optional)"
                  disabled={loading}
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </label>
              </div>

              {/* SEO Meta Title */}
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Meta Title
                </label>
                <input
                  id="seoTitle"
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors"
                  placeholder="Optional SEO title"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Custom title for search engines (defaults to category name)
                </p>
              </div>

              {/* SEO Meta Description */}
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Meta Description
                </label>
                <textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors resize-none"
                  placeholder="Optional SEO description"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.seoDescription.length}/160 characters (recommended for SEO)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50">
              {!isEditMode && (
                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAnother}
                    onChange={(e) => setCreateAnother(e.target.checked)}
                    className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500 mr-2"
                    disabled={loading}
                  />
                  Create another
                </label>
              )}
              <div className={cn("flex gap-3", !isEditMode && "ml-auto")}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  loading={loading}
                  loadingText={isEditMode ? "Updating..." : "Creating..."}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? "Update Category" : "Save Category"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </m.div>
      </>
    </AnimatePresence>
  );
}
