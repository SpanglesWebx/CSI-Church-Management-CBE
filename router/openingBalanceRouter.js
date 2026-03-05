const express = require("express");
const router = express.Router();
const {
  addOpeningBalance,
  getOpeningBalances,
} = require("../controllers/openingBalanceController");

router.post("/add", addOpeningBalance);
router.get("/list", getOpeningBalances);

module.exports = router;
