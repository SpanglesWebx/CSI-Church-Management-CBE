const express = require("express");
const router = express.Router();

const {
  addCemOpeningBalance,
  getCemOpeningBalances,
} = require("../controllers/cemOpeningBalanceController");

router.post("/add", addCemOpeningBalance);
router.get("/list", getCemOpeningBalances);

module.exports = router;
