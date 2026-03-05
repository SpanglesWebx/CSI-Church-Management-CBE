const express = require("express");
const router = express.Router();

const {
  addCemPayment,
  getCemPayments,
} = require("../controllers/cemPaymentController");

router.post("/add", addCemPayment);
router.get("/list", getCemPayments);

module.exports = router;
