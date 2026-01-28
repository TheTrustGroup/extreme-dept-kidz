# Revalidate cache after Vercel deploy

So collection pages (e.g. `/collections/boys`) show fresh data right after a deploy.

## 1. Add secret in Vercel

1. In Vercel: **Project → Settings → Environment Variables**
2. Add:
   - **Name:** `REVALIDATE_SECRET`
   - **Value:** a long random string (e.g. `openssl rand -hex 32`)
   - **Environment:** Production (and Preview if you want)

## 2. Revalidate after each deploy

After each deploy, call:

```bash
curl "https://extremedeptkidz.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET"
```

Replace `YOUR_REVALIDATE_SECRET` with the value you set in Vercel.

- **Manual:** Run that `curl` (or open the URL in a browser) after you deploy.
- **Automated:** Use a GitHub Action that runs after `git push`, waits for Vercel deploy to finish, then calls that URL. Or use Vercel’s “Deploy Hooks” to trigger a small external service that calls it.

## 3. Optional: Vercel Cron (Pro)

On the Pro plan you can add a cron that hits the revalidate URL on a schedule (e.g. every hour). In `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 * * * *"
    }
  ]
}
```

The cron request must include the secret, e.g. via a header or query param. Because cron runs on Vercel, you’d typically use a serverless function or middleware that appends `?secret=...` from an env var when calling your own `/api/revalidate`. For most cases, running the `curl` once after deploy is enough.

## Summary

1. Set `REVALIDATE_SECRET` in Vercel.
2. After each deploy, call:  
   `https://extremedeptkidz.com/api/revalidate?secret=<REVALIDATE_SECRET>`

That refreshes `/collections/boys`, `/collections/girls`, `/collections`, and `/`.
