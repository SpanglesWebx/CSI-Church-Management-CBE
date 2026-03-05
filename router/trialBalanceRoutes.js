const express = require("express");
const router = express.Router();
const { downloadTrialBalancePDF } = require("../controllers/trialBalancePdfController");

router.get("/pdf", downloadTrialBalancePDF);

module.exports = router;
