const express = require("express");
const router = express.Router();

const {
  addWomenPayment,
  getWomenPayments,
  updateWomenPayment,
  downloadWomenPaymentsDateWise,
} = require("../controllers/womenPaymentController");

// Add Payment
router.post("/add", addWomenPayment);

// Get All Payments
router.get("/list", getWomenPayments);

// Download Datewise
router.get("/download-datewise", downloadWomenPaymentsDateWise);

// Update
router.put("/update/:id", updateWomenPayment);

module.exports = router;