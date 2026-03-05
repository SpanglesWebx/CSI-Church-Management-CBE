const express = require("express");
const router = express.Router();
const {
  addMarriagePrice,
  getAllMarriagePrices,
  getLatestMarriagePrice,
  getActiveMarriagePrice,
  toggleMarriagePrice,
} = require("../controllers/marriagePriceController");

// Add Marriage Price
router.post("/add", addMarriagePrice);

// List All Marriage Prices
router.get("/list", getAllMarriagePrices);

// Get Latest Marriage Price
router.get("/latest", getLatestMarriagePrice);
router.get("/active", getActiveMarriagePrice);
router.patch("/toggle/:id", toggleMarriagePrice);

module.exports = router;
