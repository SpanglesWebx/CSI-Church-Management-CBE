const express = require("express");
const router = express.Router();

const {
  addCemPayment,
  getCemPayments,
  viewPaymentById,
  updateCemPaymentById,
} = require("../controllers/cemPaymentController");

router.post("/add", addCemPayment);
router.get("/list", getCemPayments);
router.get("/view/:id", viewPaymentById);
router.put("/update/:id", updateCemPaymentById);

module.exports = router;
