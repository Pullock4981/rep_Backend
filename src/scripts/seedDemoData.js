const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const config = require("../config/env");
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
const User = require("../models/User");
const Company = require("../models/Company");

// Demo data
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
      categoryName: "Electronics",
      brandName: "TechCorp",
      unitName: "Piece",
      costPrice: 800,
      sellingPrice: 1200,
      description: "High-performance laptop",
      status: "active",
    },
    {
      name: "Wireless Mouse",
      sku: "PROD-002",
      categoryName: "Electronics",
      brandName: "TechCorp",
      unitName: "Piece",
      costPrice: 15,
      sellingPrice: 25,
      description: "Ergonomic wireless mouse",
      status: "active",
    },
    {
      name: "Mechanical Keyboard",
      sku: "PROD-003",
      categoryName: "Electronics",
      brandName: "TechCorp",
      unitName: "Piece",
      costPrice: 80,
      sellingPrice: 120,
      description: "RGB mechanical keyboard",
      status: "active",
    },
    {
      name: "Cotton T-Shirt",
      sku: "PROD-004",
      categoryName: "Clothing",
      brandName: "FashionHub",
      unitName: "Piece",
      costPrice: 10,
      sellingPrice: 20,
      description: "100% cotton t-shirt",
      status: "active",
    },
    {
      name: "Jeans",
      sku: "PROD-005",
      categoryName: "Clothing",
      brandName: "FashionHub",
      unitName: "Piece",
      costPrice: 30,
      sellingPrice: 60,
      description: "Classic blue jeans",
      status: "active",
    },
    {
      name: "Coffee Beans",
      sku: "PROD-006",
      categoryName: "Food & Beverages",
      brandName: "FreshFoods",
      unitName: "Kilogram",
      costPrice: 25,
      sellingPrice: 40,
      description: "Premium coffee beans",
      status: "active",
    },
    {
      name: "Office Chair",
      sku: "PROD-007",
      categoryName: "Furniture",
      brandName: "ComfortHome",
      unitName: "Piece",
      costPrice: 150,
      sellingPrice: 250,
      description: "Ergonomic office chair",
      status: "active",
    },
    {
      name: "Programming Book",
      sku: "PROD-008",
      categoryName: "Books",
      brandName: "ReadMore",
      unitName: "Piece",
      costPrice: 20,
      sellingPrice: 35,
      description: "Learn JavaScript programming",
      status: "active",
    },
  ],
  customers: [
    {
      name: "John Smith",
      phone: "+1234567890",
      email: "john.smith@example.com",
      address: { street: "100 Customer St", city: "City", country: "Bangladesh" },
      type: "individual",
      creditLimit: 5000,
      paymentTerms: "net_30",
    },
    {
      name: "ABC Corporation",
      phone: "+1234567891",
      email: "contact@abccorp.com",
      address: { street: "200 Business Ave", city: "City", country: "Bangladesh" },
      type: "company",
      creditLimit: 20000,
      paymentTerms: "net_60",
    },
    {
      name: "Sarah Johnson",
      phone: "+1234567892",
      email: "sarah.j@example.com",
      address: { street: "300 Personal Rd", city: "City", country: "Bangladesh" },
      type: "individual",
      creditLimit: 3000,
      paymentTerms: "net_15",
    },
  ],
  suppliers: [
    {
      name: "Global Suppliers Inc",
      phone: "+1987654321",
      email: "contact@globalsuppliers.com",
      address: { street: "500 Supplier Blvd", city: "City", country: "Bangladesh" },
      type: "manufacturer",
      contactPerson: { name: "Mike Wilson" },
    },
    {
      name: "Tech Distributors",
      phone: "+1987654322",
      email: "sales@techdist.com",
      address: { street: "600 Tech Park", city: "City", country: "Bangladesh" },
      type: "distributor",
      contactPerson: { name: "Lisa Brown" },
    },
    {
      name: "Local Wholesale",
      phone: "+1987654323",
      email: "info@localwholesale.com",
      address: { street: "700 Wholesale St", city: "City", country: "Bangladesh" },
      type: "wholesaler",
      contactPerson: { name: "David Lee" },
    },
  ],
};

