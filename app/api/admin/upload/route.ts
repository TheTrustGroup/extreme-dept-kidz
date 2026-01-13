import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { cookies } from 'next/headers';
import { authenticateRequest } from '@/lib/auth/middleware';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

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
    console.log(`[Upload] ✅ Authentication successful via ${method}`);
    
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
    // Get formData first to extract token if needed
    const formData = await request.formData();
    const tokenInFormData = formData.get('token') as string | null;

    // CRITICAL: Verify authentication (checks cookie, header, and FormData token)
    const authResult = await verifyAdminAuth(request, tokenInFormData || undefined);

    if (!authResult.authenticated || !authResult.user) {
      console.error('[Upload] Authentication failed:', {
        hasCookie: !!cookies().get('admin-token')?.value,
        hasHeader: !!request.headers.get('authorization'),
        hasFormDataToken: !!tokenInFormData,
      });
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Admin authentication required. Please log in to upload images.',
        },
        { status: 401 }
      );
    }
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
