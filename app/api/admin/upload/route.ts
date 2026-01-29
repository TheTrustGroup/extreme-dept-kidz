import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { cookies } from 'next/headers';
import { authenticateRequest } from '@/lib/auth/middleware';
import { hasRequiredRole } from '@/lib/auth/rbac';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Image Upload API Route
 * 
 * Handles file uploads for product images.
 * In production, you should use a cloud storage service (S3, Cloudinary, etc.)
 * 
 * For now, this saves files to /public/uploads/
 */
/**
 * Verify admin authentication - checks cookie, header, and optionally FormData token
 */
async function verifyAdminAuth(
  request: NextRequest,
  tokenFromFormData?: string | null
): Promise<{
  authenticated: boolean;
  user: { id: string; email: string; role: string } | null;
  method: string;
}> {
  // Method 1: Check cookie (primary method for server-side)
  const cookieStore = cookies();
  const tokenFromCookie = cookieStore.get('admin-token')?.value;

  // Method 2: Check Authorization header
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = extractTokenFromHeader(authHeader);

  // Method 3: Use token from FormData if provided
  let token = tokenFromCookie || tokenFromHeader || tokenFromFormData || null;

  if (!token) {
    console.error('[Upload] ❌ No token found in cookie, header, or FormData');
    return { authenticated: false, user: null, method: 'none' };
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    console.error('[Upload] ❌ Invalid or expired token');
    return { authenticated: false, user: null, method: 'invalid' };
  }

  // Verify user exists and is active
  if (!prisma) {
    console.error('[Upload] ❌ Prisma client not available');
    return { authenticated: false, user: null, method: 'database_error' };
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      console.error('[Upload] ❌ User not found or inactive');
      return { authenticated: false, user: null, method: 'user_inactive' };
    }

    const method = tokenFromCookie ? 'cookie' : tokenFromHeader ? 'header' : 'formdata';
    logger.log(`[Upload] ✅ Authentication successful via ${method}`);
    
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      method,
    };
  } catch (error) {
    console.error('[Upload] ❌ Database error during auth:', error);
    return { authenticated: false, user: null, method: 'database_error' };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[Upload] Starting upload request...');
    
    // Get formData first to extract token if needed
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('[Upload] FormData parsed successfully');
    } catch (formDataError) {
      console.error('[Upload] Failed to parse FormData:', formDataError);
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          message: 'Failed to parse form data. Please try again.',
          details: formDataError instanceof Error ? formDataError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    const tokenInFormData = formData.get('token') as string | null;
    console.log('[Upload] Token in FormData:', !!tokenInFormData);

    // CRITICAL: Verify authentication and authorization
    // First check authentication
    const authResult = await verifyAdminAuth(request, tokenInFormData || undefined);

    if (!authResult.authenticated || !authResult.user) {
      const cookieStore = cookies();
      console.error('[Upload] ❌ Authentication failed:', {
        authenticated: authResult.authenticated,
        method: authResult.method,
        hasCookie: !!cookieStore.get('admin-token')?.value,
        hasHeader: !!request.headers.get('authorization'),
        hasFormDataToken: !!tokenInFormData,
      });
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Admin authentication required. Please log in to upload images.',
          diagnostic: {
            hasCookie: !!cookieStore.get('admin-token')?.value,
            hasHeader: !!request.headers.get('authorization'),
            hasFormDataToken: !!tokenInFormData,
            authMethod: authResult.method,
          }
        },
        { status: 401 }
      );
    }

    // RBAC: Uploading images requires admin role or higher
    if (!hasRequiredRole(authResult.user.role, 'admin')) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: 'Admin role required to upload images.',
          userRole: authResult.user.role,
        },
        { status: 403 }
      );
    }

    console.log('[Upload] ✅ Authentication and authorization successful via', authResult.method);

    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('[Upload] ❌ No file provided in FormData');
      return NextResponse.json(
        { 
          error: 'No file provided',
          message: 'Please select an image file to upload.'
        },
        { status: 400 }
      );
    }

    console.log('[Upload] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[Upload] ❌ Invalid file type:', file.type);
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          message: 'File must be an image (JPEG, PNG, WebP, etc.)'
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('[Upload] ❌ File too large:', file.size, 'bytes');
      return NextResponse.json(
        { 
          error: 'File too large',
          message: `File size must be less than 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const originalExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${originalExtension}`;
    console.log('[Upload] Generated filename:', filename);

    // Check if we're in a serverless environment (Vercel, etc.)
    const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    console.log('[Upload] Environment:', {
      isServerless,
      vercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
    });

    // Read file bytes
    console.log('[Upload] Reading file bytes...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // In serverless environments, we can't write to the filesystem permanently
    // So we'll convert to base64 and return as data URL
    if (isServerless) {
      console.log('[Upload] Serverless environment detected - using base64 encoding');
      
      try {
        // Convert to base64
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        console.log('[Upload] ✅ File converted to base64, size:', base64.length, 'chars');
        
        return NextResponse.json({ 
          url: dataUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          encoding: 'base64',
        });
      } catch (base64Error) {
        console.error('[Upload] ❌ Failed to convert to base64:', base64Error);
        return NextResponse.json(
          { 
            error: 'File encoding failed',
            message: 'Failed to process the uploaded file. Please try again.',
            details: base64Error instanceof Error ? base64Error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // For non-serverless environments, try to write to filesystem
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('[Upload] Uploads directory:', uploadsDir);
    
    try {
      if (!existsSync(uploadsDir)) {
        console.log('[Upload] Creating uploads directory...');
        await mkdir(uploadsDir, { recursive: true });
        console.log('[Upload] ✅ Uploads directory created');
      } else {
        console.log('[Upload] ✅ Uploads directory exists');
      }
    } catch (dirError) {
      console.error('[Upload] ❌ Failed to create uploads directory:', dirError);
      // Fallback to base64 if directory creation fails
      console.log('[Upload] Falling back to base64 encoding...');
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({ 
        url: dataUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        encoding: 'base64',
        fallback: true,
      });
    }

    // Save file to filesystem
    try {
      const filepath = join(uploadsDir, filename);
      
      console.log('[Upload] Writing file to:', filepath);
      await writeFile(filepath, buffer);
      console.log('[Upload] ✅ File written successfully');

      // Verify file was written
      if (!existsSync(filepath)) {
        console.error('[Upload] ❌ File was not written (verification failed)');
        // Fallback to base64
        console.log('[Upload] Falling back to base64 encoding...');
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({ 
          url: dataUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          encoding: 'base64',
          fallback: true,
        });
      }

      // Return public URL
      const url = `/uploads/${filename}`;
      console.log('[Upload] ✅ Upload successful, returning URL:', url);

      return NextResponse.json({ 
        url,
        filename,
        size: file.size,
        type: file.type,
        encoding: 'filesystem',
      });
    } catch (writeError) {
      console.error('[Upload] ❌ Failed to write file:', writeError);
      
      // Fallback to base64 encoding
      console.log('[Upload] Falling back to base64 encoding due to write error...');
      try {
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({ 
          url: dataUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          encoding: 'base64',
          fallback: true,
          fallbackReason: writeError instanceof Error ? writeError.message : 'File write failed',
        });
      } catch (base64Error) {
        console.error('[Upload] ❌ Base64 fallback also failed:', base64Error);
        return NextResponse.json(
          { 
            error: 'File processing failed',
            message: 'Failed to save the uploaded file. Please try again.',
            details: writeError instanceof Error ? writeError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('[Upload] ❌ Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: 'An unexpected error occurred while uploading the file. Please try again.',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
