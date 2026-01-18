# Database & Supabase Context

Supabase is used as the backend database.

Admin-related tables include:
- admin users
- admin activity logs
- inventory management
- admin notifications

Rules:
- Enable RLS on all admin tables
- Only authenticated admins may access admin data
- Customer data must never expose sensitive fields
- Admin access must be explicitly controlled

Database schema changes must be documented.