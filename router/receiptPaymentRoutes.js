const express = require("express");
const router = express.Router();
const { downloadReceiptPaymentPDF } = require("../controllers/receiptAndPaymentPdfController");

router.get("/pdf", downloadReceiptPaymentPDF);

module.exports = router;