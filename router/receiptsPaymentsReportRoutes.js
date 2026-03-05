const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/receiptsPaymentsReportController");

// GET JSON report (used by UI)
router.get("/", reportsController.getReceiptsPaymentsReport);

// GET PDF download
router.get("/download", reportsController.downloadReceiptsPaymentsReport);

module.exports = router;