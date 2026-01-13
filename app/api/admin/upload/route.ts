import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authenticateRequest } from '@/lib/auth/middleware';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

/**
 * Image Upload API Route
 * 
 * Handles file uploads for product images.
 * In production, you should use a cloud storage service (S3, Cloudinary, etc.)
 * 
 * For now, this saves files to /public/uploads/
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get formData first to check for token in FormData (fallback for browsers that don't send headers with FormData)
    const formData = await request.formData();
    const tokenInFormData = formData.get('token') as string | null;
    
    // Try authentication with standard method first
    let authResult = await authenticateRequest(request);
    
    // If that failed and we have token in FormData, try authenticating with that
    if (!authResult.user && tokenInFormData) {
      console.log('Upload: Standard auth failed, trying token from FormData...');
      const payload = verifyToken(tokenInFormData);
      if (payload && prisma) {
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
          
          if (user && user.isActive) {
            authResult = {
              user: {
                id: user.id,
                email: user.email,
                role: user.role,
              },
              error: null,
            };
            console.log('Upload: Authentication successful via FormData token');
          }
        } catch (error) {
          console.error('Upload: Error verifying FormData token:', error);
        }
      }
    }
    
    // Log authentication details
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('admin-token')?.value;
    console.log('Upload auth check:', {
      hasAuthHeader: !!authHeader,
      hasTokenInFormData: !!tokenInFormData,
      hasCookie: !!cookieToken,
      authResult: authResult.user ? 'success' : 'failed',
      error: authResult.error ? 'yes' : 'no',
    });
    
    if (authResult.error && !authResult.user) {
      return authResult.error;
    }

    if (!authResult.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Please log in to upload images',
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
