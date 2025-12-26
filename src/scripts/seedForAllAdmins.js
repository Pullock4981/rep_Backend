const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const config = require("../config/env");
const User = require("../models/User");
const Company = require("../models/Company");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Inventory = require("../models/Inventory");
const SalesOrder = require("../models/SalesOrder");
const PurchaseOrder = require("../models/PurchaseOrder");
const StockMovement = require("../models/StockMovement");

// Demo data (same as seedDemoData.js)
const demoData = {
  categories: [
    { name: "Electronics", description: "Electronic products and gadgets" },
    { name: "Clothing", description: "Apparel and fashion items" },
    { name: "Food & Beverages", description: "Food and drink products" },
    { name: "Furniture", description: "Home and office furniture" },
    { name: "Books", description: "Books and publications" },
  ],
  brands: [
    { name: "TechCorp", description: "Technology corporation" },
    { name: "FashionHub", description: "Fashion brand" },
    { name: "FreshFoods", description: "Fresh food products" },
    { name: "ComfortHome", description: "Home furniture brand" },
    { name: "ReadMore", description: "Book publisher" },
  ],
  units: [
    { name: "Piece", shortName: "pcs", symbol: "pcs", type: "count" },
    { name: "Kilogram", shortName: "kg", symbol: "kg", type: "weight" },
    { name: "Liter", shortName: "L", symbol: "L", type: "volume" },
    { name: "Meter", shortName: "m", symbol: "m", type: "length" },
    { name: "Box", shortName: "box", symbol: "box", type: "count" },
  ],
  warehouses: [
    { name: "Main Warehouse", code: "WH-001", isMain: true, address: "123 Main St, City" },
    { name: "North Warehouse", code: "WH-002", isMain: false, address: "456 North Ave, City" },
    { name: "South Warehouse", code: "WH-003", isMain: false, address: "789 South Rd, City" },
  ],
  products: [
    {
      name: "Laptop Computer",
      sku: "PROD-001",
      barcode: "1234567890123",
      costPrice: 800,
      sellingPrice: 1200,
      minStock: 5,
      maxStock: 50,
      reorderLevel: 10,
      description: "High-performance laptop",
      status: "active",
    },
    {
      name: "Wireless Mouse",
      sku: "PROD-002",
      barcode: "1234567890124",
      costPrice: 15,
      sellingPrice: 25,
      minStock: 20,
      maxStock: 200,
      reorderLevel: 50,
      description: "Ergonomic wireless mouse",
      status: "active",
    },
    {
      name: "Mechanical Keyboard",
      sku: "PROD-003",
      barcode: "1234567890125",
      costPrice: 60,
      sellingPrice: 100,
      minStock: 10,
      maxStock: 100,
      reorderLevel: 20,
      description: "RGB mechanical keyboard",
      status: "active",
    },
    {
      name: "Cotton T-Shirt",
      sku: "PROD-004",
      barcode: "1234567890126",
      costPrice: 10,
      sellingPrice: 20,
      minStock: 50,
      maxStock: 500,
      reorderLevel: 100,
      description: "100% cotton t-shirt",
      status: "active",
    },
    {
      name: "Jeans",
      sku: "PROD-005",
      barcode: "1234567890127",
      costPrice: 30,
      sellingPrice: 60,
      minStock: 30,
      maxStock: 300,
      reorderLevel: 60,
      description: "Classic blue jeans",
      status: "active",
    },
    {
      name: "Coffee Beans",
      sku: "PROD-006",
      barcode: "1234567890128",
      costPrice: 12,
      sellingPrice: 20,
      minStock: 20,
      maxStock: 200,
      reorderLevel: 40,
      description: "Premium coffee beans",
      status: "active",
    },
    {
      name: "Office Chair",
      sku: "PROD-007",
      barcode: "1234567890129",
      costPrice: 150,
      sellingPrice: 250,
      minStock: 5,
      maxStock: 50,
      reorderLevel: 10,
      description: "Ergonomic office chair",
      status: "active",
    },
    {
      name: "Programming Book",
      sku: "PROD-008",
      barcode: "1234567890130",
      costPrice: 25,
      sellingPrice: 40,
      minStock: 10,
      maxStock: 100,
      reorderLevel: 20,
      description: "Learn programming fundamentals",
      status: "active",
    },
  ],
  customers: [
    {
      name: "John Smith",
      code: "CUST-001",
      phone: "+1234567890",
      email: "john@example.com",
      type: "individual",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      paymentTerms: "net_30",
      status: "active",
    },
    {
      name: "ABC Corporation",
      code: "CUST-002",
      phone: "+1234567891",
      email: "contact@abc.com",
      type: "company",
      address: {
        street: "456 Business Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
      },
      creditLimit: 10000,
      paymentTerms: "net_30",
      status: "active",
    },
    {
      name: "Sarah Johnson",
      code: "CUST-003",
      phone: "+1234567892",
      email: "sarah@example.com",
      type: "individual",
      address: {
        street: "789 Park Rd",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
      paymentTerms: "net_15",
      status: "active",
    },
  ],
  suppliers: [
    {
      name: "Global Suppliers Inc",
      code: "SUPP-001",
      phone: "+1234567893",
      email: "contact@globalsuppliers.com",
      type: "manufacturer",
      address: {
        street: "100 Supplier St",
        city: "Miami",
        state: "FL",
        zipCode: "33101",
        country: "USA",
      },
      paymentTerms: "net_30",
      status: "active",
    },
    {
      name: "Tech Distributors",
      code: "SUPP-002",
      phone: "+1234567894",
      email: "info@techdist.com",
      type: "distributor",
      address: {
        street: "200 Tech Blvd",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "USA",
      },
      paymentTerms: "net_30",
      status: "active",
    },
    {
      name: "Local Wholesale",
      code: "SUPP-003",
      phone: "+1234567895",
      email: "sales@localwholesale.com",
      type: "wholesaler",
      address: {
        street: "300 Wholesale Ave",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        country: "USA",
      },
      paymentTerms: "net_15",
      status: "active",
    },
  ],
  departments: [
    { name: "Human Resources", code: "HR", description: "HR and Administration" },
    { name: "Sales", code: "SALES", description: "Sales and Marketing" },
    { name: "IT", code: "IT", description: "Information Technology" },
    { name: "Finance", code: "FIN", description: "Finance and Accounting" },
    { name: "Operations", code: "OPS", description: "Operations and Logistics" },
  ],
  employees: [
    {
      empId: "EMP-001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+1234567890",
      position: "Manager",
      designation: "Sales Manager",
      joinDate: new Date("2023-01-15"),
      salary: 50000,
      status: "active",
    },
    {
      empId: "EMP-002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@company.com",
      phone: "+1234567891",
      position: "Developer",
      designation: "Senior Software Engineer",
      joinDate: new Date("2023-03-20"),
      salary: 60000,
      status: "active",
    },
    {
      empId: "EMP-003",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@company.com",
      phone: "+1234567892",
      position: "Accountant",
      designation: "Senior Accountant",
      joinDate: new Date("2023-02-10"),
      salary: 45000,
      status: "active",
    },
    {
      empId: "EMP-004",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@company.com",
      phone: "+1234567893",
      position: "HR Specialist",
      designation: "HR Manager",
      joinDate: new Date("2023-04-05"),
      salary: 55000,
      status: "active",
    },
    {
      empId: "EMP-005",
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@company.com",
      phone: "+1234567894",
      position: "Analyst",
      designation: "Business Analyst",
      joinDate: new Date("2023-05-12"),
      salary: 48000,
      status: "active",
    },
  ],
};

async function seedForCompany(companyId, userId) {
  // Seed Categories
  const categoryMap = {};
  for (const catData of demoData.categories) {
    let category = await Category.findOne({ name: catData.name, companyId });
    if (!category) {
      category = await Category.findOne({ name: catData.name });
      if (category) {
        category.companyId = companyId;
        category.createdBy = userId;
        await category.save();
      } else {
        try {
          category = await Category.create({
            ...catData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            category = await Category.findOne({ name: catData.name, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    categoryMap[catData.name] = category._id;
  }

  // Seed Brands
  const brandMap = {};
  for (const brandData of demoData.brands) {
    let brand = await Brand.findOne({ name: brandData.name, companyId });
    if (!brand) {
      brand = await Brand.findOne({ name: brandData.name });
      if (brand) {
        brand.companyId = companyId;
        brand.createdBy = userId;
        await brand.save();
      } else {
        try {
          brand = await Brand.create({
            ...brandData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            brand = await Brand.findOne({ name: brandData.name, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    brandMap[brandData.name] = brand._id;
  }

  // Seed Units
  const unitMap = {};
  for (const unitData of demoData.units) {
    let unit = await Unit.findOne({ name: unitData.name, companyId });
    if (!unit) {
      unit = await Unit.findOne({ name: unitData.name });
      if (unit) {
        unit.companyId = companyId;
        unit.createdBy = userId;
        await unit.save();
      } else {
        try {
          unit = await Unit.create({
            ...unitData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            unit = await Unit.findOne({ name: unitData.name, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    unitMap[unitData.name] = unit._id;
  }

  // Seed Warehouses
  const warehouseMap = {};
  for (const whData of demoData.warehouses) {
    let warehouse = await Warehouse.findOne({ code: whData.code, companyId });
    if (!warehouse) {
      warehouse = await Warehouse.findOne({ code: whData.code });
      if (warehouse) {
        warehouse.companyId = companyId;
        warehouse.createdBy = userId;
        await warehouse.save();
      } else {
        try {
          warehouse = await Warehouse.create({
            ...whData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            warehouse = await Warehouse.findOne({ code: whData.code, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    warehouseMap[whData.code] = warehouse._id;
  }

  // Seed Products
  const productMap = {};
  const categoryNames = Object.keys(categoryMap);
  const brandNames = Object.keys(brandMap);
  const unitNames = Object.keys(unitMap);

  for (let i = 0; i < demoData.products.length; i++) {
    const prodData = demoData.products[i];
    const categoryName = categoryNames[i % categoryNames.length];
    const brandName = brandNames[i % brandNames.length];
    const unitName = unitNames[i % unitNames.length];

    let product = await Product.findOne({ sku: prodData.sku, companyId });
    if (!product) {
      product = await Product.findOne({ sku: prodData.sku });
      if (product) {
        product.companyId = companyId;
        product.categoryId = categoryMap[categoryName];
        product.brandId = brandMap[brandName];
        product.unitId = unitMap[unitName];
        product.createdBy = userId;
        await product.save();
      } else {
        try {
          product = await Product.create({
            ...prodData,
            categoryId: categoryMap[categoryName],
            brandId: brandMap[brandName],
            unitId: unitMap[unitName],
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            product = await Product.findOne({ sku: prodData.sku, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    productMap[prodData.sku] = product._id;
  }

  // Seed Customers
  const customerMap = {};
  for (const custData of demoData.customers) {
    let customer = await Customer.findOne({ code: custData.code, companyId });
    if (!customer) {
      customer = await Customer.findOne({ code: custData.code });
      if (customer) {
        customer.companyId = companyId;
        customer.createdBy = userId;
        await customer.save();
      } else {
        try {
          customer = await Customer.create({
            ...custData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            customer = await Customer.findOne({ code: custData.code, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    customerMap[custData.code] = customer._id;
  }

  // Seed Suppliers
  const supplierMap = {};
  for (const suppData of demoData.suppliers) {
    let supplier = await Supplier.findOne({ code: suppData.code, companyId });
    if (!supplier) {
      supplier = await Supplier.findOne({ code: suppData.code });
      if (supplier) {
        supplier.companyId = companyId;
        supplier.createdBy = userId;
        await supplier.save();
      } else {
        try {
          supplier = await Supplier.create({
            ...suppData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            supplier = await Supplier.findOne({ code: suppData.code, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    supplierMap[suppData.code] = supplier._id;
  }

  // Seed Inventory for Main Warehouse
  const mainWarehouseId = warehouseMap["WH-001"];
  if (mainWarehouseId) {
    for (const [sku, productId] of Object.entries(productMap)) {
      const existing = await Inventory.findOne({ 
        productId, 
        warehouseId: mainWarehouseId,
        companyId 
      });
      if (!existing) {
        const product = await Product.findById(productId);
        const quantity = Math.floor(Math.random() * 100) + 20; // 20-120
        const cost = product?.costPrice || 0;
        
        try {
          const inventory = await Inventory.create({
            productId,
            warehouseId: mainWarehouseId,
            companyId,
            quantity: quantity,
            availableQuantity: quantity,
            reservedQuantity: 0,
            averageCost: cost,
            lastCost: cost,
            totalValue: quantity * cost,
            createdBy: userId,
          });

          // Create stock movement
          await StockMovement.create({
            productId,
            warehouseId: mainWarehouseId,
            companyId,
            action: "in",
            quantity,
            previousQuantity: 0,
            newQuantity: quantity,
            cost,
            referenceType: "other",
            notes: "Initial stock from seed data",
            createdBy: userId,
          });
        } catch (err) {
          if (err.code !== 11000) {
            console.error(`Error creating inventory for ${sku}:`, err.message);
          }
        }
      }
    }
  }

  // Seed Purchase Orders
  const purchaseOrders = [];
  const supplierIds = Object.values(supplierMap);
  const productIds = Object.values(productMap);
  
  if (supplierIds.length > 0 && productIds.length > 0 && mainWarehouseId) {
    for (let i = 0; i < 5; i++) {
      const supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = await Product.findById(productId);
        if (product) {
          items.push({
            productId,
            quantity: Math.floor(Math.random() * 50) + 10,
            unitCost: product.costPrice,
            receivedQuantity: i < 2 ? Math.floor(Math.random() * 50) + 10 : 0, // First 2 partially received
            total: 0, // Will be calculated by pre-save middleware
          });
        }
      }

      if (items.length > 0) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

        try {
          const purchaseOrder = await PurchaseOrder.create({
            orderNumber: `PO-${Date.now()}-${i}`,
            supplierId,
            warehouseId: mainWarehouseId,
            companyId,
            items,
            date: orderDate,
            expectedDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: i < 2 ? "delivered" : i < 3 ? "confirmed" : "pending",
            createdBy: userId,
          });
          purchaseOrders.push(purchaseOrder);
        } catch (err) {
          console.error(`Error creating purchase order ${i}:`, err.message);
        }
      }
    }
  }

  // Seed Sales Orders
  const salesOrders = [];
  const customerIds = Object.values(customerMap);
  
  if (customerIds.length > 0 && productIds.length > 0 && mainWarehouseId) {
    for (let i = 0; i < 8; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = await Product.findById(productId);
        if (product) {
          items.push({
            productId,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: product.sellingPrice,
            total: 0, // Will be calculated by pre-save middleware
          });
        }
      }

      if (items.length > 0) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

        const statuses = ["pending", "confirmed", "shipped", "delivered"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        try {
          const salesOrder = await SalesOrder.create({
            orderNumber: `SO-${Date.now()}-${i}`,
            customerId,
            warehouseId: mainWarehouseId,
            companyId,
            items,
            date: orderDate,
            status,
            createdBy: userId,
          });
          salesOrders.push(salesOrder);
        } catch (err) {
          console.error(`Error creating sales order ${i}:`, err.message);
        }
      }
    }
  }

  // Seed Departments
  const departmentMap = {};
  for (const deptData of demoData.departments) {
    let department = await Department.findOne({ code: deptData.code, companyId });
    if (!department) {
      department = await Department.findOne({ code: deptData.code });
      if (department) {
        department.companyId = companyId;
        department.createdBy = userId;
        await department.save();
      } else {
        try {
          department = await Department.create({
            ...deptData,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            department = await Department.findOne({ code: deptData.code, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    departmentMap[deptData.code] = department._id;
  }

  // Seed Employees
  const employeeMap = {};
  const departmentCodes = Object.keys(departmentMap);
  for (let i = 0; i < demoData.employees.length; i++) {
    const empData = demoData.employees[i];
    const deptCode = departmentCodes[i % departmentCodes.length];

    let employee = await Employee.findOne({ empId: empData.empId, companyId });
    if (!employee) {
      employee = await Employee.findOne({ empId: empData.empId });
      if (employee) {
        employee.companyId = companyId;
        employee.departmentId = departmentMap[deptCode];
        employee.createdBy = userId;
        await employee.save();
      } else {
        try {
          employee = await Employee.create({
            ...empData,
            departmentId: departmentMap[deptCode],
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          if (err.code === 11000) {
            employee = await Employee.findOne({ empId: empData.empId, companyId });
          } else {
            throw err;
          }
        }
      }
    }
    employeeMap[empData.empId] = employee._id;
  }

  // Seed Attendance (last 30 days)
  const employeeIds = Object.values(employeeMap);
  const today = new Date();
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    for (const empId of employeeIds) {
      // Skip weekends randomly
      if (date.getDay() === 0 || date.getDay() === 6) {
        if (Math.random() > 0.3) continue; // 70% skip weekends
      }

      const statuses = ['present', 'present', 'present', 'late', 'half_day', 'absent'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      if (status === 'absent') {
        // Create absent record
        try {
          await Attendance.create({
            employeeId: empId,
            date,
            status: 'absent',
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          // Ignore duplicate errors
        }
      } else {
        // Create attendance with check-in/out
        const checkInHour = status === 'late' ? 10 : 9;
        const checkOutHour = status === 'half_day' ? 13 : 17;
        
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, Math.floor(Math.random() * 30), 0, 0);
        
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, Math.floor(Math.random() * 30), 0, 0);

        try {
          await Attendance.create({
            employeeId: empId,
            date,
            checkIn,
            checkOut,
            status,
            companyId,
            createdBy: userId,
          });
        } catch (err) {
          // Ignore duplicate errors
        }
      }
    }
  }

  return {
    categories: Object.keys(categoryMap).length,
    brands: Object.keys(brandMap).length,
    units: Object.keys(unitMap).length,
    warehouses: Object.keys(warehouseMap).length,
    products: Object.keys(productMap).length,
    customers: Object.keys(customerMap).length,
    suppliers: Object.keys(supplierMap).length,
    departments: Object.keys(departmentMap).length,
    employees: Object.keys(employeeMap).length,
    purchaseOrders: purchaseOrders.length,
    salesOrders: salesOrders.length,
  };
}

async function seedForAllAdmins() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all admin users (admin, super_admin, manager roles)
    const adminUsers = await User.find({
      role: { $in: ['admin', 'super_admin', 'manager'] },
      isActive: true
    }).populate('companyId');

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in the database");
      console.log("💡 Please create admin users first or register a new account");
      process.exit(1);
    }

    console.log(`📋 Found ${adminUsers.length} admin user(s)\n`);

    // Group by company to avoid duplicate seeding
    const companyMap = new Map();
    adminUsers.forEach(user => {
      if (user.companyId) {
        const companyId = user.companyId._id || user.companyId;
        if (!companyMap.has(companyId.toString())) {
          companyMap.set(companyId.toString(), {
            companyId: companyId,
            companyName: user.companyId.name || 'Unknown Company',
            userEmail: user.email,
            userId: user._id
          });
        }
      }
    });

    console.log(`🏢 Found ${companyMap.size} unique company(ies)\n`);

    // Seed data for each company
    let successCount = 0;
    let failCount = 0;

    for (const [companyIdStr, companyInfo] of companyMap.entries()) {
      console.log(`\n📦 Seeding demo data for: ${companyInfo.companyName}`);
      console.log(`   Company ID: ${companyIdStr}`);
      console.log(`   Admin User: ${companyInfo.userEmail}`);
      console.log("─".repeat(50));

      try {
        const result = await seedForCompany(companyInfo.companyId, companyInfo.userId);
        console.log(`✅ Successfully seeded:`);
        console.log(`   - Categories: ${result.categories}`);
        console.log(`   - Brands: ${result.brands}`);
        console.log(`   - Units: ${result.units}`);
        console.log(`   - Warehouses: ${result.warehouses}`);
        console.log(`   - Products: ${result.products}`);
        console.log(`   - Customers: ${result.customers}`);
        console.log(`   - Suppliers: ${result.suppliers}`);
        console.log(`   - Purchase Orders: ${result.purchaseOrders || 0}`);
        console.log(`   - Sales Orders: ${result.salesOrders || 0}`);
        console.log(`   - Departments: ${result.departments}`);
        console.log(`   - Employees: ${result.employees}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error seeding data:`, error.message);
        failCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Demo data seeding completed!");
    console.log("=".repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   - Companies processed: ${companyMap.size}`);
    console.log(`   - Successfully seeded: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);
    console.log(`   - Total admin users: ${adminUsers.length}`);
    console.log(`\n💡 Login with any admin account to see the demo data`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  seedForCompany,
  seedForAllAdmins,
};

// Run seed if called directly
if (require.main === module) {
  seedForAllAdmins();
}
