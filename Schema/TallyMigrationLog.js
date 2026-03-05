const mongoose = require("mongoose");   

const TallyMigrationLogSchema = new mongoose.Schema(
  {
    migration_type: {
      type: String,
      required: true,
    },

    total_entries: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      required: true,
    },
    total_receipts: { type: Number, required: true },
    total_payments: { type: Number, required: true },
    net_amount: { type: Number, required: true },


    message: {
      type: String,
      default: "",
    },

    details: [
      {
        source: String,          // Receipt / Offering
        heading: String,         // Category / receipt_for
        count: Number,
        amount: Number,
        ids: [mongoose.Schema.Types.ObjectId],
      },
    ],

    triggered_by: {
      user_id: String,
      user_name: String,
      role: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TallyMigrationLog", TallyMigrationLogSchema);

