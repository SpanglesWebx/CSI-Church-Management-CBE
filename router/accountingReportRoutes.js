// routes/reports.js
const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/AccountingReportController");

// GET /api/reports/receipts-payments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
  "/receipt-side-summary",
  reportsController.getReceiptSideSummary
);

router.get(
  "/payment-side-summary",
  reportsController.getPaymentSideSummary
);

module.exports = router;