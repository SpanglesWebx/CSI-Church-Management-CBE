const mongoose = require("mongoose");

const asanamCollectionSchema = new mongoose.Schema(
  {
    receipt_no: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    member_id: {
      type: String,
      required: true,
    },

    member_name: {
      type: String,
      required: true,
    },

    member_phone: {
      type: String,
    },

member_title: {
  type: String,
  default: "",
},

member_tamil_name: {
  type: String,
  default: "",
},

member_tamil_title: {
  type: String,
  default: "",
},

    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AsanamZone",
      default: null,
    },
    zone_name: {
      type: String,
      default: "",
    },

    // Goat Details
    goat_price: { type: Number, default: 0 },
    goat_count: { type: String, default: "" }, 
    goat_total: { type: Number, default: 0 },

    // Rice Details
    rice_price: { type: Number, default: 0 },
    rice_count: { type: String, default: "" },
    rice_total: { type: Number, default: 0 },

    asanam_amount: {
      type: Number,
      default: 0,
    },

    // Payment
    payment_method: {
      type: String,
      enum: ["Cash", "Cheque", "UPI"],
      required: true,
    },

    cheque_number: {
      type: String,
      default: "",
    },

    // Grand Total
    amount: {
      type: Number,
      required: true,
    },

cheque_date: {
  type: Date,
  default: null,
},

upi_id: {
  type: String,
  default: "",
},

    description: {
      type: String,
      default: "",
    },
    migrated: {
      type: Boolean,
      default: false,
    },

  },

  { timestamps: true }
);

module.exports = mongoose.model("AsanamCollection", asanamCollectionSchema);
