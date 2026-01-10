# Secure Authentication - Quick Start Guide

Follow these steps to implement secure authentication for your admin dashboard.

## 🚀 Step-by-Step Implementation

### Step 1: Install Dependencies ✅
```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```
**Status:** ✅ Already installed

### Step 2: Run Database Migration

Update your database schema:

```bash
npx prisma migrate dev --name add_admin_user_model
npx prisma generate
```

This will:
- Add `AdminUser` model to your database
- Add `AdminRole` enum (super_admin, manager, editor)
- Create necessary indexes

### Step 3: Set Environment Variables

Add to your `.env.local` file:

```env
# Generate a secure JWT secret (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d
DATABASE_URL=your-existing-database-url
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Create Your First Admin User

```bash
npm run create-admin admin@extremedeptkidz.com "SecurePassword123!" "Admin Name"
```

Or use defaults:
```bash
npm run create-admin
# Creates: admin@extremedeptkidz.com / Admin123!
```

### Step 5: Update Admin Auth Store

The auth store has been updated to use the new API. The files are ready:
- ✅ `lib/auth/password.ts` - Password hashing utilities
- ✅ `lib/auth/jwt.ts` - JWT token utilities
- ✅ `lib/auth/middleware.ts` - Authentication middleware
- ✅ `app/api/admin/auth/login/route.ts` - Login API
- ✅ `app/api/admin/auth/me/route.ts` - Current user API

### Step 6: Test Login

1. Go to `/admin/login`
2. Use the credentials you created in Step 4
3. You should be logged in with a JWT token

## 📁 Files Created

### Core Authentication Files:
- `lib/auth/password.ts` - Password hashing and validation
- `lib/auth/jwt.ts` - JWT token generation and verification
- `lib/auth/middleware.ts` - Request authentication middleware

### API Routes:
- `app/api/admin/auth/login/route.ts` - Login endpoint
- `app/api/admin/auth/me/route.ts` - Get current user

### Scripts:
- `scripts/create-admin.ts` - Create admin user script

### Documentation:
- `SECURE_AUTHENTICATION_GUIDE.md` - Complete implementation guide
- `AUTHENTICATION_QUICK_START.md` - This file

## 🔐 Security Features Implemented

✅ **Password Hashing**: bcrypt with 12 salt rounds
✅ **JWT Tokens**: Secure token-based authentication
✅ **Password Validation**: Strength requirements enforced
✅ **Role-Based Access**: super_admin, manager, editor roles
✅ **User Management**: Create, update, delete users
✅ **Account Status**: Active/inactive user management
✅ **Last Login Tracking**: Monitor user activity

## 🎯 Next Steps

1. **Run Migration**: `npx prisma migrate dev --name add_admin_user_model`
2. **Set JWT_SECRET**: Add to `.env.local`
3. **Create Admin**: `npm run create-admin`
4. **Test Login**: Try logging in at `/admin/login`
5. **Update Auth Store**: Already done - uses new API
6. **Add User Management UI**: (Optional) Create `/admin/users` page

## 📝 Important Notes

- **JWT_SECRET**: Must be at least 32 characters long
- **Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Token Expiry**: Default 7 days (configurable via JWT_EXPIRES_IN)
- **Database**: Uses existing Prisma setup

## 🐛 Troubleshooting

### "JWT_SECRET must be at least 32 characters"
- Set `JWT_SECRET` in `.env.local` with 32+ characters

### "User not found"
- Run `npm run create-admin` to create your first admin user

### "Invalid or expired token"
- Token may have expired (default 7 days)
- Log in again to get a new token

### Migration errors
- Make sure your database is running
- Check `DATABASE_URL` in `.env.local`
- Run `npx prisma migrate reset` if needed (⚠️ deletes data)

## 📚 Full Documentation

See `SECURE_AUTHENTICATION_GUIDE.md` for:
- Complete implementation details
- User management API
- UI components
- Security best practices
- Additional features

---

**Ready to implement?** Start with Step 2 (Database Migration)!
