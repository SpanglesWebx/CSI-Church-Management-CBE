const express = require("express");
const router = express.Router();
const {
  addWomenOpeningBalance,
  getWomenOpeningBalances,
} = require("../controllers/womenOpeningBalanceController");

router.post("/add", addWomenOpeningBalance);
router.get("/list", getWomenOpeningBalances);

module.exports = router;