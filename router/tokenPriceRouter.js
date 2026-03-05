// routes/tokenPriceRouter.js
const express = require("express");
const  router = express.Router();
const controller = require("../controllers/tokenPriceController");

router.post("/add", controller.addPrice);
router.get("/get-by-year", controller.getPriceByYear);
router.get("/list", controller.listPrices);

module.exports = router;
