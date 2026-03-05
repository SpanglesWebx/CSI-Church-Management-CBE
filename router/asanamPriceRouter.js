const express = require("express");
const router = express.Router();
const controller = require("../controllers/asanamPriceController");

router.post("/add", controller.addPrice);
router.get("/latest", controller.getLatestPrice);
router.get("/list", controller.getAllPrices);
router.get("/years", controller.getAllYears);

module.exports = router;
