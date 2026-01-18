# Admin Authentication & Security

Admin authentication MUST be completely separate from
customer authentication.

Requirements:
- Secure login flow
- Strong password hashing (bcrypt or argon2)
- Session or JWT validation on every admin request
- Rate limiting on login attempts
- Password reset flow
- Role-based access control (RBAC)

Roles:
- super_admin
- admin
- manager
- viewer

All admin routes must require:
- Authentication
- Role authorization
