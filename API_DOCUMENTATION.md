# ERP Backend API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include token in headers:
```
Authorization: Bearer <your_token>
```

---

## 🔐 Authentication

### Register
```
POST /auth/register
Body: { name, email, password, companyName, phone? }
```

### Login
```
POST /auth/login
Body: { email, password }
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
```

### Update Profile
```
PUT /auth/profile
Headers: Authorization: Bearer <token>
Body: { name?, email?, phone? }
```

### Change Password
```
PUT /auth/change-password
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
```

---

## 📦 Products

### Get All Products
```
GET /products?page=1&limit=10&search=term&categoryId=xxx&status=active
```

### Get Product by ID
```
GET /products/:id
```

### Create Product
```
POST /products
Body: { name, categoryId, unitId, costPrice, sellingPrice, sku?, ... }
```

### Update Product
```
PUT /products/:id
Body: { name?, costPrice?, sellingPrice?, ... }
```

### Delete Product
```
DELETE /products/:id
```

### Search Products
```
GET /products/search/q?q=searchterm
```

### Get Low Stock Products
```
GET /products/low-stock/all
```

---

## 📁 Categories

### Get All Categories
```
GET /categories
```

### Get Category by ID
```
GET /categories/:id
```

### Create Category
```
POST /categories
Body: { name, description?, parentCategory? }
```

### Update Category
```
PUT /categories/:id
```

### Delete Category
```
DELETE /categories/:id
```

### Get Parent Categories
```
GET /categories/parents/all
```

---

## 🏷️ Brands & Units

### Brands
```
GET /brands
GET /brands/:id
POST /brands
PUT /brands/:id
DELETE /brands/:id
```

### Units
```
GET /units
GET /units/:id
POST /units
PUT /units/:id
DELETE /units/:id
```

---

## 📦 Inventory

### Get Inventory by Product
```
GET /inventory/product/:productId
```

### Get Inventory by Warehouse
```
GET /inventory/warehouse/:warehouseId
```

### Get Low Stock Items
```
GET /inventory/low-stock/all
```

### Add Stock
```
POST /inventory/add
Body: { productId, warehouseId, quantity, cost, notes? }
```

### Remove Stock
```
POST /inventory/remove
Body: { productId, warehouseId, quantity, notes? }
```

### Adjust Stock
```
POST /inventory/adjust
Body: { productId, warehouseId, newQuantity, notes? }
```

### Transfer Stock
```
POST /inventory/transfer
Body: { productId, fromWarehouseId, toWarehouseId, quantity }
```

### Get Stock Movements
```
GET /inventory/movements/all?productId=xxx&warehouseId=xxx
```

---

## 🏢 Warehouses

### Get All Warehouses
```
GET /warehouses
```

### Get Warehouse by ID
```
GET /warehouses/:id
```

### Create Warehouse
```
POST /warehouses
Body: { name, code?, address?, isMain? }
```

### Update Warehouse
```
PUT /warehouses/:id
```

### Delete Warehouse
```
DELETE /warehouses/:id
```

### Get Active Warehouses
```
GET /warehouses/active/all
```

### Get Main Warehouse
```
GET /warehouses/main/one
```

---

## 👥 Customers

### Get All Customers
```
GET /customers?page=1&limit=10&search=term&type=individual&status=active
```

### Get Customer by ID
```
GET /customers/:id
```

### Create Customer
```
POST /customers
Body: { name, phone, email?, address?, type?, creditLimit?, paymentTerms? }
```

### Update Customer
```
PUT /customers/:id
```

### Delete Customer
```
DELETE /customers/:id
```

### Search Customers
```
GET /customers/search/q?q=searchterm
```

### Get Active Customers
```
GET /customers/active/all
```

---

## 🏭 Suppliers

### Get All Suppliers
```
GET /suppliers
```

### Get Supplier by ID
```
GET /suppliers/:id
```

### Create Supplier
```
POST /suppliers
Body: { name, phone, email?, address?, type?, contactPerson? }
```

### Update Supplier
```
PUT /suppliers/:id
```

### Delete Supplier
```
DELETE /suppliers/:id
```

### Search Suppliers
```
GET /suppliers/search/q?q=searchterm
```

### Get Active Suppliers
```
GET /suppliers/active/all
```

