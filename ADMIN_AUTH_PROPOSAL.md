# 🔐 Admin Authentication Approach - Proposal

## Executive Summary

Based on the context requirements and current implementation analysis, this proposal outlines a comprehensive admin authentication system that meets enterprise standards while maintaining separation from customer authentication.

---

## Current State Analysis

### ✅ What's Working Well

1. **Custom Authentication System**
   - ✅ Bcrypt password hashing (meets requirement)
   - ✅ JWT token generation and validation
   - ✅ Rate limiting on login (5 attempts per 15 minutes)
   - ✅ Bot detection
   - ✅ Secure cookie handling (httpOnly)
   - ✅ Separate AdminUser table (isolated from customer auth)

2. **Security Features**
   - ✅ Input validation (Zod schemas)
   - ✅ Timing attack prevention
   - ✅ Failed attempt tracking
   - ✅ Account lockout after 10 failed attempts

3. **Infrastructure**
   - ✅ Middleware protection for `/admin` routes
   - ✅ API route protection
   - ✅ Token verification on every request

### ❌ Gaps Identified

1. **Role System Mismatch**
   - Current: `super_admin`, `manager`, `editor`
   - Required: `super_admin`, `admin`, `manager`, `viewer`
   - Missing: `admin` and `viewer` roles
   - `editor` role not in requirements

2. **RBAC Not Enforced**
   - ✅ Authentication is enforced
   - ❌ Role-based authorization is NOT enforced on routes
   - `hasRole()` function exists but is not used consistently
   - No role-based middleware for route protection

3. **Missing Features**
   - ❌ Password reset flow (required by context)
   - ❌ No activity logging for admin actions
   - ❌ No session management/revocation

4. **Architecture Issues**
   - Routes contain business logic (should be in services)
   - No clear separation: routes/services/middleware/models
   - Inconsistent auth patterns across routes

---

## Proposed Solution

### Phase 1: Database & Role System Updates

#### 1.1 Update AdminRole Enum
**File:** `prisma/schema.prisma`

**Changes:**
- Update `AdminRole` enum to match context requirements:
  ```prisma
  enum AdminRole {
    super_admin
    admin
    manager
    viewer
  }
  ```

**Migration Required:**
- Create migration to update enum
- Map existing roles:
  - `editor` → `viewer` (lowest privilege)
  - `manager` → `manager` (unchanged)
  - `super_admin` → `super_admin` (unchanged)
- Add new `admin` role

#### 1.2 Add Password Reset Fields
**File:** `prisma/schema.prisma`

**Add to AdminUser model:**
```prisma
model AdminUser {
  // ... existing fields
  passwordResetToken      String?
  passwordResetExpiresAt  DateTime?
  passwordResetRequestedAt DateTime?
}
```

**Purpose:** Enable secure password reset flow

---

### Phase 2: Architecture Restructuring

#### 2.1 Create Service Layer Structure
**New Directory:** `lib/services/admin/`

**Files to Create:**
```
lib/services/admin/
  ├── auth.service.ts          # Authentication business logic
  ├── password.service.ts      # Password reset logic
  └── session.service.ts       # Session management
```

**Purpose:** Move business logic out of routes

#### 2.2 Create RBAC Middleware
**New File:** `lib/middleware/rbac.ts`

**Features:**
- Role-based route protection
- Permission checking
- Hierarchical role system
- Reusable across all admin routes

**Role Hierarchy:**
```
viewer (1) < manager (2) < admin (3) < super_admin (4)
```

#### 2.3 Create Permission System
**New File:** `lib/auth/permissions.ts`

**Define permissions:**
- `view_dashboard`
- `manage_products`
- `manage_orders`
- `manage_inventory`
- `manage_users`
- `view_analytics`
- `manage_settings`
- etc.

**Map roles to permissions:**
- Each role has specific permissions
- Hierarchical: higher roles inherit lower role permissions

---

### Phase 3: Password Reset Implementation

