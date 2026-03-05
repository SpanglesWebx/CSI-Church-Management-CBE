// CreateAdminUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Schema/adminlogSchema");  // adjust path if needed
require("dotenv").config();

// ----------------- CONFIG -----------------
const ADMIN_USERNAME = "WebXAdmin";
const ADMIN_PASSWORD = "Spangles2016";
const ADMIN_EMAIL = "webxspangles@gmail.com"; // any email, no OTP needed
// -------------------------------------------

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🟢 Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      member_id: ADMIN_USERNAME,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      console.log(existingAdmin);
      return process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create Admin User
    const adminUser = new User({
      member_id: ADMIN_USERNAME,
      member_name: "Super Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      roles: ["admin", "churchofficeworker"],
      isPreCreated: false,
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("Username:", ADMIN_USERNAME);
    console.log("Password:", ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
