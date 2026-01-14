# 📱 MTN Mobile Money (MoMo) API Setup Guide

Complete step-by-step guide to register and configure MoMo API services for Extreme Dept Kidz.

---

## 🎯 Overview

MTN Mobile Money API allows you to accept payments from customers using their MTN MoMo accounts. This guide will walk you through:
1. Creating a developer account
2. Creating an API product subscription
3. Getting your API credentials
4. Configuring your application
5. Testing in sandbox mode

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ A valid email address
- ✅ A phone number (can be any network)
- ✅ Business registration documents (for production)
- ✅ A website domain (for production)
- ✅ Basic understanding of APIs

---

## 🚀 STEP 1: Create Developer Account

### 1.1 Visit the MoMo Developer Portal
- Go to: **https://momodeveloper.mtn.com**
- Click **"Sign Up"** or **"Create Account"**

### 1.2 Fill in Registration Details
You'll need to provide:
- **Email Address** (use a business email)
- **Password** (strong password, min 8 characters)
- **First Name**
- **Last Name**
- **Phone Number** (any network is fine)
- **Country** (Select Ghana)

### 1.3 Verify Your Email
- Check your email inbox
- Click the verification link sent by MTN
- If you don't see it, check spam folder
- Complete email verification

### 1.4 Complete Profile
- Log in to the developer portal
- Complete your profile information
- Accept terms and conditions

---

## 🔑 STEP 2: Create API Product Subscription

### 2.1 Navigate to Products
- After logging in, go to **"Products"** or **"API Products"** in the dashboard
- You'll see available MoMo API products

### 2.2 Select Collection API
- Look for **"Collection API"** (for receiving payments)
- Click **"Subscribe"** or **"Get Started"**

### 2.3 Choose Environment
- **Sandbox** (for testing) - FREE
- **Production** (for live payments) - Requires approval

**Start with Sandbox for testing!**

### 2.4 Complete Subscription Form
You may need to provide:
- **Application Name**: "Extreme Dept Kidz"
- **Application Description**: Brief description of your business
- **Callback URL**: `https://extremedeptkidz.com/api/payment/momo/callback`
- **Business Information** (for production)

### 2.5 Accept Terms
- Read and accept the API terms and conditions
- Submit the subscription request

---

## 🔐 STEP 3: Get Your API Credentials

### 3.1 Access Your Subscription
- Go to **"My Subscriptions"** or **"Products"** in the dashboard
- Find your Collection API subscription
- Click to view details

