const express = require("express");
const router = express.Router();
const {
  addBannsPrice,
  getAllBannsPrices,
  getLatestBannsPrice,
  getActiveBannsPrice,
  toggleBannsPrice,
} = require("../controllers/bannsPriceController");

// Add Banns Price
router.post("/add", addBannsPrice);

// List All Banns Prices
router.get("/list", getAllBannsPrices);

// Get Latest Banns Price
router.get("/latest", getLatestBannsPrice);
router.get("/active", getActiveBannsPrice);
router.patch("/toggle/:id", toggleBannsPrice);


module.exports = router;
