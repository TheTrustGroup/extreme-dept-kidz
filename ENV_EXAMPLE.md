# Environment Variables Example

Copy these variables to your `.env.local` or Vercel environment variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://extremedeptkidz.com

# Security
JWT_SECRET=your-ultra-secure-random-string-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Rate Limiting & CAPTCHA
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key

# MoMo Payment (MTN Mobile Money)
MOMO_API_KEY=your-momo-api-key
MOMO_API_USER=your-momo-api-user-uuid
MOMO_SUBSCRIPTION_KEY=your-momo-subscription-key
MOMO_ENVIRONMENT=sandbox
MOMO_CALLBACK_URL=https://extremedeptkidz.com/api/payment/momo/callback

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/extremedeptkidz

# Email - Resend (for password resets and admin notifications)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@extremedeptkidz.com

# Email - SMTP (for order confirmations - optional, can use Resend instead)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Error Tracking (Optional)
SENTRY_DSN=your-sentry-dsn
```

## Getting MoMo API Credentials

1. Register at https://momodeveloper.mtn.com
2. Create an app and get your API credentials
3. Set `MOMO_ENVIRONMENT=sandbox` for testing
4. Switch to `MOMO_ENVIRONMENT=production` when ready
