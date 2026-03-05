const express = require("express");
const router = express.Router();
const { downloadDepreciationPDF } = require("../controllers/depreciationPdfController");
const { getDepreciationReport } = require("../controllers/depreciationController");


router.get("/pdf", downloadDepreciationPDF);
router.get("/", getDepreciationReport);

module.exports = router;


