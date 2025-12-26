# Demo Data Seeding Guide

এই script টি database এ demo data add করবে যাতে website টি আরও ভালোভাবে বুঝা যায়।

## Prerequisites

1. MongoDB running (local বা Atlas)
2. `.env` file এ `MONGODB_URI` set করা থাকতে হবে
3. Backend dependencies installed (`npm install`)

## How to Run

### Option 1: Using npm script
```bash
cd BackEnd
npm run seed:demo
```

### Option 2: Direct node command
```bash
cd BackEnd
node src/scripts/seedDemoData.js
```

## What Will Be Created

### 1. Demo Company & User
- **Company**: Demo Company
- **User Email**: demo@example.com
- **Password**: Demo@123

### 2. Master Data
- **5 Categories**: Electronics, Clothing, Food & Beverages, Furniture, Books
- **5 Brands**: TechCorp, FashionHub, FreshFoods, ComfortHome, ReadMore
- **5 Units**: Piece, Kilogram, Liter, Meter, Box
- **3 Warehouses**: Main Warehouse, North Warehouse, South Warehouse

### 3. Products (8 items)
- Laptop Computer
- Wireless Mouse
- Mechanical Keyboard
- Cotton T-Shirt
- Jeans
- Coffee Beans
- Office Chair
- Programming Book

### 4. Customers (3)
- John Smith (Individual)
- ABC Corporation (Business)
- Sarah Johnson (Individual)

### 5. Suppliers (3)
- Global Suppliers Inc
- Tech Distributors
- Local Wholesale

### 6. Inventory
- Main Warehouse এ সব products এর stock (20-120 units random)

### 7. Purchase Orders (5)
- Different suppliers থেকে
- Some completed, some pending

### 8. Sales Orders (8)
- Different customers এর জন্য
- Different statuses (pending, confirmed, shipped, delivered)

## After Seeding

1. Frontend এ login করুন:
   - Email: `demo@example.com`
   - Password: `Demo@123`

2. Dashboard, Inventory, Sales, Purchase pages এ real data দেখবেন

3. Charts এবং tables এ data populate হবে

## Notes

- Script টি idempotent - multiple times run করলে existing data update হবে, duplicate create হবে না
- যদি demo user already exists, তাহলে নতুন user create হবে না
- Stock movements automatically create হবে inventory add করার সময়

## Troubleshooting

### MongoDB Connection Error
- Check `.env` file এ `MONGODB_URI` correct আছে কিনা
- MongoDB running আছে কিনা check করুন

### Duplicate Key Error
- Normal - script existing data skip করবে

### Module Not Found
- `npm install` run করুন

