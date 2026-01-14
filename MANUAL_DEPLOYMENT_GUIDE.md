# Manual Deployment Guide

## ⚠️ Automatic Deployments Disabled

All deployments are now **MANUAL ONLY**. Pushes to GitHub will **NOT** trigger automatic deployments.

---

## How to Deploy Manually

### Option 1: Using Deployment Script (Recommended)
```bash
./scripts/deploy-vercel.sh
```

### Option 2: Using Vercel CLI
```bash
vercel --prod --yes
```

### Option 3: Using Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Go to your project: `extreme-dept-kidz`
3. Click **"Deploy"** → **"Deploy from Git"** (if Git is connected)
4. Or click **"Deploy"** → **"Upload"** to upload files directly

---

## Before Deploying

### 1. Commit Your Changes
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 2. Verify Build Locally (Optional but Recommended)
```bash
npm run build
```

### 3. Deploy to Production
```bash
./scripts/deploy-vercel.sh
# or
vercel --prod --yes
```

---

## Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Local build passes (`npm run build`)
- [ ] All tests pass (if applicable)
- [ ] Environment variables are set in Vercel
- [ ] Ready to deploy manually

---

## Deployment Status

After deploying, check status:
```bash
vercel ls
```

Or visit: https://vercel.com/dashboard

---

## Troubleshooting

### Deployment Fails
1. Check build logs: `vercel inspect <deployment-url> --logs`
2. Verify environment variables in Vercel dashboard
3. Check build locally: `npm run build`

### Need to Redeploy
```bash
vercel redeploy <deployment-url>
```

---

## Important Notes

- ✅ **You control when deployments happen**
- ✅ **No automatic deployments from Git pushes**
- ✅ **Deploy only when you're ready**
- ⚠️ **Remember to deploy after important changes**