#### 3.1 Password Reset API Routes
**New Files:**
- `app/api/admin/auth/password-reset/request/route.ts` - Request reset
- `app/api/admin/auth/password-reset/verify/route.ts` - Verify token
- `app/api/admin/auth/password-reset/reset/route.ts` - Complete reset

**Flow:**
1. Admin requests reset via email
2. System generates secure token (crypto.randomBytes)
3. Token stored in database with expiration (1 hour)
4. Email sent with reset link
5. Admin clicks link, verifies token
6. Admin sets new password
7. Token invalidated

**Security:**
- Tokens expire after 1 hour
- One-time use tokens
- Rate limiting on reset requests
- Email verification required

#### 3.2 Email Service Integration
**New File:** `lib/services/email.service.ts`

**Options:**
- Use Supabase email service
- Or integrate with SendGrid/Resend/etc.
- Template-based emails

---

### Phase 4: Enhanced RBAC Implementation

#### 4.1 Route Protection Middleware
**Update:** `lib/middleware/rbac.ts`

**Create decorators/helpers:**
```typescript
// Example usage in routes
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  await requireRole(auth.user, ['admin', 'super_admin']);
  // Route logic here
}
```

#### 4.2 Update All Admin Routes
**Files to Update:**
- All routes in `app/api/admin/**`
- Add role checks to each route
- Document required roles

**Pattern:**
```typescript
// Standard pattern for all admin routes
export async function GET(request: NextRequest) {
  // 1. Authenticate
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;
  
  // 2. Authorize (check role)
  if (!hasRequiredRole(authResult.user.role, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  // 3. Business logic (move to service)
  // ...
}
```

---

### Phase 5: Activity Logging

#### 5.1 Admin Activity Log Table
**File:** `prisma/schema.prisma`

**Add:**
```prisma
model AdminActivityLog {
  id          String   @id @default(cuid())
  adminUserId String
  adminUser   AdminUser @relation(fields: [adminUserId], references: [id])
  action      String   // e.g., "product.created", "order.updated"
  resource    String?  // e.g., "Product", "Order"
  resourceId  String?  // ID of affected resource
  details     Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  @@index([adminUserId])
  @@index([action])
  @@index([createdAt])
}
```

#### 5.2 Activity Logging Service
**New File:** `lib/services/admin/activity.service.ts`

**Features:**
- Automatic logging of admin actions
- Audit trail for compliance
- Searchable logs
- Export capabilities

---

### Phase 6: Session Management

#### 6.1 Session Tracking
**Add to AdminUser model:**
```prisma
model AdminUser {
  // ... existing fields
  currentSessionId String?
  lastActiveAt     DateTime?
}
```

#### 6.2 Session Revocation
**New Route:** `app/api/admin/auth/sessions/route.ts`

**Features:**
- View active sessions
- Revoke specific sessions
- Revoke all sessions (logout everywhere)
- Session timeout (inactivity)

---

## Implementation Plan

### Step 1: Database Updates (Non-Breaking)
1. Update AdminRole enum
2. Add password reset fields
3. Create AdminActivityLog table
4. Run migrations

### Step 2: Core Services (New Code)
1. Create service layer structure
2. Move auth logic to services
3. Create password reset service
4. Create activity logging service

### Step 3: RBAC Implementation
1. Create RBAC middleware
2. Define permission system
3. Update role hierarchy
4. Create role checking utilities

### Step 4: Password Reset
1. Create password reset routes
2. Implement email service
3. Add reset UI components
4. Test reset flow

### Step 5: Route Protection
1. Update all admin routes with RBAC
2. Add role requirements
3. Test authorization
4. Document role requirements

### Step 6: Activity Logging
1. Integrate logging into routes
2. Create log viewing UI
3. Add filtering/search
4. Test audit trail

---

## File Structure (Proposed)

