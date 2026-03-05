const express = require("express");
const router = express.Router();
const controller = require("../controllers/harvestTokenPriceController");

// ➤ Add token price
router.post("/add", controller.addPrice);

// ➤ Get price by year
router.get("/get-by-year", controller.getPriceByYear);

// ➤ List all prices
router.get("/list", controller.listPrices);

module.exports = router;
