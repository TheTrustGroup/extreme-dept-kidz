# 🚀 MoMo Developer Portal Quick Start

Based on what you're seeing in the portal, here's how to proceed:

---

## 📍 Current Location: API Explorer

You're currently viewing the **API Explorer** which shows all available MoMo API operations. This is great for understanding the APIs, but here's what to do next:

---

## 🎯 STEP 1: Select the Right API

### In the "Select API" Dropdown:

1. **Look for "Collection API"** or **"Collection"**
   - This is the API for **receiving payments** from customers
   - This matches our implementation in `lib/payment/momo.ts`

2. **Why Collection API?**
   - `POST CreatePayments` → Our `requestPayment()` function
   - `GET GetPaymentStatus` → Our `getPaymentStatus()` function
   - `POST CreateAccessToken` → Our `getAccessToken()` function

3. **Don't select:**
   - Disbursement API (for sending money)
   - Remittance API (for transfers)

---

## 🔑 STEP 2: Get Your Credentials

The API Explorer shows operations, but you need credentials first. Here's where to find them:

### Option A: From the Main Dashboard

1. **Look for a menu/sidebar** with options like:
   - "My Subscriptions"
   - "Products"
   - "API Keys"
   - "Settings"

2. **Navigate to "Products" or "My Subscriptions"**

3. **Subscribe to Collection API:**
   - Click "Subscribe" or "Get Started"
   - Choose **Sandbox** environment (for testing)
   - Enter callback URL: `https://extremedeptkidz.com/api/payment/momo/callback`

### Option B: From the Top Navigation

1. Look for tabs like:
   - **"Products"** → Subscribe to Collection API
   - **"API Users"** → Create API User (get credentials)
   - **"Subscriptions"** → View your subscriptions

---

## 🔐 STEP 3: Get Your Three Keys

You need **THREE** credentials:

### 1. Subscription Key (Primary Key)
- Found in: **"My Subscriptions"** → Your Collection API subscription
- Look for: **"Primary Key"** or **"Subscription Key"**
- This is your `MOMO_SUBSCRIPTION_KEY`

### 2. API User ID
- Go to: **"API Users"** or **"Users"**
- Click: **"Create API User"**
- Fill in:
  - **Provider Callback Host**: `extremedeptkidz.com` (no https://)
  - **Target Environment**: `sandbox`
- After creation, you'll get a **UUID** → This is your `MOMO_API_USER`

### 3. API Key
- Same place as API User
- After creating API User, you'll see an **"API Key"**
- Copy this → This is your `MOMO_API_KEY`

---

## 📋 STEP 4: Understanding the Operations You See

Based on the operations visible in your screenshot:

### ✅ Operations We Use:

1. **POST CreateAccessToken**
   - **Our function**: `getAccessToken()` in `lib/payment/momo.ts`
   - **Purpose**: Get authentication token before making payment requests
   - **Endpoint**: `/collection/token/`

2. **POST CreatePayments**
   - **Our function**: `requestPayment()` in `lib/payment/momo.ts`
   - **Purpose**: Request payment from customer's phone
   - **Endpoint**: `/collection/v1_0/requesttopay`
   - **Note**: In the portal it might be called "CreatePayments" but the actual endpoint is `requesttopay`

3. **GET GetPaymentStatus**
   - **Our function**: `getPaymentStatus()` and `verifyPayment()` in `lib/payment/momo.ts`
   - **Purpose**: Check if payment was completed
   - **Endpoint**: `/collection/v1_0/requesttopay/{referenceId}`

### 📚 Other Operations (Not Used Yet):

- `GET GetAccountBalance` - Check your account balance
- `POST CreateInvoice` - Create invoices (future feature)
- `GET GetBasicUserinfo` - Get user information

---

## 🧪 STEP 5: Test Your Setup

Once you have credentials:

1. **Add to Vercel Environment Variables:**
   ```
   MOMO_API_KEY=your-api-key
   MOMO_API_USER=your-api-user-uuid
   MOMO_SUBSCRIPTION_KEY=your-subscription-key
   MOMO_ENVIRONMENT=sandbox
   MOMO_CALLBACK_URL=https://extremedeptkidz.com/api/payment/momo/callback
   ```

2. **Test Payment Flow:**
   - Go to your checkout page
   - Use test phone: `0244123456`
   - Complete a test payment

3. **Check Transaction Logs:**
   - In the portal, look for "Transactions" or "Logs"
   - You should see your test payment

---

## 🗺️ Navigation Guide

If you're lost in the portal, look for these sections:

### Main Menu Items:
- **🏠 Dashboard** - Overview
- **📦 Products** - Subscribe to APIs
- **👤 API Users** - Create users, get credentials
- **📋 Subscriptions** - View your subscriptions
- **📊 Analytics** - View transaction stats
- **🔧 Settings** - Account settings
- **📚 Documentation** - API docs
- **🧪 Sandbox** - Test environment

### Key Pages:
1. **Products Page** → Subscribe to Collection API
2. **API Users Page** → Create user, get API Key and User ID
3. **Subscriptions Page** → Get Subscription Key (Primary Key)

---

## ⚠️ Important Notes

### Environment Selection:
- **Sandbox** = Testing (FREE, no real money)
- **Production** = Live payments (requires approval)

**Start with Sandbox!**

### Callback URL Format:
- ✅ Correct: `extremedeptkidz.com` (in API User settings)
- ✅ Correct: `https://extremedeptkidz.com/api/payment/momo/callback` (in env vars)
- ❌ Wrong: `http://extremedeptkidz.com` (must be HTTPS in production)

### Phone Number Format:
- In API: `233XXXXXXXXX` (country code + number)
- In form: `0XXXXXXXXX` (we convert it automatically)

---

## 🆘 If You're Stuck

### Can't Find "Products" or "Subscriptions"?
- Look for a **hamburger menu** (☰) on mobile
- Try clicking your **profile/account** icon
- Look for **"Get Started"** or **"Create Subscription"** buttons

### Don't See Collection API?
- Make sure you're logged in
- Check if you need to complete profile first
- Try refreshing the page

### Need Help?
- Look for **"Help"** or **"Support"** in the portal
- Check **"Documentation"** section
- Contact MTN support through the portal

---

## ✅ Quick Checklist

Before leaving the portal, ensure you have:

- [ ] Selected "Collection API" in the dropdown
- [ ] Subscribed to Collection API (Sandbox)
- [ ] Created an API User
- [ ] Copied Subscription Key (Primary Key)
- [ ] Copied API User ID (UUID)
- [ ] Copied API Key
- [ ] Set callback host in API User settings
- [ ] Tested a payment (optional, can do later)

---

## 🎯 Next Steps After Getting Credentials

1. **Add to Vercel** (see ENV_EXAMPLE.md)
2. **Redeploy your application**
3. **Test payment flow** in sandbox
4. **Verify webhook** receives callbacks
5. **Request production access** when ready

---

**You're on the right track!** The API Explorer you're viewing shows all the operations we're using. Now just need to get your credentials from the Products/Subscriptions section. 🚀
