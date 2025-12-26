const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const config = require("../config/env");
const User = require("../models/User");
const Company = require("../models/Company");

async function seedAllData() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    console.log("🚀 Starting comprehensive data seeding for all routes...\n");
    console.log("=".repeat(60));

    // Find all admin users
    const adminUsers = await User.find({
      role: { $in: ['admin', 'super_admin', 'manager'] },
      isActive: true
    }).populate('companyId');

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in the database");
      process.exit(1);
    }

    // Group by company
    const companyMap = new Map();
    adminUsers.forEach(user => {
      if (user.companyId) {
        const companyId = user.companyId._id || user.companyId;
        if (!companyMap.has(companyId.toString())) {
          companyMap.set(companyId.toString(), {
            companyId: companyId,
            companyName: user.companyId.name || 'Unknown Company',
            userId: user._id
          });
        }
      }
    });

    console.log(`📋 Found ${adminUsers.length} admin user(s) in ${companyMap.size} company(ies)\n`);

    // Import seed functions
    const { seedForCompany } = require("./seedForAllAdmins");
    const { seedHRDataForCompany } = require("./seedHRData");

    // Seed data for each company
    let successCount = 0;
    let failCount = 0;

    for (const [companyIdStr, companyInfo] of companyMap.entries()) {
      console.log(`\n📦 Seeding all data for: ${companyInfo.companyName}`);
      console.log(`   Company ID: ${companyIdStr}`);
      console.log("─".repeat(50));

      try {
        // Step 1: Seed main demo data
        console.log("   📦 Seeding main demo data...");
        const mainResult = await seedForCompany(companyInfo.companyId, companyInfo.userId);
        
        // Step 2: Seed HR data
        console.log("   👥 Seeding HR data...");
        const hrResult = await seedHRDataForCompany(companyInfo.companyId, companyInfo.userId);

        console.log(`✅ Successfully seeded:`);
        console.log(`   Main Data:`);
        console.log(`     - Categories: ${mainResult.categories}`);
        console.log(`     - Brands: ${mainResult.brands}`);
        console.log(`     - Units: ${mainResult.units}`);
        console.log(`     - Warehouses: ${mainResult.warehouses}`);
        console.log(`     - Products: ${mainResult.products}`);
        console.log(`     - Customers: ${mainResult.customers}`);
        console.log(`     - Suppliers: ${mainResult.suppliers}`);
        console.log(`     - Purchase Orders: ${mainResult.purchaseOrders || 0}`);
        console.log(`     - Sales Orders: ${mainResult.salesOrders || 0}`);
        console.log(`   HR Data:`);
        console.log(`     - Departments: ${hrResult.departments}`);
        console.log(`     - Employees: ${hrResult.employees}`);
        console.log(`     - Attendance Records: ${hrResult.attendance}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error seeding data:`, error.message);
        failCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 All data seeding completed!");
    console.log("=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   - Companies processed: ${companyMap.size}`);
    console.log(`   - Successfully seeded: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);
    console.log(`\n💡 Login with any admin account to see all the demo data`);
    console.log(`   - Products, Inventory, Sales, Purchase`);
    console.log(`   - Customers, Suppliers`);
    console.log(`   - HR Management (Employees, Departments, Attendance)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seed
seedAllData();
