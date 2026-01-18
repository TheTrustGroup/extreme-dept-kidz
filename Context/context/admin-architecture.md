# Admin Backend Architecture

The admin system must be clearly separated from customer systems.

Expected structure:

/backend
  /admin
    /routes        # Define endpoints only
    /services      # Business logic
    /middleware    # Auth, RBAC, validation
    /models        # Database access
    /utils         # Helpers
  /shared          # Shared utilities only

Rules:
- Routes do not contain business logic
- Services orchestrate logic
- Middleware handles auth, RBAC, validation
- Models interact with Supabase