```
lib/
  ├── auth/
  │   ├── jwt.ts                    # ✅ Exists
  │   ├── password.ts                # ✅ Exists
  │   ├── middleware.ts              # ✅ Exists (needs RBAC enhancement)
  │   └── permissions.ts             # 🆕 NEW - Permission definitions
  │
  ├── middleware/
  │   └── rbac.ts                    # 🆕 NEW - Role-based access control
  │
  └── services/
      └── admin/
          ├── auth.service.ts        # 🆕 NEW - Auth business logic
          ├── password.service.ts    # 🆕 NEW - Password reset logic
          ├── session.service.ts     # 🆕 NEW - Session management
          └── activity.service.ts    # 🆕 NEW - Activity logging

app/api/admin/auth/
  ├── login/route.ts                 # ✅ Exists (refactor to use service)
  ├── me/route.ts                    # ✅ Exists
  ├── logout/route.ts                # ✅ Exists
  ├── password-reset/                # 🆕 NEW
  │   ├── request/route.ts
  │   ├── verify/route.ts
  │   └── reset/route.ts
  └── sessions/route.ts              # 🆕 NEW - Session management
```

---

## Security Enhancements

### Additional Security Measures

1. **Token Refresh**
   - Implement refresh tokens
   - Shorter access token lifetime (15 minutes)
   - Longer refresh token lifetime (7 days)

2. **2FA Support (Future)**
   - TOTP-based 2FA
   - SMS backup codes
   - Optional for all roles

3. **IP Whitelisting (Optional)**
   - For super_admin role
   - Configurable per user

4. **Password Policy**
   - Minimum 12 characters
   - Require uppercase, lowercase, number, special char
   - Password history (prevent reuse)
   - Force password change on first login

---

## Migration Strategy

### Backward Compatibility

1. **Role Migration**
   - Map `editor` → `viewer` automatically
   - Existing users keep their permissions
   - No data loss

2. **Gradual Rollout**
   - Implement RBAC on new routes first
   - Update existing routes incrementally
   - Test thoroughly before production

3. **Feature Flags**
   - Use feature flags for new features
   - Easy rollback if issues

---

## Testing Requirements

### Unit Tests
- Auth service functions
- Password reset flow
- RBAC permission checks
- Role hierarchy validation

### Integration Tests
- Login flow
- Password reset flow
- Route authorization
- Session management

### Security Tests
- Rate limiting
- Token validation
- Role escalation attempts
- SQL injection prevention

---

## Documentation Requirements

1. **API Documentation**
   - Document all auth endpoints
   - Role requirements for each route
   - Permission matrix

2. **Developer Guide**
   - How to add new routes
   - How to set role requirements
   - How to add permissions

3. **Admin Guide**
   - How to reset passwords
   - How to manage users
   - How to view activity logs

---

## Estimated Impact

### Files to Create: ~15 new files
### Files to Modify: ~20 existing files
### Database Migrations: 2-3 migrations
### Breaking Changes: None (backward compatible)

---

## Success Criteria

✅ All context requirements met:
- ✅ Secure login flow
- ✅ Strong password hashing (bcrypt)
- ✅ JWT validation on every request
- ✅ Rate limiting
- ✅ Password reset flow
- ✅ RBAC with 4 roles
- ✅ Authentication + authorization on all routes

✅ Enterprise standards:
- ✅ Clean architecture
- ✅ Separation of concerns
- ✅ Audit logging
- ✅ Session management
- ✅ Proper error handling

---

## Questions for Approval

1. **Password Reset Email Service**
   - Use Supabase email service?
   - Or integrate third-party (SendGrid, Resend)?
   - Preference?

2. **Activity Logging**
   - Real-time or batch?
   - Retention period?
   - Export format?

3. **Session Management**
   - Multiple concurrent sessions allowed?
   - Session timeout duration?
   - Auto-logout on inactivity?

4. **2FA**
   - Implement now or later?
   - Required for all roles or optional?

---

**Status:** ⏳ Awaiting approval before implementation
**Priority:** High (meets enterprise requirements)
**Risk:** Low (backward compatible, incremental changes)
