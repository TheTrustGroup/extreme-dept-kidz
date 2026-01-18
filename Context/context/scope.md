# Scope Boundaries (Non-Negotiable)

ALLOWED TO MODIFY:
- Admin authentication
- Admin backend APIs
- Admin dashboard UI
- Admin-only database tables
- Admin-related Supabase policies

DO NOT TOUCH:
- Customer authentication
- Storefront UI
- Checkout and payment flows
- Order placement logic
- Customer sessions
- Any customer-facing routes or components

If a file contains BOTH admin and customer logic:
- Stop
- Ask for approval
- Isolate admin logic into separate modules