---

## 💰 Sales

### Get All Sales Orders
```
GET /sales?page=1&limit=10&customerId=xxx&status=pending&startDate=2024-01-01
```

### Get Sales Order by ID
```
GET /sales/:id
```

### Create Sales Order
```
POST /sales
Body: { customerId, warehouseId, items: [{ productId, quantity, unitPrice, ... }], date?, notes? }
```

### Update Order Status
```
PUT /sales/:id/status
Body: { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
```

### Add Payment to Order
```
POST /sales/:id/payment
Body: { paymentAmount }
```

### Get Sales Summary
```
GET /sales/summary/all?startDate=2024-01-01&endDate=2024-12-31
```

### Get Orders by Customer
```
GET /sales/customer/:customerId
```

---

## 🛒 Purchase

### Get All Purchase Orders
```
GET /purchase?page=1&limit=10&supplierId=xxx&status=pending
```

### Get Purchase Order by ID
```
GET /purchase/:id
```

### Create Purchase Order
```
POST /purchase
Body: { supplierId, warehouseId, items: [{ productId, quantity, unitCost, ... }], date?, expectedDate? }
```

### Receive Goods
```
POST /purchase/:id/receive
Body: { receivedItems: [{ itemId, quantity }] }
```

### Update Order Status
```
PUT /purchase/:id/status
Body: { status }
```

### Add Payment
```
POST /purchase/:id/payment
Body: { paymentAmount }
```

### Get Purchase Summary
```
GET /purchase/summary/all?startDate=2024-01-01&endDate=2024-12-31
```

### Get Orders by Supplier
```
GET /purchase/supplier/:supplierId
```

---

## 🧾 Invoices

### Get All Invoices
```
GET /invoices?page=1&limit=10&customerId=xxx&paymentStatus=pending
```

### Get Invoice by ID
```
GET /invoices/:id
```

### Create Invoice from Sales Order
```
POST /invoices/from-sales-order
Body: { salesOrderId, date?, dueDate?, notes?, terms? }
```

### Create Standalone Invoice
```
POST /invoices/standalone
Body: { customerId, date, dueDate, items: [...], notes?, terms? }
```

### Get Overdue Invoices
```
GET /invoices/overdue/all
```

### Get Invoice Summary
```
GET /invoices/summary/all?startDate=2024-01-01&endDate=2024-12-31
```

### Get Invoices by Customer
```
GET /invoices/customer/:customerId
```

---

## 💳 Payments

### Get All Payments
```
GET /payments?page=1&limit=10&customerId=xxx&method=cash&startDate=2024-01-01
```

### Create Payment for Invoice
```
POST /payments/for-invoice
Body: { invoiceId, amount, method, date?, referenceNumber?, notes? }
```

### Create Payment for Purchase Order
```
POST /payments/for-purchase-order
Body: { purchaseOrderId, amount, method, date?, referenceNumber?, notes? }
```

### Get Payment Summary
```
GET /payments/summary/all?startDate=2024-01-01&endDate=2024-12-31
```

### Get Payments by Invoice
```
GET /payments/invoice/:invoiceId
```

### Get Payments by Customer
```
GET /payments/customer/:customerId
```

---

## 📊 Dashboard

### Get Dashboard Overview
```
GET /dashboard/overview?startDate=2024-01-01&endDate=2024-12-31
```

### Get Sales Statistics
```
GET /dashboard/sales/stats?startDate=2024-01-01&endDate=2024-12-31
```

### Get Purchase Statistics
```
GET /dashboard/purchase/stats?startDate=2024-01-01&endDate=2024-12-31
```

### Get Sales Chart Data
```
GET /dashboard/sales/chart?startDate=2024-01-01&endDate=2024-12-31&groupBy=day|week|month
```

### Get Top Selling Products
```
GET /dashboard/products/top?startDate=2024-01-01&endDate=2024-12-31&limit=10
```

### Get Top Customers
```
GET /dashboard/customers/top?startDate=2024-01-01&endDate=2024-12-31&limit=10
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Notes

- All dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`
- All monetary values are in numbers (not strings)
- Pagination: Default page=1, limit=10, max limit=100
- All endpoints require authentication except `/auth/register` and `/auth/login`

