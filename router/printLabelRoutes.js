const express = require("express");
const router = express.Router();
const {
  getMembersForLabel,
  getPrintCount,
} = require("../controllers/printLabelController");

// GET MEMBER LIST
router.get("/members", getMembersForLabel);

// GET COUNT BETWEEN DATES
router.get("/count", getPrintCount);

module.exports = router;