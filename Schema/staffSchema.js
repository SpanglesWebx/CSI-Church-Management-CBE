// models/staffSchema.js
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      unique: true,
    },
    isMember: {
      type: Boolean,
      required: true,
      default: true,
    },

    // 🧍 Member Staff
    member_id: { type: String, default: null },
    member_name: { type: String, default: "" },
    member_tamil_name: { type: String, default: "" },
    gender: {
  type: String,
  enum: ["Male", "Female", "Other", ""],
  default: "",
},

    phone: { type: String, default: "" },
    aadhar_number: { type: String, default: "" },
    permanent_address: { type: String, default: "" },
    present_address: { type: String, default: "" },

    // 👤 Non-Member Staff
    non_member_name: { type: String, default: "" },
    non_member_tamil_name: { type: String, default: "" },
    non_member_gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    non_member_phone: { type: String,default: "" },
    non_member_aadhar: { type: String,default: "" },
    non_member_permanent_address: { type: String, default: "" },
    non_member_present_address: { type: String, default: "" },

    // 🏢 Common Fields
designation: {
  type: String,
  default: "",
  trim: true,
},

salary: {
  type: Number,
  default: 0,
},

    // 📅 Staff Starting Date (Defaults to createdAt)
    start_date: {
      type: Date,
      default: Date.now,
    },

    // ⚙️ Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    end_date: {
      type: Date,
      default: null,
    },
    inactive_description: {
      type: String,
      default: "",
    },
    notes: { type: String, default: "" },

  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Staff", staffSchema);
