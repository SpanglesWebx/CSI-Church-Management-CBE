const express = require("express");
const router = express.Router();
const {
    addDonation,
    getDonations
} = require("../controllers/missionarySundayDonationController");

router.post("/add", addDonation);
router.get("/list", getDonations);

module.exports = router;
