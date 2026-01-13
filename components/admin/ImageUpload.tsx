"use client";

import * as React from "react";
import Image from "next/image";
import { X, Upload, MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

/**
 * Image Upload Component for Admin
 * 
 * Allows drag-and-drop or click to upload multiple product images.
 * Supports reordering and removal of images.
 */
export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps): JSX.Element {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { token, isAuthenticated, checkAuth, syncCookie, refreshAuth } = useAdminAuth();

  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // CRITICAL: Verify and sync authentication before uploading
    console.log('[ImageUpload] Verifying authentication...');
    
    // Ensure cookie is synced
    syncCookie();
    
    // Verify auth is valid
    const authValid = await checkAuth();
    console.log('[ImageUpload] Auth check result:', authValid);
    
    if (!authValid) {
      console.error('[ImageUpload] Authentication failed - attempting refresh...');
      try {
        await refreshAuth();
        const retryAuth = await checkAuth();
        if (!retryAuth) {
          alert("Your session has expired. Please refresh the page and log in again.");
          return;
        }
      } catch (error) {
        console.error('[ImageUpload] Auth refresh failed:', error);
        alert("Authentication failed. Please refresh the page and log in again.");
        return;
      }
    }

    // Get fresh token after auth verification
    const currentToken = useAdminAuth.getState().token;
    console.log('[ImageUpload] Token exists:', !!currentToken);
    console.log('[ImageUpload] Token length:', currentToken?.length || 0);
    
    if (!currentToken) {
      console.error('[ImageUpload] Token not found in store');
      alert("Authentication token not found. Please refresh the page and log in again.");
      return;
    }

    // CRITICAL: Ensure cookie is synced one more time before upload
    syncCookie();
    console.log('[ImageUpload] Cookie synced before upload');

    setUploading(true);

    try {
      // Get token once for all uploads
      const uploadToken = useAdminAuth.getState().token;
      console.log('[ImageUpload] Using token for upload:', uploadToken ? 'Yes' : 'No');
      
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const formData = new FormData();
        formData.append("file", file);
        
        // CRITICAL: Add token to FormData as fallback (some browsers don't send custom headers with FormData)
        if (uploadToken) {
          formData.append("token", uploadToken);
          console.log('[ImageUpload] Added token to FormData');
        }

        // Prepare headers with authentication
        // Note: With FormData, custom headers might not be sent by all browsers
        // So we also include token in FormData above
        const headers: HeadersInit = {};
        if (uploadToken) {
          headers['Authorization'] = `Bearer ${uploadToken}`;
          console.log('[ImageUpload] Added Authorization header');
        } else {
          console.warn('[ImageUpload] No token available for Authorization header');
        }

        console.log('[ImageUpload] Uploading file:', file.name, `(${(file.size / 1024).toFixed(2)}KB)`);
        
        let response: Response;
        try {
          response = await fetch("/api/admin/upload", {
            method: "POST",
            headers,
            body: formData,
            credentials: 'include', // Include cookies as fallback
          });
        } catch (networkError) {
          console.error('[ImageUpload] Network error during upload:', networkError);
          throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to server'}`);
        }

        console.log('[ImageUpload] Upload response status:', response.status, response.statusText);
        
        // Parse response body
        let responseData: any;
        try {
          const responseText = await response.text();
          console.log('[ImageUpload] Response body:', responseText.substring(0, 200));
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('[ImageUpload] Failed to parse response:', parseError);
          throw new Error(`Server returned invalid response (status ${response.status})`);
        }
        
        if (!response.ok) {
          const errorMessage = responseData.message || responseData.error || `Upload failed with status ${response.status}`;
          const errorDetails = responseData.details || responseData.diagnostic;
          
          console.error('[ImageUpload] Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            details: errorDetails,
            fullResponse: responseData,
          });
          
          // Provide specific error messages based on status code
          if (response.status === 401) {
            throw new Error("Authentication failed. Please refresh the page and log in again.");
          } else if (response.status === 400) {
            throw new Error(errorMessage || "Invalid file. Please check the file type and size.");
          } else if (response.status === 413 || response.status === 400) {
            throw new Error("File is too large. Maximum size is 5MB.");
          } else if (response.status === 500) {
            throw new Error(errorMessage || "Server error occurred. Please try again.");
          } else {
            throw new Error(errorMessage || `Upload failed: ${response.statusText}`);
          }
        }
        
        console.log('[ImageUpload] ✅ Upload successful, response:', responseData);

        // Ensure we get a valid URL string
        const url = responseData?.url || responseData?.urls?.[0];
        if (!url || typeof url !== 'string') {
          console.error('[ImageUpload] Invalid response format:', responseData);
          throw new Error("Server returned invalid response format. Expected 'url' field.");
        }
        
        const trimmedUrl = url.trim();
        if (trimmedUrl.length === 0) {
          throw new Error("Server returned empty URL");
        }
        
        console.log('[ImageUpload] ✅ Valid URL received:', trimmedUrl);
        return trimmedUrl;
      });

      const urls = await Promise.all(uploadPromises);
      
      // Filter out any null/undefined URLs and ensure they're strings
      const validUrls = urls
        .filter(url => url != null && url !== '')
        .map(url => String(url).trim())
        .filter(url => url.length > 0);
      
      if (validUrls.length === 0) {
        throw new Error("No valid image URLs were returned from the upload");
      }
      
      // Combine existing images with new ones
      const allUrls = [...images, ...validUrls];
      onChange(allUrls);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = (index: number): void => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (from: number, to: number): void => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          "transition-all duration-200",
          dragActive
            ? "border-navy-500 bg-navy-50"
            : "border-cream-300 hover:border-cream-400",
          (disabled || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => {
            // Prevent all default behavior and validation
            e.preventDefault();
            e.stopPropagation();
            
            const files = e.target.files;
            if (files && files.length > 0) {
              // Use setTimeout to ensure validation doesn't interfere
              setTimeout(() => {
                handleFileSelect(files);
              }, 0);
            }
            
            // Reset the input value to allow selecting the same file again
            // This must happen after a delay to prevent validation errors
            setTimeout(() => {
              if (e.target) {
                e.target.value = '';
              }
            }, 100);
          }}
          onClick={(e) => {
            // Prevent validation on click
            e.stopPropagation();
          }}
          className="hidden"
          disabled={disabled || uploading}
          // Prevent browser validation completely
          formNoValidate
          // Explicitly disable HTML5 validation
          required={false}
          // Remove any pattern validation
          pattern=""
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900"></div>
            <p className="text-sm text-charcoal-600">Uploading images...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-charcoal-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-900">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                {images.length}/{maxImages} images uploaded • Max 5MB each
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square group bg-cream-100 rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-navy-900 text-cream-50 text-xs px-2 py-1 rounded font-semibold">
                  Primary
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-charcoal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    className="text-cream-50 hover:text-cream-50 hover:bg-charcoal-800"
                    title="Move left"
                  >
                    <MoveLeft className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-charcoal-800"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    className="text-cream-50 hover:text-cream-50 hover:bg-charcoal-800"
                    title="Move right"
                  >
                    <MoveRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