### 3.2 Get Primary Key (Subscription Key)
- In your subscription details, find **"Primary Key"** or **"Subscription Key"**
- This is your `MOMO_SUBSCRIPTION_KEY`
- **Copy and save it securely** (you'll need this)

### 3.3 Create API User
- Navigate to **"API Users"** or **"Users"** section
- Click **"Create API User"**
- Fill in:
  - **Provider Callback Host**: Your domain (e.g., `extremedeptkidz.com`)
  - **Target Environment**: `sandbox` (for testing)
- Click **"Create"**

### 3.4 Get API User Credentials
After creating the API user, you'll get:
- **API User ID** (UUID format) - This is your `MOMO_API_USER`
- **API Key** - This is your `MOMO_API_KEY`
- **Save both securely!**

---

## ⚙️ STEP 4: Configure Your Application

### 4.1 Add Credentials to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: **extreme-dept-kidz**

2. **Navigate to Settings → Environment Variables**

3. **Add the following variables:**

   ```bash
   MOMO_API_KEY=your-api-key-here
   MOMO_API_USER=your-api-user-uuid-here
   MOMO_SUBSCRIPTION_KEY=your-subscription-key-here
   MOMO_ENVIRONMENT=sandbox
   MOMO_CALLBACK_URL=https://extremedeptkidz.com/api/payment/momo/callback
   ```

4. **Set for all environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Redeploy your application** after adding variables

### 4.2 Verify Configuration
- Check that all variables are set correctly
- Ensure no extra spaces or quotes
- Environment should be `sandbox` for testing

---

## 🧪 STEP 5: Test in Sandbox Mode

### 5.1 Test Phone Numbers
MTN provides test phone numbers for sandbox:
- **Test Phone**: `0244123456` (format: 0XXXXXXXXX)
- **Test PIN**: Use the test PIN provided in documentation
- **Test Amount**: Use small amounts (e.g., 1 GHS)

### 5.2 Test Payment Flow
1. Go to your checkout page
2. Add items to cart
3. Select MoMo payment
4. Enter test phone number: `0244123456`
5. Complete checkout
6. Approve payment on test phone (if prompted)

### 5.3 Check Payment Status
- Payment should show as "PENDING" initially
- Status should update to "SUCCESSFUL" after approval
- Check your MoMo developer dashboard for transaction logs

### 5.4 Verify Webhook
- Check that webhook callback is received
- Verify payment status updates correctly
- Check application logs for any errors

---

## 🚀 STEP 6: Move to Production

### 6.1 Prerequisites for Production
Before moving to production, ensure you have:
- ✅ Business registration documents
- ✅ Valid business license
- ✅ Tax identification number
- ✅ Bank account details
- ✅ Website with SSL certificate (HTTPS)
- ✅ Privacy policy and terms of service

### 6.2 Request Production Access
1. Go to your subscription in the developer portal
2. Click **"Request Production Access"** or **"Upgrade to Production"**
3. Fill in business information:
   - Business name
   - Registration number
   - Tax ID
   - Bank account details
   - Business address
4. Upload required documents:
   - Business registration certificate
   - Tax certificate
   - Bank statement
   - ID of business owner
5. Submit for review

### 6.3 Approval Process
- MTN will review your application (usually 3-7 business days)
- You may receive requests for additional information
- Once approved, you'll receive production credentials

### 6.4 Switch to Production
1. Update environment variable:
   ```bash
   MOMO_ENVIRONMENT=production
   ```
2. Update callback URL if needed
3. Test with small real transaction first
4. Monitor transactions closely

---

## 📝 STEP 7: Important Notes

### 7.1 Security Best Practices
- ✅ **Never commit API keys to Git**
- ✅ **Use environment variables only**
- ✅ **Rotate keys periodically**
- ✅ **Monitor API usage**
- ✅ **Set up alerts for failed payments**

### 7.2 API Limits
- **Sandbox**: Usually unlimited for testing
- **Production**: Check your subscription tier for limits
- **Rate Limits**: MoMo may have rate limits - check documentation

### 7.3 Error Handling
Common errors and solutions:
- **401 Unauthorized**: Check API credentials
- **403 Forbidden**: Verify subscription is active
- **429 Too Many Requests**: Rate limit exceeded, wait and retry
- **500 Server Error**: MoMo service issue, retry later

### 7.4 Support Resources
- **Developer Portal**: https://momodeveloper.mtn.com
- **Documentation**: Available in developer portal
- **Support Email**: Check developer portal for support contact
- **API Status**: Monitor for service updates

---

## 🔍 STEP 8: Verify Setup

### 8.1 Check Environment Variables
```bash
# In Vercel, verify all variables are set:
✅ MOMO_API_KEY
✅ MOMO_API_USER
✅ MOMO_SUBSCRIPTION_KEY
✅ MOMO_ENVIRONMENT
✅ MOMO_CALLBACK_URL
```

### 8.2 Test API Connection
You can test the connection by:
1. Making a test payment
2. Checking application logs
3. Verifying webhook receives callbacks
4. Checking MoMo developer dashboard for transactions

### 8.3 Monitor Logs
- Check Vercel function logs
- Monitor payment initiation
- Verify payment status updates
- Check for any error messages

---

## 📊 Quick Reference

### Environment Variables Checklist
```bash
MOMO_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MOMO_API_USER=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MOMO_SUBSCRIPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOMO_ENVIRONMENT=sandbox  # or 'production'
MOMO_CALLBACK_URL=https://extremedeptkidz.com/api/payment/momo/callback
```

### Test Phone Numbers (Sandbox)
- Format: `0XXXXXXXXX` (10 digits starting with 0)
- Example: `0244123456`
- Use test PIN provided in MoMo documentation

### API Endpoints
- **Token**: `https://sandbox.momodeveloper.mtn.com/collection/token/`
- **Request Payment**: `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay`
- **Check Status**: `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/{referenceId}`

### Production Endpoints
- **Token**: `https://proxy.momoapi.mtn.com/collection/token/`
- **Request Payment**: `https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay`
- **Check Status**: `https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/{referenceId}`

---

## ✅ Success Checklist

Before going live, ensure:
- [ ] Developer account created and verified
- [ ] Collection API subscription active
- [ ] API User created
- [ ] All credentials saved securely
- [ ] Environment variables set in Vercel
- [ ] Sandbox testing completed successfully
- [ ] Webhook callback verified
- [ ] Error handling tested
- [ ] Production access requested (if ready)
- [ ] Business documents submitted (for production)
- [ ] Production credentials received and configured

---

## 🆘 Troubleshooting

### Issue: Can't create API User
**Solution**: Ensure your callback host is correctly formatted (no http://, just domain)

### Issue: 401 Unauthorized Error
**Solution**: 
- Verify API credentials are correct
- Check that subscription is active
- Ensure environment matches (sandbox vs production)

### Issue: Webhook not receiving callbacks
**Solution**:
- Verify callback URL is accessible (HTTPS required)
- Check that URL is registered in API User settings
- Test callback URL manually

### Issue: Payment stuck in PENDING
**Solution**:
- Check customer's phone for approval prompt
- Verify phone number format is correct
- Check MoMo developer dashboard for transaction status

---

## 📞 Need Help?

1. **Check MoMo Developer Documentation**: Available in developer portal
2. **Contact MTN Support**: Email support through developer portal
3. **Review API Status**: Check for service updates
4. **Check Application Logs**: Review Vercel function logs for errors

---

**Status**: Ready to configure! Follow these steps to get your MoMo API credentials and start accepting payments. 🚀
