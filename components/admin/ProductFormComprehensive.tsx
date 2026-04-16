"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Eye,
  Trash2,
  Upload,
  X,
  GripVertical,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Package,
  Palette,
  FolderOpen,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SimpleOptimizedImage } from "@/components/ui/SimpleOptimizedImage";
import { cn } from "@/lib/utils";
import { DEFAULT_PRODUCT_SIZES } from "@/lib/constants/product-sizes";
import { apiUrl } from "@/lib/config/api-base";
import { apiPricesFromForm, formPricesFromDb } from "@/lib/admin/product-price-form";
import { m } from "framer-motion";

// Form schema
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().max(160, "Short description must be 160 characters or less").optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
  visibleOnStore: z.boolean(),
  price: z.number({ required_error: "Price is required", invalid_type_error: "Enter a valid number" }).positive("Price must be greater than 0"),
  salePrice: z.number().optional(),
  costPerItem: z.number().optional(),
  trackInventory: z.boolean(),
  stockQuantity: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  allowBackorders: z.boolean(),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(60, "Meta title must be 60 characters or less").optional(),
  metaDescription: z.string().max(160, "Meta description must be 160 characters or less").optional(),
  slug: z.string().min(1, "Slug is required"),
  images: z
    .array(z.string().trim().min(1, "Image URL cannot be empty"))
    .min(1, "At least one image is required"),
  variants: z.array(z.object({
    size: z.string(),
    color: z.string().optional(),
    price: z.number().optional(),
    sku: z.string().optional(),
    stock: z.number().min(0),
  })).optional(),
}).refine(
  (data) => {
    if (data.salePrice == null || data.salePrice <= 0) return true;
    return data.salePrice < data.price;
  },
  { message: "Sale price must be less than regular price", path: ["salePrice"] }
);

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormComprehensiveProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
  /** After successful create/update (e.g. close a parent modal). */
  onSuccess?: () => void;
  /** When true, do not navigate to /admin/products — parent handles UI. */
  skipRedirectAfterSave?: boolean;
}

const FORM_SECTIONS = [
  { id: "basic", label: "Basic Information", icon: FileText },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "variants", label: "Variants", icon: Palette },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "seo", label: "SEO", icon: Search },
] as const;

/** Parse 400 validation response into a single user-facing message */
function parseApiValidationMessage(status: number, data: Record<string, unknown>): string {
  const main = (data?.error ?? data?.message) as string | undefined;
  if (status === 400 && typeof data?.details === "string") {
    try {
      const fields = JSON.parse(data.details) as Record<string, string>;
      const messages = Object.values(fields).filter(Boolean);
      if (messages.length > 0) return messages.join(". ");
    } catch {
      /* ignore */
    }
  }
  return main ?? "Validation failed";
}

/** Only storefront-visible when status is Active and the checkbox is on */
function effectiveVisibleOnStore(formData: {
  status: string;
  visibleOnStore?: boolean;
}): boolean {
  return formData.status === "active" && Boolean(formData.visibleOnStore);
}

