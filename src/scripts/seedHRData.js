const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const config = require("../config/env");
const User = require("../models/User");
const Company = require("../models/Company");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

// Demo HR data
const demoHRData = {
  departments: [
    { name: "Human Resources", code: "HR", description: "HR and recruitment department" },
    { name: "Information Technology", code: "IT", description: "IT and software development" },
    { name: "Sales & Marketing", code: "SM", description: "Sales and marketing operations" },
    { name: "Finance & Accounting", code: "FA", description: "Finance and accounting department" },
    { name: "Operations", code: "OPS", description: "Operations and logistics" },
    { name: "Customer Support", code: "CS", description: "Customer service and support" },
  ],
  employees: [
    {
      empId: "EMP-001",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phone: "+1234567890",
      position: "HR Manager",
      designation: "Manager",
      joinDate: new Date("2023-01-15"),
      salary: 75000,
      status: "active",
    },
    {
      empId: "EMP-002",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1234567891",
      position: "Software Developer",
      designation: "Senior Developer",
      joinDate: new Date("2023-02-20"),
      salary: 85000,
      status: "active",
    },
    {
      empId: "EMP-003",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@company.com",
      phone: "+1234567892",
      position: "Sales Executive",
      designation: "Executive",
      joinDate: new Date("2023-03-10"),
      salary: 60000,
      status: "active",
    },
    {
      empId: "EMP-004",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@company.com",
      phone: "+1234567893",
      position: "Accountant",
      designation: "Senior Accountant",
      joinDate: new Date("2023-04-05"),
      salary: 65000,
      status: "active",
    },
    {
      empId: "EMP-005",
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@company.com",
      phone: "+1234567894",
      position: "Operations Manager",
      designation: "Manager",
      joinDate: new Date("2023-05-12"),
      salary: 70000,
      status: "active",
    },
    {
      empId: "EMP-006",
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@company.com",
      phone: "+1234567895",
      position: "Customer Support",
      designation: "Support Agent",
      joinDate: new Date("2023-06-18"),
      salary: 45000,
      status: "active",
    },
    {
      empId: "EMP-007",
      firstName: "Robert",
      lastName: "Taylor",
      email: "robert.taylor@company.com",
      phone: "+1234567896",
      position: "Junior Developer",
      designation: "Developer",
      joinDate: new Date("2023-07-22"),
      salary: 55000,
      status: "active",
    },
    {
      empId: "EMP-008",
      firstName: "Jennifer",
      lastName: "Martinez",
      email: "jennifer.martinez@company.com",
      phone: "+1234567897",
      position: "Marketing Specialist",
      designation: "Specialist",
      joinDate: new Date("2023-08-30"),
      salary: 58000,
      status: "active",
    },
  ],
};

