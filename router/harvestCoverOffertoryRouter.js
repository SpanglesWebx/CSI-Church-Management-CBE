const express = require("express");
const router = express.Router();
const controller = require("../controllers/harvestCoverOffertoryController");

// ADD
router.post("/add", controller.addOffertory);

// LIST (pagination + search + date filter)
router.get("/list", controller.listOffertory);

// VIEW SINGLE
router.get("/:id", controller.getOffertoryById);

module.exports = router;
