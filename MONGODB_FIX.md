# MongoDB Connection Fix Guide

## Problem
`MongoDB Connection Error: connect ECONNREFUSED ::1:27017`

This means MongoDB is not running or connection string is incorrect.

## Solution Options

### Option 1: Use MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_db?retryWrites=true&w=majority
```

**Note:** Replace:
- `username` - Your MongoDB username
- `password` - Your MongoDB password  
- `cluster` - Your cluster name (e.g., cluster0.xxxxx)
- `erp_db` - Database name

### Option 2: Install & Run Local MongoDB

#### Windows Installation:

1. Download MongoDB Community Server:
   https://www.mongodb.com/try/download/community

2. Install MongoDB

3. Start MongoDB Service:
   ```powershell
   # Start MongoDB service
   net start MongoDB
   
   # Or if installed as service:
   Start-Service MongoDB
   ```

4. Verify MongoDB is running:
   ```powershell
   netstat -ano | findstr :27017
   ```

5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/erp_db
   ```

### Option 3: Use MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use:
```env
MONGODB_URI=mongodb://localhost:27017/erp_db
```

## Quick Fix Steps

1. **Check if MongoDB is running:**
   ```powershell
   netstat -ano | findstr :27017
   ```

2. **If not running, start MongoDB:**
   ```powershell
   net start MongoDB
   ```

3. **Check `.env` file:**
   - Make sure `MONGODB_URI` is set correctly
   - No extra spaces or quotes
   - Format: `mongodb://localhost:27017/erp_db` (for local)

4. **Restart server:**
   ```bash
   npm run dev
   ```

## Common Issues

### Issue: "ECONNREFUSED"
- **Solution:** MongoDB is not running. Start MongoDB service.

### Issue: "Authentication failed"
- **Solution:** Check username/password in connection string.

### Issue: "Network timeout"
- **Solution:** Check firewall settings or use MongoDB Atlas.

## Need Help?

If you have MongoDB Atlas credentials, I can help you configure the connection string.

