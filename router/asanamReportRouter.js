const express = require("express");
const router = express.Router();

const AsanamCollection = require("../Schema/AsanamCollectionDonation");
const controller = require("../controllers/asanamReportController");


router.get("/pdf/download",controller.downloadAsanamReportPDF);

router.get("/total/pdf",controller.downloadAsanamTotalPDF);

router.get("/total/:year",controller.getAsanamTotalSummary);

router.get("/:year",controller.getAsanamReport);


module.exports = router;