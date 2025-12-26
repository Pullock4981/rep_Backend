# Vercel Deployment Troubleshooting

## 🔴 Current Error: 500 INTERNAL_SERVER_ERROR

### Step-by-Step Debugging:

#### 1. Check Vercel Logs (MOST IMPORTANT)
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Functions** tab
4. Click on `api/index.js`
5. View the **Logs** tab
6. Look for the actual error message

**Common errors you might see:**
- `MONGODB_URI is not defined` → Add environment variable
- `MongoDB Connection Error` → Check IP whitelist
- `Cannot find module` → Check package.json dependencies
- `JWT_SECRET is not defined` → Add environment variable

#### 2. Verify Environment Variables
Go to: **Settings → Environment Variables**

**Required:**
- ✅ `MONGODB_URI` (must be set)
- ✅ `JWT_SECRET` (must be set)
- ✅ `NODE_ENV=production` (optional but recommended)

**Check:**
- Are they set for **Production** environment?
- Are the values correct? (no extra spaces, correct format)

#### 3. Test Health Endpoint
Try accessing: `https://erpbackend-chi.vercel.app/health`

If this works → Deployment is fine, issue is with DB or routes
If this fails → Deployment/config issue

#### 4. MongoDB Atlas Setup
1. Go to MongoDB Atlas Dashboard
2. **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Save

#### 5. Check MONGODB_URI Format
Should be:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

**Common mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong password (special characters need URL encoding)
- ❌ Wrong cluster URL
- ❌ Database name missing

#### 6. Redeploy After Changes
After adding environment variables:
1. Go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

## 🛠️ Quick Fixes

### Fix 1: Add Missing Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/erp_db
JWT_SECRET=59817748fe8311e0e9af68b08afd100c81527e8f23b812431b5ea1741294fd6c04af2cf2bf356c3826091fb9b02fb6a1248d45f127897fcd730383bba0b9791a
NODE_ENV=production
```

### Fix 2: MongoDB Atlas IP Whitelist
- Add `0.0.0.0/0` to allow all IPs

### Fix 3: Check Vercel Build Logs
1. Go to **Deployments**
2. Click on the deployment
3. Check **Build Logs** for errors

## 📋 Checklist

Before asking for help, verify:
- [ ] Environment variables are set in Vercel
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] MONGODB_URI format is correct
- [ ] Code is pushed to GitHub
- [ ] Vercel is connected to GitHub repo
- [ ] Latest deployment shows the error

## 🔍 Get Exact Error

**To get the exact error, check Vercel Function Logs:**
1. Vercel Dashboard → Project
2. Functions tab
3. Click `api/index.js`
4. View Logs
5. Copy the error message

**Share the error message for specific help!**

