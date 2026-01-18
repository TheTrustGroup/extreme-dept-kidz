# Resend Email Service Setup

## Overview

The email service is now configured to use [Resend](https://resend.com) for sending password reset emails and other admin notifications.

---

## Setup Steps

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "EXTREME DEPT KIDZ Production")
4. Copy the API key (starts with `re_...`)
5. **Important:** Save it immediately - you won't be able to see it again!

### 3. Verify Your Domain (Recommended)

For production, you should verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `extremedeptkidz.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually a few minutes)

**Note:** You can use Resend's default domain for testing, but it's recommended to verify your own domain for production.

### 4. Set Environment Variables

#### Local Development (`.env.local`)

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@extremedeptkidz.com
```

**Or use Resend's default domain for testing:**

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

#### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = `re_your_api_key_here`
   - `FROM_EMAIL` = `noreply@extremedeptkidz.com` (or your verified domain)

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes | - | Your Resend API key (starts with `re_`) |
| `FROM_EMAIL` | No | `noreply@extremedeptkidz.com` | Email address to send from (must be verified in Resend) |

### Email Templates

The password reset email template is defined in:
- `lib/services/email.service.ts` → `sendPasswordResetEmail()`

You can customize the HTML template there.

---

## Testing

### Development Mode

If `RESEND_API_KEY` is not set, the service will:
- Log emails to console (development mode)
- Simulate success (for testing)
- Show a warning about missing API key

### Production Mode

In production, if `RESEND_API_KEY` is not set:
- Emails will fail silently
- Error will be logged
- Password reset will still generate tokens, but emails won't be sent

### Test Email Sending

1. Set `RESEND_API_KEY` in your environment
2. Request a password reset from `/admin/forgot-password`
3. Check your email inbox
4. Check Resend dashboard for delivery status

---

## Resend Dashboard

Monitor your email sending:
- [Resend Dashboard](https://resend.com/emails) - View sent emails
- [Resend Logs](https://resend.com/logs) - View delivery logs
- [Resend Analytics](https://resend.com/analytics) - View email metrics

---

## Troubleshooting

### "RESEND_API_KEY not configured"

**Solution:** Add `RESEND_API_KEY` to your environment variables.

### "Invalid API key"

**Solution:** 
- Verify the API key is correct (starts with `re_`)
- Check for extra spaces or quotes
- Regenerate the key in Resend dashboard if needed

### "Domain not verified"

**Solution:**
- Use Resend's default domain for testing: `onboarding@resend.dev`
- Or verify your domain in Resend dashboard
- Make sure `FROM_EMAIL` matches a verified domain

### Emails not being received

**Check:**
1. Resend dashboard for delivery status
2. Spam/junk folder
3. Email address is correct
4. Domain verification status

---

## Pricing

Resend offers:
- **Free tier:** 3,000 emails/month
- **Pro tier:** Starting at $20/month for 50,000 emails

For most admin operations (password resets, notifications), the free tier should be sufficient.

---

## Security Best Practices

1. ✅ **Never commit API keys to git**
   - Use environment variables only
   - Add `.env.local` to `.gitignore`

2. ✅ **Use different keys for dev/prod**
   - Create separate API keys for each environment
   - Set different keys in Vercel for each environment

3. ✅ **Rotate keys periodically**
   - Regenerate API keys every 6-12 months
   - Update environment variables when rotating

4. ✅ **Monitor usage**
   - Check Resend dashboard regularly
   - Set up alerts for unusual activity

---

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
- [Resend Status](https://status.resend.com)

---

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to environment variables
3. ✅ Verify domain (optional but recommended)
4. ✅ Test password reset flow
5. ✅ Monitor email delivery in Resend dashboard
