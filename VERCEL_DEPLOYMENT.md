# Vercel Deployment Guide

## ✅ Changes Made

1. **Created `/api/index.js`** - Vercel serverless function handler
2. **Updated `vercel.json`** - Changed to use serverless function
3. **Updated `database.js`** - Made serverless-friendly (no process.exit)
4. **Updated CORS** - More flexible for production

## 🔧 Required Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

### Required Variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_db
JWT_SECRET=59817748fe8311e0e9af68b08afd100c81527e8f23b812431b5ea1741294fd6c04af2cf2bf356c3826091fb9b02fb6a1248d45f127897fcd730383bba0b9791a
NODE_ENV=production
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
2. **Connect to Vercel** (if not connected)
3. **Add Environment Variables** in Vercel dashboard
4. **Redeploy** - Vercel will automatically redeploy on next push

## 🔍 Troubleshooting

### If you get 500 errors:

1. **Check Environment Variables** - Make sure all required vars are set
2. **Check MongoDB Atlas** - Ensure IP whitelist includes `0.0.0.0/0` (all IPs)
3. **Check Vercel Logs** - Go to Vercel dashboard → Functions → View logs

### Common Issues:

- **MongoDB Connection Failed**: Check MONGODB_URI and IP whitelist
- **JWT Errors**: Make sure JWT_SECRET is set
- **CORS Errors**: Update CORS_ORIGIN to your frontend URL

## 🚀 After Deployment

Your API will be available at:
```
https://erpbackend-chi.vercel.app/api/v1/...
```

Test endpoint:
```
https://erpbackend-chi.vercel.app/health
```

