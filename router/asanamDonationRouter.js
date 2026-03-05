const express = require("express");
const router = express.Router();

const controller = require("../controllers/asanamDonationController");

router.get("/",controller.getAsanamDonations);
router.post("/add",controller.addAsanamDonation);
router.get("/pdf/download",controller.downloadAsanamDonationPDF);


module.exports = router;