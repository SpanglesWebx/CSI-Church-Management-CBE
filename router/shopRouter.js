const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");

router.post("/add", shopController.addShop);
router.get("/list", shopController.getShops);
router.put("/availability/:id", shopController.updateAvailability);
router.get("/by-name", shopController.searchShopByName);

module.exports = router;
