# Vercel Deployment Guide

## ✅ Changes Made

1. **Created `/api/index.js`** - Vercel serverless function handler
2. **Updated `vercel.json`** - Changed to use serverless function
3. **Updated `database.js`** - Made serverless-friendly (no process.exit)
4. **Updated CORS** - More flexible for production
5. **Created `.vercelignore`** - Excludes unnecessary files

## 🔧 Required Environment Variables in Vercel

**IMPORTANT:** Go to your Vercel project dashboard → Settings → Environment Variables and add these:

### Required Variables (MUST HAVE):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_db
JWT_SECRET=59817748fe8311e0e9af68b08afd100c81527e8f23b812431b5ea1741294fd6c04af2cf2bf356c3826091fb9b02fb6a1248d45f127897fcd730383bba0b9791a
NODE_ENV=production
```

### Important for Frontend:

```env
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Optional Variables:

```env
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📝 Steps to Deploy

1. **Push code to GitHub** (if not already done)
2. **Go to Vercel Dashboard** → Your Project → Settings
3. **Add Environment Variables** (see above)
4. **Redeploy** - Go to Deployments → Click "..." → Redeploy

## 🔍 Troubleshooting 500 Errors

### Step 1: Check Environment Variables
- Go to Vercel Dashboard → Settings → Environment Variables
- Make sure `MONGODB_URI` and `JWT_SECRET` are set
- Make sure they're set for **Production** environment

### Step 2: Check MongoDB Atlas
1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" or add `0.0.0.0/0`
5. Save

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Click on the function (api/index.js)
4. View logs to see the actual error

### Step 4: Test Health Endpoint
Try: `https://erpbackend-chi.vercel.app/health`

If this works, the deployment is fine but there might be DB connection issues.

## 🚀 After Deployment

Your API will be available at:
```
https://erpbackend-chi.vercel.app/api/v1/...
https://erpbackend-chi.vercel.app/api/products
https://erpbackend-chi.vercel.app/api/auth/login
```

Test endpoints:
```
GET https://erpbackend-chi.vercel.app/health
GET https://erpbackend-chi.vercel.app/api/v1/test
```

## ⚠️ Common Issues & Solutions

### Issue: "MONGODB_URI is not defined"
**Solution:** Add `MONGODB_URI` in Vercel Environment Variables

### Issue: "MongoDB Connection Error"
**Solution:** 
1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
2. Verify MONGODB_URI is correct
3. Check MongoDB Atlas cluster is running

### Issue: "JWT_SECRET is not defined"
**Solution:** Add `JWT_SECRET` in Vercel Environment Variables

### Issue: Function times out
**Solution:** Check MongoDB connection - might be slow or failing

