# Seed Demo Data for All Admin Users

এই script টি database-এ থাকা **সব admin users**-এর জন্য demo data seed করবে।

## Prerequisites

1. MongoDB running (local বা Atlas)
2. `.env` file এ `MONGODB_URI` set করা থাকতে হবে
3. Backend dependencies installed (`npm install`)
4. Database-এ অন্তত একটি admin user থাকতে হবে

## How to Run

```bash
cd BackEnd
npm run seed:all-admins
```

## What It Does

1. **সব admin users খুঁজে বের করে** (role: `admin`, `super_admin`, `manager`)
2. **প্রতিটি unique company-এর জন্য** demo data seed করে
3. **Duplicate seeding এড়ায়** - একই company-এর জন্য একবারই seed করবে

## What Will Be Created (Per Company)

### Master Data
- **5 Categories**: Electronics, Clothing, Food & Beverages, Furniture, Books
- **5 Brands**: TechCorp, FashionHub, FreshFoods, ComfortHome, ReadMore
- **5 Units**: Piece, Kilogram, Liter, Meter, Box
- **3 Warehouses**: Main Warehouse, North Warehouse, South Warehouse

### Products (8 items)
- Laptop Computer
- Wireless Mouse
- Mechanical Keyboard
- Cotton T-Shirt
- Jeans
- Coffee Beans
- Office Chair
- Programming Book

### Customers (3)
- John Smith (Individual)
- ABC Corporation (Company)
- Sarah Johnson (Individual)

### Suppliers (3)
- Global Suppliers Inc
- Tech Distributors
- Local Wholesale

### Inventory
- Main Warehouse-এ সব products-এর stock (20-120 units random)

## After Seeding

1. **কোনো admin account দিয়ে login করুন**
2. **Dashboard, Inventory, Sales, Purchase pages-এ real data দেখবেন**
3. **Charts এবং tables-এ data populate হবে**
4. **Forms-এ dropdowns-এ options দেখবেন**

## Notes

- Script টি **idempotent** - multiple times run করলে existing data update হবে, duplicate create হবে না
- যদি কোনো company-এর data already থাকে, তাহলে skip করবে
- Stock movements automatically create হবে inventory add করার সময়
- **সব admin users-এর company-এর জন্য** demo data seed হবে

## Example Output

```
✅ Connected to MongoDB

📋 Found 3 admin user(s)

🏢 Found 3 unique company(ies)

📦 Seeding demo data for: Demo Company
   Company ID: 6942ea730f3662beea562d87
   Admin User: demo@example.com
──────────────────────────────────────────────────
✅ Successfully seeded:
   - Categories: 5
   - Brands: 5
   - Units: 5
   - Warehouses: 3
   - Products: 8
   - Customers: 3
   - Suppliers: 3

==================================================
🎉 Demo data seeding completed!
==================================================

📊 Summary:
   - Companies processed: 3
   - Successfully seeded: 3
   - Failed: 0
   - Total admin users: 3

💡 Login with any admin account to see the demo data
```

## Troubleshooting

### No Admin Users Found
- Error: `❌ No admin users found in the database`
- Solution: প্রথমে register করুন বা admin user create করুন

### MongoDB Connection Error
- Check `.env` file এ `MONGODB_URI` correct আছে কিনা
- MongoDB running আছে কিনা check করুন

### Duplicate Key Error
- Normal - script existing data skip করবে

### Module Not Found
- `npm install` run করুন