export function ProductFormComprehensive({
  productId,
  initialData,
  onSuccess,
  skipRedirectAfterSave = false,
}: ProductFormComprehensiveProps): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startNavTransition] = React.useTransition();
  const isNew = !productId || productId === "new";

  // Form state
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      status: initialData?.status || "draft",
      visibleOnStore: initialData?.visibleOnStore ?? false,
      price: initialData?.price || 0,
      salePrice: initialData?.salePrice,
      costPerItem: initialData?.costPerItem,
      trackInventory: initialData?.trackInventory ?? true,
      stockQuantity: initialData?.stockQuantity || 0,
      lowStockThreshold: initialData?.lowStockThreshold || 10,
      allowBackorders: initialData?.allowBackorders ?? false,
      weight: initialData?.weight,
      length: initialData?.length,
      width: initialData?.width,
      height: initialData?.height,
      categoryId: initialData?.categoryId || "",
      tags: initialData?.tags || [],
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      slug: initialData?.slug || "",
      images: initialData?.images || [],
      variants: initialData?.variants || DEFAULT_PRODUCT_SIZES.map(size => ({
        size,
        stock: 0,
      })),
    },
  });

  // UI state
  const [activeSection, setActiveSection] = React.useState<string>("basic");
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = React.useState(false);
  const [savingDraft, setSavingDraft] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [imageUploading, setImageUploading] = React.useState(false);
  const [imageOrder, setImageOrder] = React.useState<number[]>([]);

  // Watch form values
  const watchedValues = watch();
  const images = watch("images") || [];
  const variants = watch("variants") || [];
  const name = watch("name");
  const slug = watch("slug");
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const shortDescription = watch("shortDescription");
  const status = watch("status");

  React.useEffect(() => {
    if (status === "draft" || status === "archived") {
      setValue("visibleOnStore", false, { shouldDirty: true });
    }
  }, [status, setValue]);

  // When server didn't provide initialData (e.g. warehouse with no DB), fetch product from API
  React.useEffect(() => {
    if (isNew || initialData != null) return;
    if (!productId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/admin/products/${productId}`), {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const data = json.data ?? json;
        const meta = (data.metadata ?? {}) as Record<string, unknown>;
        const dims = (meta.dimensions ?? {}) as Record<string, unknown>;
        const sizes = data.sizes ?? data.variants ?? [];
        const mapped = {
          name: (data.name ?? "") as string,
          description: (data.description ?? "") as string,
          shortDescription: (meta.shortDescription as string) ?? "",
          sku: (data.sku ?? "") as string,
          barcode: (meta.barcode as string) ?? "",
          status: (data.inStock ? "active" : "draft") as "active" | "draft" | "archived",
          visibleOnStore: Boolean(data.inStock && data.visibleOnStore !== false),
          ...formPricesFromDb(
            typeof data.price === "number" ? data.price : 0,
            data.originalPrice != null && typeof data.originalPrice === "number"
              ? data.originalPrice
              : null
          ),
          costPerItem: meta.costPerItem as number | undefined,
          trackInventory: (meta.trackInventory as boolean) !== false,
          stockQuantity: sizes.reduce((sum: number, s: { quantity?: number }) => sum + (s.quantity ?? 0), 0),
          lowStockThreshold: (meta.lowStockThreshold as number) ?? 10,
          allowBackorders: (meta.allowBackorders as boolean) ?? false,
          weight: data.weight as number | undefined,
          length: dims.length as number | undefined,
          width: dims.width as number | undefined,
          height: dims.height as number | undefined,
          categoryId: (data.categoryId ?? data.category?.id ?? "") as string,
          tags: (data.tags?.map((t: { name?: string }) => t.name ?? t) ?? []) as string[],
          metaTitle: (meta.metaTitle as string) ?? "",
          metaDescription: (meta.metaDescription as string) ?? "",
          slug: (data.slug ?? "") as string,
          images: (data.images?.map((img: { url?: string }) => img.url ?? img) ?? []) as string[],
          variants: sizes.length
            ? (sizes as { size: string; quantity?: number }[]).map((s) => ({
                size: s.size ?? "",
                stock: s.quantity ?? 0,
              }))
            : DEFAULT_PRODUCT_SIZES.map((size) => ({ size, stock: 0 })),
        };
        if (!cancelled) reset(mapped);
      } catch (e) {
        if (!cancelled) console.error("Failed to load product for edit:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, isNew, initialData, reset]);

  // Load categories (apiUrl so warehouse hits main site)
  React.useEffect(() => {
    async function loadCategories(): Promise<void> {
      try {
        const res = await fetch(apiUrl("/api/admin/categories"), { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const cats = data.data?.categories || data.categories || [];
          setCategories(cats);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  // Auto-generate slug from name (only when name is a non-empty string)
  React.useEffect(() => {
    const nameStr = typeof name === "string" ? name.trim() : "";
    if (!isNew || !nameStr || (typeof slug === "string" && slug.length > 0)) return;
    const generatedSlug = nameStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setValue("slug", generatedSlug, { shouldDirty: false });
  }, [name, slug, isNew, setValue]);

  // Auto-generate SKU from name when empty (e.g. "Court Icon Tee" -> "CIT" or slug-based)
  React.useEffect(() => {
    const nameStr = typeof name === "string" ? name.trim() : "";
    const currentSku = (getValues("sku") ?? "").toString().trim();
    if (!isNew || !nameStr || currentSku.length > 0) return;
    const slugPart = nameStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const skuPrefix = slugPart.slice(0, 8).toUpperCase().replace(/-/g, "");
    const suggested = skuPrefix ? `KGS-${skuPrefix}-BLK` : "";
    if (suggested) setValue("sku", suggested, { shouldDirty: false });
  }, [name, isNew, setValue, getValues]);

  // Auto-generate meta title from name
  React.useEffect(() => {
    const nameStr = typeof name === "string" ? name : "";
    if (!isNew || !nameStr || (typeof metaTitle === "string" && metaTitle.length > 0)) return;
    const generatedTitle = nameStr.length > 60 ? nameStr.substring(0, 57) + "..." : nameStr;
    setValue("metaTitle", generatedTitle, { shouldDirty: false });
  }, [name, metaTitle, isNew, setValue]);

  // Auto-save draft every 30 seconds
  React.useEffect(() => {
    if (!isDirty) return;

    const autoSaveInterval = setInterval(async () => {
      if (saving || savingDraft || imageUploading) return;

      setAutoSaveStatus("saving");
      try {
        const formData = getValues();
        const nameStr = (formData?.name ?? "").toString().trim();
        const slugStr = (formData?.slug ?? "").toString().trim();
        const descStr = (formData?.description ?? "").toString().trim();
        const skuStr = (formData?.sku ?? "").toString().trim();
        const validPrice = typeof formData?.price === "number" && !Number.isNaN(formData.price) && formData.price > 0;
        if (!nameStr || !slugStr || !descStr || !skuStr || !validPrice) {
          setAutoSaveStatus("idle");
          return;
        }

        // Transform to API format
        const priceFields = apiPricesFromForm(
          typeof formData?.price === "number" && !Number.isNaN(formData.price)
            ? formData.price
            : 0,
          formData?.salePrice
        );
        const payload: any = {
          name: nameStr,
          slug: slugStr,
          description: descStr,
          sku: skuStr,
          price: priceFields.price,
          originalPrice: priceFields.originalPrice,
          categoryId: formData?.categoryId ?? "",
          images: formData?.images || [],
          inStock: formData?.status === "active",
          visibleOnStore: effectiveVisibleOnStore(formData as ProductFormData),
          sizes: (formData?.variants || [])
            .filter((v: { size?: string }) => (v?.size ?? "").toString().trim() !== "")
            .map((v: { size?: string; stock?: number }) => ({
              size: (v?.size ?? "").toString().trim(),
              quantity: v?.stock ?? 0,
            })),
          tags: formData?.tags || [],
        };

        payload.metadata = {
          shortDescription: formData?.shortDescription,
          barcode: formData?.barcode,
          costPerItem: formData?.costPerItem,
          trackInventory: formData?.trackInventory,
          lowStockThreshold: formData?.lowStockThreshold,
          allowBackorders: formData?.allowBackorders,
          weight: formData?.weight,
          dimensions: formData?.length || formData?.width || formData?.height ? {
            length: formData?.length,
            width: formData?.width,
            height: formData?.height,
          } : undefined,
          metaTitle: formData?.metaTitle,
          metaDescription: formData?.metaDescription,
        };

        const url = isNew ? apiUrl("/api/admin/products") : apiUrl(`/api/admin/products/${productId}`);
        const method = isNew ? "POST" : "PUT";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          if (isNew && data.data?.id) {
            isNavigationSafeRef.current = true; // Mark navigation as safe
            router.replace(`/admin/products/${data.data.id}`);
          } else {
            reset(formData, { keepDirty: false });
          }
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } else {
          setAutoSaveStatus("idle");
        }
      } catch (error) {
        setAutoSaveStatus("idle");
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, saving, savingDraft, imageUploading, getValues, isNew, productId, router, reset]);

  // Initialize image order
  React.useEffect(() => {
    if (images.length > 0 && imageOrder.length !== images.length) {
      setImageOrder(images.map((_, i) => i));
    }
  }, [images.length]);

  // Save draft
  const saveDraft = React.useCallback(async (silent = false): Promise<void> => {
    if (!silent) setSavingDraft(true);

    try {
      const formData = getValues();
      const nameStr = (formData?.name ?? "").toString().trim();
      const slugStr = (formData?.slug ?? "").toString().trim();
      const descStr = (formData?.description ?? "").toString().trim();
      const skuStr = (formData?.sku ?? "").toString().trim();

      const priceFields = apiPricesFromForm(
        typeof formData?.price === "number" && !Number.isNaN(formData.price)
          ? formData.price
          : 0,
        formData?.salePrice
      );
      // Transform to API format
      const payload: any = {
        name: nameStr,
        slug: slugStr,
        description: descStr,
        sku: skuStr,
        price: priceFields.price,
        originalPrice: priceFields.originalPrice,
        categoryId: formData?.categoryId ?? "",
        images: formData?.images || [],
        inStock: formData?.status === "active",
        visibleOnStore: effectiveVisibleOnStore(formData as ProductFormData),
        sizes: (formData?.variants || [])
          .filter(v => (v?.size ?? "").toString().trim() !== "")
          .map(v => ({
            size: (v?.size ?? "").toString().trim(),
            quantity: v?.stock ?? 0,
          })),
        tags: formData?.tags || [],
      };

      // Add metadata
      payload.metadata = {
        shortDescription: formData?.shortDescription,
        barcode: formData?.barcode,
        costPerItem: formData?.costPerItem,
        trackInventory: formData?.trackInventory,
        lowStockThreshold: formData?.lowStockThreshold,
        allowBackorders: formData?.allowBackorders,
        weight: formData?.weight,
        dimensions: formData?.length || formData?.width || formData?.height ? {
          length: formData?.length,
          width: formData?.width,
          height: formData?.height,
        } : undefined,
        metaTitle: formData?.metaTitle,
        metaDescription: formData?.metaDescription,
      };

      const url = isNew ? apiUrl("/api/admin/products") : apiUrl(`/api/admin/products/${productId}`);
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (!silent) {
          showToast({
            type: "success",
            title: "Draft Saved",
            message: "Your changes have been saved as a draft",
          });
        }
        if (isNew && data.data?.id) {
          isNavigationSafeRef.current = true; // Mark navigation as safe
          router.replace(`/admin/products/${data.data.id}`);
        } else {
          reset(getValues(), { keepDirty: false });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = parseApiValidationMessage(response.status, errorData);
        throw new Error(message || "Failed to save draft");
      }
    } catch (error) {
      if (!silent) {
        showToast({
          type: "error",
          title: "Save Failed",
          message: error instanceof Error ? error.message : "Failed to save draft. Please try again.",
        });
      }
      throw error;
    } finally {
      if (!silent) setSavingDraft(false);
    }
  }, [getValues, isNew, productId, router, reset, showToast]);

  // Submit form
  const onSubmit = async (data: ProductFormData): Promise<void> => {
    setSaving(true);

    try {
      const validImages = (data.images || []).map((image) => image.trim()).filter(Boolean);
      const hasInStockVariant = (data.variants || []).some((variant) => (variant.stock ?? 0) > 0);
      const storefrontVisible = effectiveVisibleOnStore(data);

      if (storefrontVisible && validImages.length === 0) {
        throw new Error("Add at least one image before publishing this product to the storefront.");
      }

      if (storefrontVisible && !hasInStockVariant) {
        throw new Error("Set stock above 0 for at least one variant before publishing to the storefront.");
      }

      const nameStr = (data?.name ?? "").toString().trim();
      const slugStr = (data?.slug ?? "").toString().trim();
      const descStr = (data?.description ?? "").toString().trim();
      const skuStr = (data?.sku ?? "").toString().trim();

      const priceFields = apiPricesFromForm(data.price, data.salePrice);
      // Transform to API format (API expects price in major units; it converts to pesewas)
      const payload: any = {
        name: nameStr,
        slug: slugStr,
        description: descStr,
        sku: skuStr,
        price: priceFields.price,
        originalPrice: priceFields.originalPrice,
        categoryId: data.categoryId,
        images: validImages,
        inStock: data.status === "active",
        visibleOnStore: effectiveVisibleOnStore(data),
        sizes: (data.variants || [])
          .filter(v => (v?.size ?? "").toString().trim() !== "")
          .map(v => ({
            size: (v?.size ?? "").toString().trim(),
            quantity: v?.stock ?? 0,
          })),
        tags: data.tags || [],
      };

      // Add metadata
      payload.metadata = {
        shortDescription: data.shortDescription,
        barcode: data.barcode,
        costPerItem: data.costPerItem,
        trackInventory: data.trackInventory,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorders: data.allowBackorders,
        weight: data.weight,
        dimensions: data.length || data.width || data.height ? {
          length: data.length,
          width: data.width,
          height: data.height,
        } : undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      };

      const url = isNew ? apiUrl("/api/admin/products") : apiUrl(`/api/admin/products/${productId}`);
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success !== false) {
        // Mark navigation as safe (bypass unsaved changes warning)
        isNavigationSafeRef.current = true;
        
        showToast({
          type: "success",
          title: "Success",
          message: isNew ? "Product created successfully!" : "Product updated successfully!",
        });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("products_updated", Date.now().toString());
          } catch (_) {}
        }
        setSaving(false);
        startNavTransition(() => {
          onSuccess?.();
          if (!skipRedirectAfterSave) {
            router.push("/admin/products");
          }
          router.refresh();
        });
      } else {
        const message = parseApiValidationMessage(response.status, responseData);
        throw new Error(message || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to save product. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (): Promise<void> => {
    if (!productId || isNew) return;

    setSaving(true);
    try {
      const response = await fetch(apiUrl(`/api/admin/products/${productId}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        showToast({
          type: "success",
          title: "Product Deleted",
          message: "Product has been deleted successfully",
        });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("products_updated", Date.now().toString());
          } catch (_) {}
        }
        router.push("/admin/products");
        router.refresh();
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete product. Please try again.",
      });
    } finally {
      setSaving(false);
      setDeleteConfirm(false);
    }
  };

  // Handle image reordering
  const handleImageReorder = (fromIndex: number, toIndex: number): void => {
    const newOrder = [...imageOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setImageOrder(newOrder);

    const reorderedImages = newOrder.map(i => images[i]);
    setValue("images", reorderedImages, { shouldDirty: true });
  };

  // Set primary image
  const setPrimaryImage = (index: number): void => {
    const newOrder = [index, ...imageOrder.filter(i => i !== index)];
    setImageOrder(newOrder);
    const reorderedImages = newOrder.map(i => images[i]);
    setValue("images", reorderedImages, { shouldDirty: true });
  };

  const removeOrderedImage = (imageIndex: number): void => {
    const nextImages = images.filter((_, i) => i !== imageIndex);
    setValue("images", nextImages, { shouldDirty: true, shouldValidate: true });
    setImageOrder(nextImages.map((_, i) => i));
  };

  // Scroll to section
  const scrollToSection = (sectionId: string): void => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Intersection observer for active section
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace("section-", "");
            setActiveSection(sectionId);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    FORM_SECTIONS.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Unsaved changes warning - beforeunload (browser navigation)
  React.useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Track if navigation is safe (after successful save)
  const isNavigationSafeRef = React.useRef(false);

  // Intercept Link clicks for unsaved changes warning
  React.useEffect(() => {
    if (!isDirty) return;

    const handleLinkClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;
      
      // Allow navigation to same product page
      if (link.href.includes(`/admin/products/${productId || 'new'}`)) {
        return;
      }
      
      // Allow navigation if we just saved
      if (isNavigationSafeRef.current) {
        isNavigationSafeRef.current = false;
        return;
      }
      
      // Check if it's an admin route (we want to warn for these)
      if (link.href.includes('/admin/')) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        );
        
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isDirty, productId]);

  return (
    <div className="adm-light-surface flex gap-6 min-h-[calc(100vh-8rem)] h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation - Admin design system */}
      <aside className="w-64 flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-4 overflow-y-auto sticky top-0 self-start max-h-[calc(100vh-8rem)]">
        <div className="space-y-1">
          {FORM_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3",
                  activeSection === section.id
                    ? "bg-navy-600 text-white shadow-md"
                    : "text-charcoal-700 hover:bg-cream-100 border border-transparent"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Auto-save Status */}
        <div className="mt-6 pt-6 border-t border-cream-200/50">
          <div className="flex items-center gap-2 text-xs text-charcoal-600">
            {autoSaveStatus === "saving" && (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {autoSaveStatus === "saved" && (
              <>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-green-600">All changes saved</span>
              </>
            )}
            {autoSaveStatus === "idle" && isDirty && (
              <>
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - min-height prevents collapse when typing or validation messages appear */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-[480px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 pb-16">
            {/* Basic Information */}
            <section id="section-basic" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6 min-h-[320px]">
            <h2 className="text-2xl font-bold text-charcoal-900">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      value={field.value ?? ""}
                      label="Product Name"
                      error={errors.name?.message}
                      required
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      value={field.value ?? ""}
                      label="URL Slug"
                      error={errors.slug?.message}
                      helperText="Auto-generated from product name"
                      required
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="sku"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      value={field.value ?? ""}
                      label="SKU"
                      error={errors.sku?.message}
                      helperText="Stock Keeping Unit"
                      required
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      value={field.value ?? ""}
                      label="Barcode (Optional)"
                      error={errors.barcode?.message}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700 mb-compact-2 leading-compact-tight">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-control-compact px-compact-4 border border-cream-300 rounded-compact bg-white text-compact-md leading-compact-normal text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="visibleOnStore"
                  disabled={status !== "active"}
                  {...register("visibleOnStore")}
                  className="mt-1 h-4 w-4 rounded border-cream-300 text-navy-600 focus:ring-navy-500 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <div>
                  <label htmlFor="visibleOnStore" className="block text-sm font-medium text-charcoal-700">
                    Visible on website
                  </label>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    When off, product is warehouse-only and hidden from the storefront. Set{" "}
                    <strong>Status</strong> to <strong>Active</strong> to enable this option.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700 mb-compact-2 leading-compact-tight">
                  Description <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      value={field.value ?? ""}
                      label="Product Description"
                      rows={8}
                      error={errors.description?.message}
                      helperText="Use markdown for formatting (e.g., **bold**, *italic*, - lists)"
                      required
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      value={field.value ?? ""}
                      label="Short Description"
                      rows={3}
                      error={errors.shortDescription?.message}
                      helperText={`${(field.value ?? "").length}/160 characters`}
                      maxLength={160}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {/* Images Section */}
          <section id="section-images" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Images</h2>
              <p className="text-sm text-charcoal-600">Recommended size: 1200x1200px</p>
            </div>

            <ImageUpload
              images={images}
              onChange={(urls) => setValue("images", urls, { shouldDirty: true })}
              maxImages={10}
              disabled={saving}
              onUploadingChange={setImageUploading}
            />

            {images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-charcoal-900">Image Order</h3>
                <div className="space-y-2">
                  {imageOrder.map((imgIndex, displayIndex) => (
                    <div
                      key={imgIndex}
                      className="flex items-center gap-4 p-3 border border-cream-200/50 rounded-lg hover:bg-cream-50"
                    >
                      <GripVertical className="w-5 h-5 text-charcoal-400 cursor-move" />
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                        <SimpleOptimizedImage
                          src={images[imgIndex]}
                          alt={`Product image ${displayIndex + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-900">
                          Image {displayIndex + 1}
                          {displayIndex === 0 && (
                            <span className="ml-2 text-xs text-navy-600 font-semibold">(Primary)</span>
                          )}
                        </p>
                      </div>
                      {displayIndex !== 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="compact"
                          onClick={() => setPrimaryImage(imgIndex)}
                        >
                          Set as Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="compact"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeOrderedImage(imgIndex)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Pricing Section */}
          <section id="section-pricing" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      type="number"
                      step="0.01"
                      min={0}
                      value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : (parseFloat(v) ?? undefined));
                      }}
                      label="Regular Price (₵)"
                      error={errors.price?.message}
                      required
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="salePrice"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      type="number"
                      step="0.01"
                      min={0}
                      value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : (parseFloat(v) ?? undefined));
                      }}
                      label="Sale Price (₵)"
                      error={errors.salePrice?.message}
                      helperText="Must be less than regular price"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="costPerItem"
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      type="number"
                      step="0.01"
                      min={0}
                      value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : (parseFloat(v) ?? undefined));
                      }}
                      label="Cost per Item (₵)"
                      error={errors.costPerItem?.message}
                      helperText="For profit tracking"
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {/* Inventory Section */}
          <section id="section-inventory" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Inventory</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-lg">
                <input
                  type="checkbox"
                  {...register("trackInventory")}
                  className="w-5 h-5 text-navy-600 border-cream-300 rounded focus:ring-2 focus:ring-navy-500"
                />
                <div>
                  <label className="text-sm font-medium text-charcoal-900">Track Inventory</label>
                  <p className="text-xs text-charcoal-600">Enable inventory tracking for this product</p>
                </div>
              </div>

              {watch("trackInventory") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FloatingInput
                        type="number"
                        {...register("stockQuantity", { valueAsNumber: true })}
                        label="Stock Quantity"
                        error={errors.stockQuantity?.message}
                      />
                    </div>

                    <div>
                      <FloatingInput
                        type="number"
                        {...register("lowStockThreshold", { valueAsNumber: true })}
                        label="Low Stock Threshold"
                        error={errors.lowStockThreshold?.message}
                        helperText="Alert when stock falls below this number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-lg">
                    <input
                      type="checkbox"
                      {...register("allowBackorders")}
                      className="w-5 h-5 text-navy-600 border-cream-300 rounded focus:ring-2 focus:ring-navy-500"
                    />
                    <div>
                      <label className="text-sm font-medium text-charcoal-900">Allow Backorders</label>
                      <p className="text-xs text-charcoal-600">Allow customers to purchase out-of-stock items</p>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-cream-200/50">
                <div>
                  <FloatingInput
                    type="number"
                    step="0.01"
                    {...register("weight", { valueAsNumber: true })}
                    label="Weight (kg)"
                    error={errors.weight?.message}
                  />
                </div>
                <div>
                  <FloatingInput
                    type="number"
                    step="0.01"
                    {...register("length", { valueAsNumber: true })}
                    label="Length (cm)"
                    error={errors.length?.message}
                  />
                </div>
                <div>
                  <FloatingInput
                    type="number"
                    step="0.01"
                    {...register("width", { valueAsNumber: true })}
                    label="Width (cm)"
                    error={errors.width?.message}
                  />
                </div>
                <div>
                  <FloatingInput
                    type="number"
                    step="0.01"
                    {...register("height", { valueAsNumber: true })}
                    label="Height (cm)"
                    error={errors.height?.message}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Variants Section */}
          <section id="section-variants" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal-900">Variants</h2>
              <Button
                type="button"
                variant="secondary"
                size="compact"
                onClick={() => {
                  const newVariants = [...variants, { size: "", stock: 0 }];
                  setValue("variants", newVariants, { shouldDirty: true });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-50 border-b border-cream-200/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Color</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-charcoal-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/50">
                  {variants.map((variant, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <select
                          {...register(`variants.${index}.size`)}
                          className="w-full h-control-compact px-compact-4 border border-cream-300 rounded-compact bg-white text-compact-md leading-compact-normal focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                        >
                          <option value="">Select size</option>
                          {DEFAULT_PRODUCT_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          {...register(`variants.${index}.color`)}
                          placeholder="Optional"
                          density="compact"
                          className="bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[7rem]">
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`variants.${index}.price`, { valueAsNumber: true })}
                          placeholder="Override price"
                          density="compact"
                          className="input-number-no-spinner w-full min-w-0 bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[8rem]">
                        <Input
                          type="text"
                          {...register(`variants.${index}.sku`)}
                          placeholder="Variant SKU"
                          density="compact"
                          className="w-full min-w-0 bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[6rem]">
                        <Input
                          type="number"
                          {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                          placeholder="0"
                          density="compact"
                          className="input-number-no-spinner w-full min-w-0 bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="compact"
                          onClick={() => {
                            const newVariants = variants.filter((_, i) => i !== index);
                            setValue("variants", newVariants, { shouldDirty: true });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Categories Section */}
          <section id="section-categories" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Categories & Tags</h2>

            <div>
              <label className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700 mb-compact-2 leading-compact-tight">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register("categoryId")}
                className="w-full h-control-compact px-compact-4 border border-cream-300 rounded-compact bg-white text-compact-md leading-compact-normal focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-700 mb-compact-2 leading-compact-tight">Tags</label>
              <Input
                type="text"
                placeholder="Enter tags separated by commas (e.g., new, sale, bestseller)"
                density="compact"
                className="bg-white border-cream-300 focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                onChange={(e) => {
                  const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                  setValue("tags", tags, { shouldDirty: true });
                }}
                defaultValue={watch("tags")?.join(", ") || ""}
              />
              <p className="text-xs text-charcoal-600 mt-1">Separate multiple tags with commas</p>
            </div>
          </section>

          {/* SEO Section */}
          <section id="section-seo" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-cream-200/50 p-6 space-y-6">
            <h2 className="text-2xl font-bold text-charcoal-900">SEO Settings</h2>

            <div className="space-y-6">
              <div>
                <FloatingInput
                  {...register("metaTitle")}
                  label="Meta Title"
                  error={errors.metaTitle?.message}
                  helperText={`${(metaTitle || "").length}/60 characters`}
                  maxLength={60}
                />
              </div>

              <div>
                <FloatingTextarea
                  {...register("metaDescription")}
                  label="Meta Description"
                  rows={3}
                  error={errors.metaDescription?.message}
                  helperText={`${(metaDescription || "").length}/160 characters`}
                  maxLength={160}
                />
              </div>

              {/* SEO Preview */}
              <div className="border border-cream-200/50 rounded-lg p-4 bg-cream-50">
                <h3 className="text-sm font-semibold text-charcoal-700 mb-3">Search Engine Preview</h3>
                <div className="space-y-1">
                  <p className="text-lg text-blue-600 hover:underline cursor-pointer">
                    {metaTitle || "Product Name"}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    {metaDescription || "Product description will appear here"}
                  </p>
                  <p className="text-sm text-green-700">
                    {slug ? `extremedeptkidz.com/products/${slug}` : "extremedeptkidz.com/products/..."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-cream-200/50 p-6 -mx-6 -mb-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              {!isNew && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteConfirm(true)}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => saveDraft()}
                disabled={saving || savingDraft || imageUploading}
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const productSlug = slug || "product";
                  window.open(`/products/${productSlug}`, "_blank");
                }}
                disabled={!slug}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={saving || savingDraft || imageUploading}
                className="shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isNew ? "Publish Product" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