async function seedDemoData() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get command line arguments for companyId or email
    const args = process.argv.slice(2);
    let companyId = null;
    let userId = null;

    // Check if companyId is provided as argument
    if (args.length > 0 && args[0].startsWith('--companyId=')) {
      companyId = new mongoose.Types.ObjectId(args[0].split('=')[1]);
      const company = await Company.findById(companyId);
      if (!company) {
        console.error("❌ Company not found with provided companyId");
        process.exit(1);
      }
      // Get first admin user for this company
      userId = (await User.findOne({ companyId, role: 'admin' }))?._id;
      if (!userId) {
        console.error("❌ No admin user found for this company");
        process.exit(1);
      }
      console.log(`✅ Using existing company: ${company.name}`);
    } 
    // Check if email is provided as argument
    else if (args.length > 0 && args[0].startsWith('--email=')) {
      const email = args[0].split('=')[1];
      const user = await User.findOne({ email }).populate('companyId');
      if (!user) {
        console.error(`❌ User not found with email: ${email}`);
        process.exit(1);
      }
      companyId = user.companyId._id || user.companyId;
      userId = user._id;
      console.log(`✅ Using existing user: ${user.email} (Company: ${user.companyId.name || user.companyId})`);
    }
    // Otherwise, use first company/user or create demo
    else {
      // Try to find first company with users
      const existingUser = await User.findOne().populate('companyId');
      if (existingUser && existingUser.companyId) {
        companyId = existingUser.companyId._id || existingUser.companyId;
        userId = existingUser._id;
        console.log(`✅ Using existing company: ${existingUser.companyId.name || 'Unknown'} (User: ${existingUser.email})`);
      } else {
        // Fallback: Get or create a demo company and user
        let company = await Company.findOne({ name: "Demo Company" });
        let user = await User.findOne({ email: "demo@example.com" });

        if (!company) {
          company = await Company.create({
            name: "Demo Company",
            email: "demo@example.com",
            phone: "+1234567890",
            address: "Demo Address",
          });
          console.log("✅ Created demo company");
        }

        if (!user) {
          user = await User.create({
            name: "Demo User",
            email: "demo@example.com",
            password: "Demo@123", // Will be hashed by pre-save hook
            companyId: company._id,
            role: "admin",
          });
          console.log("✅ Created demo user");
        }

        companyId = company._id;
        userId = user._id;
      }
    }

    // Seed Categories
    console.log("\n📁 Seeding Categories...");
    const categoryMap = {};
    for (const catData of demoData.categories) {
      // First try to find by name and companyId
      let category = await Category.findOne({ name: catData.name, companyId });
      
      if (!category) {
        // If not found, try to find by name only (in case companyId is different)
        category = await Category.findOne({ name: catData.name });
        
        if (category) {
          // If found but different company, update it to current company
          category.companyId = companyId;
          category.createdBy = userId;
          await category.save();
          console.log(`  ↻ Updated: ${category.name} (moved to current company)`);
        } else {
          // If not found at all, create new
          try {
            category = await Category.create({
              ...catData,
              companyId,
              createdBy: userId,
            });
            console.log(`  ✓ Created: ${category.name}`);
          } catch (err) {
            // If create fails, try to find one more time
            category = await Category.findOne({ name: catData.name, companyId });
            if (category) {
              console.log(`  ⊙ Found: ${category.name}`);
            } else {
              console.error(`  ✗ Failed: ${catData.name}`, err.message);
              continue;
            }
          }
        }
      } else {
        console.log(`  ⊙ Exists: ${category.name}`);
      }
      
      if (category && category._id) {
        categoryMap[catData.name] = category._id;
      }
    }

    // Seed Brands
    console.log("\n🏷️ Seeding Brands...");
    const brandMap = {};
    for (const brandData of demoData.brands) {
      let brand = await Brand.findOne({ name: brandData.name, companyId });
      if (!brand) {
        brand = await Brand.create({
          ...brandData,
          companyId,
          createdBy: userId,
        });
      }
      brandMap[brandData.name] = brand._id;
      console.log(`  ✓ ${brand.name}`);
    }

    // Seed Units
    console.log("\n📏 Seeding Units...");
    const unitMap = {};
    for (const unitData of demoData.units) {
      let unit = await Unit.findOne({ name: unitData.name, companyId });
      if (!unit) {
        unit = await Unit.create({
          ...unitData,
          companyId,
          createdBy: userId,
        });
      }
      unitMap[unitData.name] = unit._id;
      console.log(`  ✓ ${unit.name}`);
    }

    // Seed Warehouses
    console.log("\n🏢 Seeding Warehouses...");
    const warehouseMap = {};
    for (const whData of demoData.warehouses) {
      let warehouse = await Warehouse.findOne({ code: whData.code, companyId });
      if (!warehouse) {
        warehouse = await Warehouse.create({
          ...whData,
          companyId,
          createdBy: userId,
        });
      }
      warehouseMap[whData.code] = warehouse._id;
      console.log(`  ✓ ${warehouse.name}`);
    }

    // Seed Products
    console.log("\n📦 Seeding Products...");
    const productMap = {};
    for (const prodData of demoData.products) {
      let product = await Product.findOne({ sku: prodData.sku, companyId });
      
      if (!product) {
        // Try to find by SKU only (might be in different company)
        product = await Product.findOne({ sku: prodData.sku });
        
        if (product) {
          // Update to current company
          product.companyId = companyId;
          product.categoryId = categoryMap[prodData.categoryName] || product.categoryId;
          product.brandId = brandMap[prodData.brandName] || product.brandId;
          product.unitId = unitMap[prodData.unitName] || product.unitId;
          product.createdBy = userId;
          await product.save();
          console.log(`  ↻ Updated: ${product.name}`);
        } else {
          // Create new product
          try {
            product = await Product.create({
              name: prodData.name,
              sku: prodData.sku,
              categoryId: categoryMap[prodData.categoryName],
              brandId: brandMap[prodData.brandName],
              unitId: unitMap[prodData.unitName],
              costPrice: prodData.costPrice,
              sellingPrice: prodData.sellingPrice,
              description: prodData.description,
              status: prodData.status,
              companyId,
              createdBy: userId,
            });
            console.log(`  ✓ Created: ${product.name}`);
          } catch (err) {
            // If create fails, try to find again
            product = await Product.findOne({ sku: prodData.sku, companyId });
            if (product) {
              console.log(`  ⊙ Found: ${product.name}`);
            } else {
              console.error(`  ✗ Failed: ${prodData.name}`, err.message);
              continue;
            }
          }
        }
      } else {
        console.log(`  ⊙ Exists: ${product.name}`);
      }
      
      if (product && product._id) {
        productMap[prodData.sku] = product._id;
      }
    }

    // Seed Customers
    console.log("\n👥 Seeding Customers...");
    const customerMap = {};
    let custCounter = 1;
    for (const custData of demoData.customers) {
      let customer = await Customer.findOne({ email: custData.email, companyId });
      if (!customer) {
        // Generate unique code
        let code;
        let exists = true;
        let attempts = 0;
        while (exists && attempts < 10) {
          code = `CUST-${String(custCounter).padStart(4, "0")}`;
          exists = await Customer.findOne({ code, companyId });
          attempts++;
          custCounter++;
        }
        customer = await Customer.create({
          ...custData,
          code,
          companyId,
          createdBy: userId,
        });
      }
      customerMap[custData.email] = customer._id;
      console.log(`  ✓ ${customer.name} (${customer.code || "No code"})`);
    }

    // Seed Suppliers
    console.log("\n🏭 Seeding Suppliers...");
    const supplierMap = {};
    let suppCounter = 1;
    for (const suppData of demoData.suppliers) {
      let supplier = await Supplier.findOne({ email: suppData.email, companyId });
      if (!supplier) {
        // Generate unique code
        let code;
        let exists = true;
        let attempts = 0;
        while (exists && attempts < 10) {
          code = `SUPP-${String(suppCounter).padStart(4, "0")}`;
          exists = await Supplier.findOne({ code, companyId });
          attempts++;
          suppCounter++;
        }
        supplier = await Supplier.create({
          ...suppData,
          code,
          companyId,
          createdBy: userId,
        });
      }
      supplierMap[suppData.email] = supplier._id;
      console.log(`  ✓ ${supplier.name} (${supplier.code || "No code"})`);
    }

    // Seed Inventory (Add stock to main warehouse)
    console.log("\n📊 Seeding Inventory...");
    const mainWarehouseId = warehouseMap["WH-001"];
    for (const [sku, productId] of Object.entries(productMap)) {
      const product = demoData.products.find((p) => p.sku === sku);
      const quantity = Math.floor(Math.random() * 100) + 20; // Random 20-120
      const cost = product.costPrice;

      let inventory = await Inventory.findOne({
        productId,
        warehouseId: mainWarehouseId,
        companyId,
      });

      if (!inventory) {
        inventory = await Inventory.create({
          productId,
          warehouseId: mainWarehouseId,
          companyId,
          availableQuantity: quantity,
          reservedQuantity: 0,
          totalQuantity: quantity,
          averageCost: cost,
          lastCost: cost,
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
      }
      console.log(`  ✓ Stock added for ${product.name}: ${quantity} units`);
    }

    // Seed Purchase Orders
    console.log("\n🛒 Seeding Purchase Orders...");
    const supplierIds = Object.values(supplierMap);
    const productIds = Object.values(productMap);
    const purchaseOrders = [];

    for (let i = 0; i < 5; i++) {
      const supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = await Product.findById(productId);
        items.push({
          productId,
          quantity: Math.floor(Math.random() * 50) + 10,
          unitCost: product.costPrice,
          receivedQuantity: 0,
        });
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0
      );

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

      // Calculate item totals
      items.forEach((item) => {
        item.total = item.quantity * item.unitCost;
      });

      const purchaseOrder = await PurchaseOrder.create({
        orderNumber: `PO-${Date.now()}-${i}`,
        supplierId,
        warehouseId: mainWarehouseId,
        companyId,
        items,
        subtotal: totalAmount,
        totalAmount,
        status: i < 3 ? "delivered" : "pending", // First 3 delivered
        date: orderDate,
        expectedDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdBy: userId,
      });

      purchaseOrders.push(purchaseOrder);
      console.log(`  ✓ Created PO: ${purchaseOrder.orderNumber}`);
    }

    // Seed Sales Orders
    console.log("\n💰 Seeding Sales Orders...");
    const customerIds = Object.values(customerMap);
    const salesOrders = [];

    for (let i = 0; i < 8; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = await Product.findById(productId);
        items.push({
          productId,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: product.sellingPrice,
        });
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

      const statuses = ["pending", "confirmed", "shipped", "delivered"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Calculate item totals for sales
      items.forEach((item) => {
        item.total = item.quantity * item.unitPrice;
      });

      const salesOrder = await SalesOrder.create({
        orderNumber: `SO-${Date.now()}-${i}`,
        customerId,
        warehouseId: mainWarehouseId,
        companyId,
        items,
        subtotal: totalAmount,
        totalAmount,
        status,
        date: orderDate,
        createdBy: userId,
      });

      salesOrders.push(salesOrder);
      console.log(`  ✓ Created SO: ${salesOrder.orderNumber} (${status})`);
    }

    console.log("\n✅ Demo data seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   - Brands: ${Object.keys(brandMap).length}`);
    console.log(`   - Units: ${Object.keys(unitMap).length}`);
    console.log(`   - Warehouses: ${Object.keys(warehouseMap).length}`);
    console.log(`   - Products: ${Object.keys(productMap).length}`);
    console.log(`   - Customers: ${Object.keys(customerMap).length}`);
    console.log(`   - Suppliers: ${Object.keys(supplierMap).length}`);
    console.log(`   - Purchase Orders: ${purchaseOrders.length}`);
    console.log(`   - Sales Orders: ${salesOrders.length}`);
    console.log(`\n🔑 Login credentials:`);
    console.log(`   Email: demo@example.com`);
    console.log(`   Password: Demo@123`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

// Run seed
seedDemoData();

