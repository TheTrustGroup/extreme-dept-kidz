"use client";

import * as React from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";

interface SingleImageUploadProps {
  imageUrl: string | null | undefined;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Single Image Upload Component for Admin
 * 
 * Allows drag-and-drop or click to upload a single image (for categories, etc.)
 */
export function SingleImageUpload({
  imageUrl,
  onChange,
  disabled = false,
  label = "Category Image",
}: SingleImageUploadProps): JSX.Element {
  const { showToast } = useToast();
  const { checkAuth, isAuthenticated } = useAdminAuth();
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | File[] | null): Promise<void> => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Verify authentication
    if (!isAuthenticated) {
      const authValid = await checkAuth();
      if (!authValid) {
        showToast({
          type: "error",
          title: "Authentication Required",
          message: "Please refresh the page and log in again to upload images.",
        });
        return;
      }
    }

    setUploading(true);

    try {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
      const hasValidMimeType = file.type && (file.type.startsWith("image/") || validImageTypes.some(type => file.type.toLowerCase() === type));
      
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidMimeType && !hasValidExtension) {
        throw new Error(`${file.name} is not a supported image file. Supported formats: JPEG, PNG, WebP, GIF, HEIC`);
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} is too large (max 5MB)`);
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const uploadedUrl = data.url || data.data?.url;

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no URL returned");
      }

      onChange(uploadedUrl);
      showToast({
        type: "success",
        title: "Image Uploaded",
        message: "Category image uploaded successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      showToast({
        type: "error",
        title: "Upload Failed",
        message: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = (): void => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = (): void => {
    if (disabled) return;
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {imageUrl ? (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
            <Image
              src={imageUrl}
              alt="Category image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-sm transition-opacity hover:bg-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!disabled && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Change Image"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
