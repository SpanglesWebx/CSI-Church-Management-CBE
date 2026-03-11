// createofficeuserUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Schema/adminlogSchema");  // adjust path if needed
require("dotenv").config();

// ----------------- CONFIG -----------------
const ADMIN_USERNAME = "";
const ADMIN_PASSWORD = "";
const ADMIN_EMAIL = ""; // any email, no OTP needed
// -------------------------------------------

async function createofficeuser() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("🟢 Connected to MongoDB");

    const existingAdmin = await User.findOne({
      member_id: ADMIN_USERNAME,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      console.log(existingAdmin);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = new User({
      member_id: ADMIN_USERNAME,
      member_name: "Webx Worker",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      roles: ["churchofficeworker"],
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

createofficeuser();
