// router/reportRouter.js

const express = require("express");
const router = express.Router();

const { getTrialBalance } = require("../controllers/trialBalancePdfController");

router.get("/", getTrialBalance);

module.exports = router;