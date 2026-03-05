const express = require("express");
const router = express.Router();
const { downloadBalanceSheetPDF } = require("../controllers/balanceSheetPdfController");

router.get("/pdf", downloadBalanceSheetPDF);

module.exports = router;