async function seedHRDataForCompany(companyId, userId) {
  // Seed Departments
  const departmentMap = {};
  for (const deptData of demoHRData.departments) {
    let department = await Department.findOne({ name: deptData.name, companyId });
    if (!department) {
      // Check by code if name doesn't match
      if (deptData.code) {
        department = await Department.findOne({ code: deptData.code, companyId });
      }
      if (!department) {
        // Try to find by name only (different company)
        department = await Department.findOne({ name: deptData.name });
        if (department) {
          department.companyId = companyId;
          department.createdBy = userId;
          // Clear code if it conflicts
          if (deptData.code) {
            const codeExists = await Department.findOne({ code: deptData.code, companyId });
            if (!codeExists) {
              department.code = deptData.code;
            } else {
              department.code = undefined; // Remove code to avoid conflict
            }
          }
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
              // Try to find existing by name or code
              department = await Department.findOne({ 
                $or: [
                  { name: deptData.name, companyId },
                  { code: deptData.code, companyId }
                ]
              });
              if (!department) {
                // Create without code if code conflicts
                department = await Department.create({
                  name: deptData.name,
                  description: deptData.description,
                  companyId,
                  createdBy: userId,
                });
              }
            } else {
              throw err;
            }
          }
        }
      }
    }
    if (department && department._id) {
      departmentMap[deptData.code] = department._id;
    }
  }

  // Seed Employees
  const employeeMap = {};
  const departmentCodes = Object.keys(departmentMap);
  const departmentIds = Object.values(departmentMap);

  for (let i = 0; i < demoHRData.employees.length; i++) {
    const empData = demoHRData.employees[i];
    const deptCode = departmentCodes[i % departmentCodes.length];
    const departmentId = departmentMap[deptCode];

    let employee = await Employee.findOne({ empId: empData.empId, companyId });
    if (!employee) {
      employee = await Employee.findOne({ empId: empData.empId });
      if (employee) {
        employee.companyId = companyId;
        employee.departmentId = departmentId;
        employee.createdBy = userId;
        await employee.save();
      } else {
        try {
          employee = await Employee.create({
            ...empData,
            departmentId,
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

  // Seed Attendance (last 30 days for all employees)
  const attendanceRecords = [];
  const today = new Date();
  
  for (const [empId, employeeId] of Object.entries(employeeMap)) {
    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue; // Skip weekends
      }

      // Random attendance status
      const statuses = ["present", "present", "present", "present", "late", "absent", "on_leave"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      if (status === "present" || status === "late") {
        // Generate check-in time (8:00 AM to 10:00 AM)
        const checkInHour = status === "late" ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);

        // Generate check-out time (5:00 PM to 7:00 PM)
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);

        // Calculate working hours
        const diffMs = checkOut - checkIn;
        const workingHours = Math.max(0, (diffMs / (1000 * 60 * 60)) - 1); // Subtract 1 hour for lunch

        try {
          const attendance = await Attendance.create({
            employeeId,
            date,
            checkIn,
            checkOut,
            workingHours,
            status,
            companyId,
            createdBy: userId,
          });
          attendanceRecords.push(attendance);
        } catch (err) {
          // Skip if already exists
          if (err.code !== 11000) {
            console.error(`Error creating attendance for ${empId} on ${date.toISOString()}:`, err.message);
          }
        }
      } else if (status === "absent") {
        try {
          const attendance = await Attendance.create({
            employeeId,
            date,
            status: "absent",
            companyId,
            createdBy: userId,
          });
          attendanceRecords.push(attendance);
        } catch (err) {
          if (err.code !== 11000) {
            console.error(`Error creating attendance for ${empId} on ${date.toISOString()}:`, err.message);
          }
        }
      } else if (status === "on_leave") {
        try {
          const attendance = await Attendance.create({
            employeeId,
            date,
            status: "on_leave",
            notes: "On leave",
            companyId,
            createdBy: userId,
          });
          attendanceRecords.push(attendance);
        } catch (err) {
          if (err.code !== 11000) {
            console.error(`Error creating attendance for ${empId} on ${date.toISOString()}:`, err.message);
          }
        }
      }
    }
  }

  return {
    departments: Object.keys(departmentMap).length,
    employees: Object.keys(employeeMap).length,
    attendance: attendanceRecords.length,
  };
}

async function seedHRForAllAdmins() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all admin users
    const adminUsers = await User.find({
      role: { $in: ['admin', 'super_admin', 'manager'] },
      isActive: true
    }).populate('companyId');

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in the database");
      process.exit(1);
    }

    console.log(`📋 Found ${adminUsers.length} admin user(s)\n`);

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

    console.log(`🏢 Found ${companyMap.size} unique company(ies)\n`);

    // Seed data for each company
    let successCount = 0;
    let failCount = 0;

    for (const [companyIdStr, companyInfo] of companyMap.entries()) {
      console.log(`\n📦 Seeding HR data for: ${companyInfo.companyName}`);
      console.log(`   Company ID: ${companyIdStr}`);
      console.log("─".repeat(50));

      try {
        const result = await seedHRDataForCompany(companyInfo.companyId, companyInfo.userId);
        console.log(`✅ Successfully seeded:`);
        console.log(`   - Departments: ${result.departments}`);
        console.log(`   - Employees: ${result.employees}`);
        console.log(`   - Attendance Records: ${result.attendance}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error seeding HR data:`, error.message);
        failCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 HR data seeding completed!");
    console.log("=".repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   - Companies processed: ${companyMap.size}`);
    console.log(`   - Successfully seeded: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);

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
  seedHRDataForCompany,
  seedHRForAllAdmins,
};

// Run seed if called directly
if (require.main === module) {
  seedHRForAllAdmins();
}

