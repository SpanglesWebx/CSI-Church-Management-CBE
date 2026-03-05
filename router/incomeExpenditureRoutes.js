const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/incomeExpenditureController");

// GET JSON report
router.get("/", reportsController.getIncomeExpenditureReport);

// GET download data
router.get("/download", reportsController.downloadIncomeExpenditureReport);

module.exports = router;