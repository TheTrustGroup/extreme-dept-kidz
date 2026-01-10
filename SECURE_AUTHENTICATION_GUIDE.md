# Secure Authentication System Implementation Guide

This guide provides step-by-step instructions to implement a secure authentication system with encrypted passwords and proper user management for the Extreme Dept Kidz admin dashboard.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Required Packages](#step-1-install-required-packages)
3. [Step 2: Update Database Schema](#step-2-update-database-schema)
4. [Step 3: Create Authentication Utilities](#step-3-create-authentication-utilities)
5. [Step 4: Create Authentication API Routes](#step-4-create-authentication-api-routes)
6. [Step 5: Create User Management API](#step-5-create-user-management-api)
7. [Step 6: Update Admin Auth Store](#step-6-update-admin-auth-store)
8. [Step 7: Create User Management UI](#step-7-create-user-management-ui)
9. [Step 8: Add Authentication Middleware](#step-8-add-authentication-middleware)
10. [Step 9: Create Initial Admin User](#step-9-create-initial-admin-user)
11. [Step 10: Security Best Practices](#step-10-security-best-practices)

---

## Prerequisites

- PostgreSQL database configured
- Prisma set up and working
- Environment variables configured

---

## Step 1: Install Required Packages

Install the necessary packages for password hashing and JWT tokens:

```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

**Why these packages?**
- `bcryptjs`: Secure password hashing (slower than bcrypt but pure JavaScript)
- `jsonwebtoken`: JWT token generation and verification
- Type definitions for TypeScript support

---

## Step 2: Update Database Schema

Update your Prisma schema to include an AdminUser model:

```prisma
// Add to prisma/schema.prisma

model AdminUser {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String
  passwordHash  String      // Hashed password (never store plain text!)
  role          AdminRole   @default(editor)
  isActive      Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([email])
  @@index([role])
}

enum AdminRole {
  super_admin
  manager
  editor
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_admin_user_model
npx prisma generate
```

---

## Step 3: Create Authentication Utilities

Create utility functions for password hashing and JWT tokens:

**File: `lib/auth/password.ts`**
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Higher = more secure but slower

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**File: `lib/auth/jwt.ts`**
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
```

**File: `lib/auth/middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from '@/lib/db/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  // Verify user still exists and is active
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
    return {
      user: null,
      error: NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    editor: 1,
    manager: 2,
    super_admin: 3,
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}
```

---

## Step 4: Create Authentication API Routes

**File: `app/api/admin/auth/login/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

**File: `app/api/admin/auth/me/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);

  if (authResult.error) {
    return authResult.error;
  }

  return NextResponse.json({
    user: authResult.user,
  });
}
```

---

## Step 5: Create User Management API

**File: `app/api/admin/users/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, hasRole } from '@/lib/auth/middleware';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

// GET - List all users
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;

  if (!hasRole(authResult.user.role, 'manager')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

// POST - Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;

  if (!hasRole(authResult.user.role, 'super_admin')) {
    return NextResponse.json(
      { error: 'Only super admins can create users' },
      { status: 403 }
    );
  }

  const { email, name, password, role } = await request.json();

  if (!email || !name || !password || !role) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    );
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return NextResponse.json(
      { error: 'Password does not meet requirements', details: passwordValidation.errors },
      { status: 400 }
    );
  }

  // Check if user exists
  const existingUser = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
```

**File: `app/api/admin/users/[id]/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, hasRole } from '@/lib/auth/middleware';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;

  const { id } = await params;

  // Users can view their own profile, managers+ can view any
  if (authResult.user.id !== id && !hasRole(authResult.user.role, 'manager')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const { name, role, isActive, password } = await request.json();

  // Check permissions
  const isOwnProfile = authResult.user.id === id;
  const isSuperAdmin = hasRole(authResult.user.role, 'super_admin');

  if (!isOwnProfile && !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Only super admins can change roles
  if (role && role !== authResult.user.role && !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Only super admins can change roles' },
      { status: 403 }
    );
  }

  // Update password if provided
  let passwordHash: string | undefined;
  if (password) {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }
    passwordHash = await hashPassword(password);
  }

  const updateData: any = {};
  if (name) updateData.name = name;
  if (role && isSuperAdmin) updateData.role = role;
  if (typeof isActive === 'boolean' && isSuperAdmin) updateData.isActive = isActive;
  if (passwordHash) updateData.passwordHash = passwordHash;

  const user = await prisma.adminUser.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user });
}

// DELETE - Delete user (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;

  if (!hasRole(authResult.user.role, 'super_admin')) {
    return NextResponse.json(
      { error: 'Only super admins can delete users' },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Prevent deleting yourself
  if (authResult.user.id === id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  // Soft delete
  await prisma.adminUser.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
```

---

## Step 6: Update Admin Auth Store

Update `lib/stores/admin-auth-store.ts` to use the API:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = "super_admin" | "manager" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    "view_dashboard",
    "manage_products",
    "delete_products",
    "manage_orders",
    "refund_orders",
    "manage_customers",
    "view_analytics",
    "manage_settings",
    "manage_users",
    "manage_looks",
  ],
  manager: [
    "view_dashboard",
    "manage_products",
    "manage_orders",
    "refund_orders",
    "manage_customers",
    "view_analytics",
    "manage_looks",
  ],
  editor: [
    "view_dashboard",
    "manage_products",
    "view_analytics",
    "manage_looks",
  ],
};

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          const response = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      logout: (): void => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          const response = await fetch("/api/admin/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            set({ isAuthenticated: false, user: null, token: null });
            return false;
          }

          const data = await response.json();
          set({
            user: data.user,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          set({ isAuthenticated: false, user: null, token: null });
          return false;
        }
      },

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## Step 7: Create User Management UI

Create `app/admin/users/page.tsx` for managing users (see implementation files).

---

## Step 8: Add Authentication Middleware

Update `middleware.ts` to protect admin routes:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = extractTokenFromHeader(
      request.headers.get('authorization')
    );

    // For API routes, check Authorization header
    if (pathname.startsWith('/api/admin')) {
      if (!token || !verifyToken(token)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // For page routes, redirect to login if no token in cookie/header
    // (You'll need to implement cookie-based auth for page routes)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

---

## Step 9: Create Initial Admin User

Create a script to set up the first admin user:

**File: `scripts/create-admin.ts`**
```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@extremedeptkidz.com';
  const password = process.argv[3] || 'Admin123!';
  const name = process.argv[4] || 'Super Admin';

  console.log(`Creating admin user: ${email}`);

  const passwordHash = await hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: 'super_admin',
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    },
  });

  console.log('Admin user created:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to package.json:**
```json
{
  "scripts": {
    "create-admin": "tsx scripts/create-admin.ts"
  }
}
```

**Usage:**
```bash
npm run create-admin admin@extremedeptkidz.com "SecurePassword123!" "Admin Name"
```

---

## Step 10: Security Best Practices

### Environment Variables

Add to `.env.local`:
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
DATABASE_URL=your-database-url
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Security Checklist

- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ JWT tokens expire after 7 days
- ✅ Passwords must meet strength requirements
- ✅ Role-based access control implemented
- ✅ Users can be deactivated (soft delete)
- ✅ Last login tracking
- ✅ Rate limiting (add to production)
- ✅ HTTPS only in production
- ✅ Secure cookie settings (if using cookies)

### Additional Security Measures

1. **Rate Limiting**: Add rate limiting to login endpoint
2. **2FA**: Consider adding two-factor authentication
3. **IP Whitelisting**: Optional IP-based access control
4. **Audit Logs**: Log all admin actions
5. **Session Management**: Implement session timeout
6. **Password Reset**: Add password reset functionality

---

## Testing

1. Create initial admin:
   ```bash
   npm run create-admin
   ```

2. Test login:
   - Go to `/admin/login`
   - Use the credentials you created
   - Verify JWT token is stored

3. Test user management:
   - Create a new user via API or UI
   - Verify password is hashed in database
   - Test role-based permissions

---

## Migration from Mock Auth

1. Create admin users in database
2. Update auth store to use API
3. Test all admin routes
4. Remove mock user data
5. Deploy to production

---

## Support

For issues or questions, refer to:
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
