# Upstash Redis Setup Guide

**Quick Setup for Rate Limiting**

---

## Option 1: Redis Protocol URL (Recommended for ioredis)

Upstash provides a Redis protocol URL that works directly with ioredis.

### Steps:

1. Go to [Upstash Console](https://console.upstash.com/)
2. Select your Redis database
3. Click **"Redis Connect"** button
4. Select **"Node.js"** tab
5. Copy the **Redis URL** (format: `rediss://:PASSWORD@HOST:PORT`)

### Add to `.env.local`:

```bash
# Use Redis protocol URL (not REST URL)
REDIS_URL=rediss://:YOUR_PASSWORD@YOUR_ENDPOINT:YOUR_PORT
```

**Example:**
```bash
REDIS_URL=rediss://:YOUR_PASSWORD@your-endpoint.upstash.io:6379
```

---

## Option 2: REST URL (Alternative - Requires Different Implementation)

If you only have the REST URL, you have two options:

### A. Get Redis URL from Upstash Console
1. Go to Upstash Console → Your Database
2. Click "Redis Connect" → "Node.js" tab
3. Copy the `rediss://` URL
4. Use as `REDIS_URL` in `.env.local`

### B. Use Upstash REST API (Requires Code Changes)
If you want to use REST API, you'll need:
- `UPSTASH_REDIS_REST_URL`: `https://your-endpoint.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN`: Your REST token (from Upstash Console)

Then update the rate limiter to use REST API instead of ioredis.

---

## Current Implementation

The current rate limiter (`lib/auth/rate-limit-redis.ts`) uses **ioredis**, which requires the **Redis protocol URL** (not REST URL).

**To use your Upstash instance:**

1. Get the Redis URL from Upstash Console:
   - Go to your database
   - Click "Redis Connect"
   - Select "Node.js" tab
   - Copy the `rediss://` URL

2. Add to `.env.local`:
   ```bash
   REDIS_URL=rediss://:YOUR_PASSWORD@your-endpoint.upstash.io:6379
   ```

3. The REST URL you provided (`UPSTASH_REDIS_REST_URL`) can be stored for reference, but the code currently uses `REDIS_URL` with Redis protocol.

---

## Testing

After setting `REDIS_URL`:

1. Restart your dev server
2. Try logging in 6 times rapidly
3. Should be blocked after 5 attempts
4. Check Upstash Console → Data Browser to see rate limit keys

---

## Troubleshooting

**Error: "Redis unavailable, using in-memory store"**
- Check that `REDIS_URL` is set correctly
- Verify the URL format: `rediss://:PASSWORD@HOST:PORT`
- Check Upstash Console for connection details

**Rate limiting not working across instances**
- Ensure `REDIS_URL` is set (not just `UPSTASH_REDIS_REST_URL`)
- Verify Redis connection in logs: `[RateLimit] ✅ Redis connected successfully`

---

**Note:** The REST URL format (`https://...`) is for HTTP-based REST API access. For ioredis (which we're using), you need the Redis protocol URL (`rediss://...`).
