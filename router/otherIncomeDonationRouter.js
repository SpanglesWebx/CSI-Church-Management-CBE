const express = require("express");
const router = express.Router();
const controller = require("../controllers/otherIncomeDonationController");

// Add donation
router.post("/add", controller.addDonation);

// List donations with filters & pagination
router.get("/list", controller.listDonations);

module.exports = router;
