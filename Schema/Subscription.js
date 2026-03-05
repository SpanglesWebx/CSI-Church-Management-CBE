const mongoose = require("mongoose");  

const MonthlyContributionSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // actual entry date
  payment_method: { type: String, enum: ["Cash", "Cheque"], default: "Cash" },
  cheque_number: { type: String, default: "" },
  cheque_date: { type: Date },       // ⭐ NEW
  bank_name: { type: String }, 
  monthlySubscriptionOffering: { type: Number, default: 0 },
  buildingFund: { type: Number, default: 0 },
  missionarySponsorship: { type: Number, default: 0 },
  decimalPart: { type: Number, default: 0 },
  ims: { type: Number, default: 0 },
  fmpb: { type: Number, default: 0 },
  nms: { type: Number, default: 0 },
  iem: { type: Number, default: 0 },
  vishwavani: { type: Number, default: 0 },
  bym: { type: Number, default: 0 },
  dbm: { type: Number, default: 0 },
  cgmm: { type: Number, default: 0 },
  cmm: { type: Number, default: 0 },
  ymm: { type: Number, default: 0 },
  bibleSociety: { type: Number, default: 0 },
  womensMinistry: { type: Number, default: 0 },
  educationalAssistance: { type: Number, default: 0 },
  helpThePoor: { type: Number, default: 0 },
  medicalAssistance: { type: Number, default: 0 },
  harvestAuction: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  migrated: { type: Boolean, default: false }
}, { _id: false }); 

const SubscriptionReceiptSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },

    payment_session: {
      type: String,
      enum: ["Morning", "Evening", "Office Payment"],
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["Cash", "Cheque"],
      required: true,
    },

    amount: { type: Number, required: true },
  },
  { _id: false }
);

const MonthContainerSchema = new mongoose.Schema(
  {
    allocations: {
      type: [MonthlyContributionSchema],
      default: [],
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);


const SubscriptionSchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true },
    year: { type: Number, required: true }, // financial year start (e.g. 2025 = Apr 2025–Mar 2026)

    total_received: { type: Number, default: 0 },
    remaining_amount: { type: Number, default: 0 },

    receipts: [SubscriptionReceiptSchema],

    // Months Apr → Mar
     april: MonthContainerSchema,
    may: MonthContainerSchema,
    june: MonthContainerSchema,
    july: MonthContainerSchema,
    august: MonthContainerSchema,
    september: MonthContainerSchema,
    october: MonthContainerSchema,
    november: MonthContainerSchema,
    december: MonthContainerSchema,
    january: MonthContainerSchema,
    february: MonthContainerSchema,
    march: MonthContainerSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
