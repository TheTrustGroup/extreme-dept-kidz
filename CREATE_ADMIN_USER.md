# Create Admin User - Final Step

## ✅ Migration Complete!

The AdminUser table has been created successfully.

## 🎯 Create Your First Admin User

### Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin-1',
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();
```

5. Click **Run**
6. You should see: "Success. 1 row inserted" or "Success. 1 row updated"

### Step 2: Verify User Created

Run this query to verify:

```sql
SELECT id, email, name, role, "isActive" FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
```

You should see your admin user.

## 🔐 Admin Credentials

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin123!`
- **Role:** `super_admin`

## ✅ Test Login

1. Go to `/admin/login`
2. Enter:
   - Email: `admin@extremedeptkidz.com`
   - Password: `Admin123!`
3. Click "SIGN IN"
4. You should be logged in with JWT authentication!

## 🎉 Success!

Your secure authentication system is now fully set up:
- ✅ Database table created
- ✅ Admin user created
- ✅ Password encrypted with bcrypt
- ✅ JWT authentication ready
- ✅ All code files in place

---

**Note:** After logging in, you can create more admin users via the admin dashboard (once we add the user management UI) or via the API.
