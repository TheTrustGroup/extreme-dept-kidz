# Disable Automatic Deployments on Vercel

## How to Disable Automatic Deployments

Automatic deployments are configured in the Vercel Dashboard, not in your code. Follow these steps:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: `extreme-dept-kidz`

### Step 2: Navigate to Git Settings
1. Go to **Settings** → **Git**
2. Find the **Production Branch** section

### Step 3: Disable Automatic Deployments
1. Look for **"Automatic deployments from Git"** or **"Deploy Hooks"**
2. **Disable** automatic deployments for:
   - Production branch (main)
   - Preview deployments
   - Branch deployments

### Alternative: Remove Git Integration
If you want complete manual control:
1. Go to **Settings** → **Git**
2. Click **"Disconnect"** or **"Remove Git Integration"**
3. This will stop all automatic deployments

### Step 4: Verify
After disabling:
- ✅ Pushes to GitHub will NOT trigger deployments
- ✅ You must deploy manually using: `vercel --prod --yes`
- ✅ Or use the deployment script: `./scripts/deploy-vercel.sh`

---

## Manual Deployment Commands

### Quick Deploy
```bash
vercel --prod --yes
```

### Using Deployment Script
```bash
./scripts/deploy-vercel.sh
```

### Check Deployment Status
```bash
vercel ls
```

---

## Important Notes

- **Automatic deployments are disabled** - You must deploy manually
- **GitHub pushes will NOT deploy** - Use manual commands only
- **Preview deployments are also disabled** - All deployments are manual
- **You have full control** - Deploy only when you're ready

---

## Re-enable Automatic Deployments (if needed later)

1. Go to Vercel Dashboard → Settings → Git
2. Re-enable **"Automatic deployments from Git"**
3. Select which branches should trigger deployments
