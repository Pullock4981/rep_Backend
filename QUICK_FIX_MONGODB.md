# Quick MongoDB Fix

## আপনার সমস্যা:
MongoDB connection fail হচ্ছে কারণ MongoDB running নেই।

## সমাধান (2টি Option):

### Option 1: MongoDB Atlas ব্যবহার করুন (সবচেয়ে সহজ) ⭐

আপনার `env.example` file-এ credentials আছে:
- Username: `ashikpullock99_db_user`
- Password: `gVGwrgZTk4ZbvuBK`

**Steps:**

1. `.env` file খুলুন
2. `MONGODB_URI` line update করুন:

```env
MONGODB_URI=mongodb+srv://ashikpullock99_db_user:gVGwrgZTk4ZbvuBK@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
```

**⚠️ Important:** `cluster0.xxxxx` এর জায়গায় আপনার actual cluster URL ব্যবহার করুন।

MongoDB Atlas থেকে connection string পাওয়ার জন্য:
1. https://www.mongodb.com/cloud/atlas এ login করুন
2. Your cluster → Connect → Connect your application
3. Connection string copy করুন
4. Username/password replace করুন

### Option 2: Local MongoDB Install করুন

1. MongoDB Download করুন:
   https://www.mongodb.com/try/download/community

2. Install করুন

3. MongoDB Service Start করুন:
   ```powershell
   net start MongoDB
   ```

4. `.env` file-এ:
   ```env
   MONGODB_URI=mongodb://localhost:27017/erp_db
   ```

## এখন কি করবেন:

1. **MongoDB Atlas ব্যবহার করলে:**
   - Atlas cluster URL নিয়ে `.env` file update করুন
   - Server restart করুন

2. **Local MongoDB ব্যবহার করলে:**
   - MongoDB install করুন
   - Service start করুন
   - Server restart করুন

## Test করার জন্য:

Server restart করার পর দেখবেন:
```
✅ MongoDB Connected: ...
```

যদি এখনও error হয়, আমাকে জানান!

