"use client";

import * as React from "react";
import Image from "next/image";
import { X, Upload, MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

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
  const { showToast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      showToast({
        type: "error",
        title: "Too Many Images",
        message: `Maximum ${maxImages} images allowed`,
      });
      return;
    }

    // Authentication is handled by httpOnly cookie sent automatically with credentials: 'include'
    // No need to check token in store - middleware validates cookie on server
    if (process.env.NODE_ENV === 'development') {
      console.log('[ImageUpload] Starting upload - cookie will be sent automatically');
    }

    setUploading(true);

    try {
      
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Enhanced logging for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ImageUpload] Processing file ${index + 1}/${files.length}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
          });
        }
        
        // Validate file type - accept all image types (JPEG, PNG, WebP, HEIC, etc.)
        // Some mobile browsers don't set MIME type correctly, so we're lenient
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
        const hasValidMimeType = file.type && (file.type.startsWith("image/") || validImageTypes.some(type => file.type.toLowerCase() === type));
        
        // Check file extension as fallback (critical for mobile browsers)
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        // If no MIME type and no valid extension, reject
        if (!hasValidMimeType && !hasValidExtension) {
          throw new Error(`${file.name} is not a supported image file. Supported formats: JPEG, PNG, WebP, GIF, HEIC`);
        }
        
        // Log validation result
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ImageUpload] File validation passed for ${file.name}:`, {
            hasValidMimeType,
            hasValidExtension,
            mimeType: file.type || '(not set)',
          });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const formData = new FormData();
        formData.append("file", file);
        
        // No token needed - httpOnly cookie is sent automatically with credentials: 'include'
        const headers: HeadersInit = {};

        if (process.env.NODE_ENV === 'development') {
          console.log('[ImageUpload] Uploading file:', file.name, `(${(file.size / 1024).toFixed(2)}KB)`);
        }
        
        let response: Response | null = null;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          let timeoutId: NodeJS.Timeout | null = null;
          try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            response = await fetch("/api/admin/upload", {
              method: "POST",
              headers,
              body: formData,
              credentials: 'include', // Include cookies as fallback
              signal: controller.signal,
            });
            
            if (timeoutId) clearTimeout(timeoutId);
            break; // Success, exit retry loop
          } catch (networkError) {
            if (timeoutId) clearTimeout(timeoutId);
            
            // If it's an abort (timeout), don't retry
            if (networkError instanceof Error && networkError.name === 'AbortError') {
              throw new Error("Upload timeout. Please try again with a smaller file.");
            }
            
            // If we've exhausted retries, throw the error
            if (retryCount >= maxRetries) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[ImageUpload] Network error during upload after retries:', networkError);
              }
              throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to server'}`);
            }
            
            // Retry with exponential backoff
            retryCount++;
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[ImageUpload] Upload attempt ${retryCount} failed, retrying...`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 1s, 2s delays
            
            // Cookie is automatically sent with credentials: 'include' - no token refresh needed
          }
        }

        if (!response) {
          throw new Error("Failed to upload: No response received after retries");
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[ImageUpload] Upload response status:', response.status, response.statusText);
        }
        
        // Parse response body - clone first to avoid reading body twice
        const responseClone = response.clone();
        let responseData: any;
        try {
          const contentType = response.headers.get('content-type') || '';
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ImageUpload] Parsing response for ${file.name}:`, {
              status: response.status,
              contentType,
              ok: response.ok,
            });
          }
          
          if (contentType.includes('application/json')) {
            responseData = await response.json();
          } else {
            // Try to parse as JSON even if content-type is not set
            const responseText = await response.text();
            if (process.env.NODE_ENV === 'development') {
              console.log('[ImageUpload] Response body (text, first 500 chars):', responseText.substring(0, 500));
            }
            
            if (!responseText || responseText.trim().length === 0) {
              throw new Error("Server returned empty response. Please try again.");
            }
            
            try {
              responseData = JSON.parse(responseText);
            } catch (parseError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[ImageUpload] Failed to parse JSON:', parseError, 'Response text:', responseText.substring(0, 200));
              }
              // If parsing fails, check if it's an error response
              if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
              }
              throw new Error("Server returned invalid JSON response. Please try again.");
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ImageUpload] Response data for ${file.name}:`, responseData);
          }
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[ImageUpload] Failed to parse response:', parseError);
          }
          
          // If response is not OK, try to get error text from clone
          if (!response.ok) {
            try {
              const errorText = await responseClone.text();
              const errorData = errorText ? JSON.parse(errorText) : {};
              const errorMsg = errorData.message || errorData.error || `Upload failed (${response.status}): ${response.statusText}`;
              throw new Error(errorMsg);
            } catch (cloneError) {
              throw new Error(`Upload failed (${response.status}): ${response.statusText}. Please try again.`);
            }
          }
          
          throw new Error(`Server returned invalid response (status ${response.status}): ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Please try again.`);
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.message || responseData?.error || `Upload failed with status ${response.status}`;
          const errorDetails = responseData?.details || responseData?.diagnostic;
          
          if (process.env.NODE_ENV === 'development') {
            console.error('[ImageUpload] Upload failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorMessage,
              details: errorDetails,
              fullResponse: responseData,
            });
          }
          
          // Provide specific error messages based on status code
          if (response.status === 401) {
            throw new Error("Authentication failed. Please refresh the page and log in again.");
          } else if (response.status === 400) {
            throw new Error(errorMessage || "Invalid file. Please check the file type and size.");
          } else if (response.status === 413) {
            throw new Error("File is too large. Maximum size is 5MB.");
          } else if (response.status === 500) {
            throw new Error(errorMessage || "Server error occurred. Please try again.");
          } else {
            throw new Error(errorMessage || `Upload failed: ${response.statusText}`);
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ImageUpload] ✅ Upload successful, response:', responseData);
        }

        // Ensure we get a valid URL string - accept relative paths, absolute URLs, and data URLs
        const url = responseData?.url || responseData?.urls?.[0];
        if (!url) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[ImageUpload] Invalid response format - no URL field:', responseData);
          }
          throw new Error("Server returned invalid response format. Expected 'url' field.");
        }
        
        // Convert to string and validate
        const urlString = String(url).trim();
        if (urlString.length === 0) {
          throw new Error("Server returned empty URL");
        }
        
        // Validate URL format - accept relative paths, absolute URLs, and data URLs
        const isValidUrl = 
          urlString.startsWith('/') || // Relative path
          urlString.startsWith('http://') || // HTTP URL
          urlString.startsWith('https://') || // HTTPS URL
          urlString.startsWith('data:') || // Data URL (base64)
          urlString.startsWith('./') || // Relative path with ./
          urlString.startsWith('../'); // Relative path with ../
        
        if (!isValidUrl && process.env.NODE_ENV === 'development') {
          console.warn('[ImageUpload] URL format may be invalid:', urlString);
          // Don't throw, just warn - some servers might return non-standard URLs
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ImageUpload] ✅ Valid URL received:', urlString);
        }
        return urlString;
      });

      const urls = await Promise.all(uploadPromises);
      
      // Filter out any null/undefined URLs and ensure they're strings
      const validUrls = urls
        .filter(url => url != null && url !== '')
        .map(url => String(url).trim())
        .filter(url => url.length > 0);
      
      // Check if we got any valid URLs
      if (validUrls.length === 0) {
        // This is a critical error - uploads succeeded but no URLs were returned
        const errorMsg = urls.length === 0 
          ? "Upload completed but no images were returned. Please try again."
          : `Upload completed but ${urls.length} image(s) failed to process. Please try again.`;
        
        if (process.env.NODE_ENV === 'development') {
          console.error('[ImageUpload] ❌ No valid URLs returned after upload:', {
            totalFiles: files.length,
            urlsReceived: urls,
            validUrls: validUrls,
          });
        }
        
        showToast({
          type: "error",
          title: "Upload Failed",
          message: errorMsg,
        });
        return; // Exit early - don't update state
      }
      
      // Success - combine existing images with new ones
      const allUrls = [...images, ...validUrls];
      onChange(allUrls);
      
      // Show success feedback
      showToast({
        type: "success",
        title: "Images Uploaded",
        message: `Successfully uploaded ${validUrls.length} image${validUrls.length > 1 ? 's' : ''}`,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ImageUpload] ✅ Successfully added', validUrls.length, 'image(s):', validUrls);
      }
    } catch (error) {
      // Enhanced error logging
      if (process.env.NODE_ENV === 'development') {
        console.error('[ImageUpload] ❌ Upload error:', error);
        if (error instanceof Error) {
          console.error('[ImageUpload] Error stack:', error.stack);
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to upload images. Please try again.";
      showToast({
        type: "error",
        title: "Upload Failed",
        message: errorMessage,
        duration: 5000, // Show longer for errors
      });
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
          accept="image/*"
          onChange={async (e) => {
            // Prevent all default behavior and validation
            e.preventDefault();
            e.stopPropagation();
            
            const fileInput = e.target as HTMLInputElement;
            const files = fileInput.files;
            
            if (files && files.length > 0) {
              // CRITICAL: Convert FileList to Array immediately before resetting input
              // Some browsers clear the FileList when input.value is reset
              const filesArray = Array.from(files);
              
              // Reset the input value to allow selecting the same file again
              fileInput.value = '';
              
              // Create a new FileList-like object from the array
              // handleFileSelect expects FileList, but we'll convert it internally
              // For now, pass the array directly by creating a DataTransfer object
              const dataTransfer = new DataTransfer();
              filesArray.forEach(file => dataTransfer.items.add(file));
              const fileList = dataTransfer.files;
              
              // Process files asynchronously
              try {
                await handleFileSelect(fileList);
              } catch (error) {
                // Error is already handled in handleFileSelect
                if (process.env.NODE_ENV === 'development') {
                  console.error('[ImageUpload] Error in onChange handler:', error);
                }
              }
            }
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
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-navy-900"></div>
            <p className="text-xs sm:text-sm text-charcoal-600">Uploading images...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-charcoal-400" />
            <div className="px-2">
              <p className="text-xs sm:text-sm font-medium text-charcoal-900">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                {images.length}/{maxImages} images uploaded • Max 5MB each
              </p>
              <p className="text-xs text-charcoal-400 mt-1 hidden sm:block">
                On mobile: Tap to access camera or gallery
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square group bg-cream-100 rounded-lg overflow-hidden"
            >
              {/* Use regular img tag for base64 data URLs, Next Image for regular URLs */}
              {url.startsWith('data:') ? (
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}

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
