# Debug Password Reset Issues

## What to Check

### 1. Browser Console
Open browser DevTools (F12) and check:
- **Console tab** - Look for errors or logs
- **Network tab** - Check the API request to `/api/admin/auth/password-reset/request`

### 2. Check API Response
In Network tab, click on the request and check:
- **Status code** (should be 200 for success)
- **Response body** - What does it say?

### 3. Common Issues

#### Issue: "Validation failed"
**Cause:** Email format invalid
**Fix:** Make sure email is in correct format (e.g., `admin@extremedeptkidz.com`)

#### Issue: "Database connection unavailable"
**Cause:** Prisma client not initialized
**Fix:** Check `DATABASE_URL` environment variable

#### Issue: No error but nothing happens
**Cause:** Response format mismatch
**Fix:** Check browser console for API response

#### Issue: "Email sending failed"
**Cause:** Resend API key not set or invalid
**Fix:** 
- Check `RESEND_API_KEY` in environment
- In development, check console for token (it should be logged)

### 4. Test Steps

1. **Open browser console** (F12)
2. **Go to** `/admin/forgot-password`
3. **Enter email** and submit
4. **Check console** for:
   - `[ForgotPassword] API Response:` - Shows what API returned
   - `[ForgotPassword] Development mode - Reset token:` - In dev mode
   - Any error messages

5. **Check Network tab**:
   - Find request to `/api/admin/auth/password-reset/request`
   - Check status code
   - Check response body

### 5. Expected Behavior

**Success:**
- Status: 200
- Response: `{ success: true, data: { message: "..." }, message: "..." }`
- UI shows: "Check your email" message
- In dev mode: Token logged to console

**Error:**
- Status: 400/500
- Response: `{ success: false, error: "..." }`
- UI shows: Error message in red box

### 6. Quick Fixes

**If you see "Database connection unavailable":**
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL
```

**If you see "Email sending failed":**
- In development: Check console for token (it's logged)
- In production: Check `RESEND_API_KEY` is set

**If nothing happens:**
- Check browser console for JavaScript errors
- Check Network tab for failed requests
- Check server logs for errors
