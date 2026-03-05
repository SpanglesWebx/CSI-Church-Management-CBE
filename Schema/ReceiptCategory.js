const mongoose = require("mongoose"); 

const ReceiptCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    subcategories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReceiptCategory", ReceiptCategorySchema);
