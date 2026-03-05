const mongoose = require("mongoose");

const HarvestBiriyaniTokenIncomeSchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true },
    phone: { type: String, default: "" },

    date_of_issue: { type: Date, required: true },        // renamed
    harvest_day_date: { type: Date, required: true },  
    year: { type: Number, required: true },

    num_tokens: { type: Number, required: true },
    price_per_token: { type: Number, required: true },
    amount: { type: Number, required: true },

    description: { type: String, default: "" },
    payment_status: {
      type: String,
    },
    payment_date: { type: Date, default: null },
    migrated: {
      type: Boolean,
      default: false,
    },


  },
  { timestamps: true, collection: "HarvestBiriyaniTokenIncome" }
);

module.exports = mongoose.model("HarvestBiriyaniTokenIncome", HarvestBiriyaniTokenIncomeSchema);
