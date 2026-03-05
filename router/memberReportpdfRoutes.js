const router = require("express").Router();
const {
  downloadBirthdayReportPDF,
  downloadMarriageReportPDF
} = require("../controllers/memberReportPdfController");

router.get("/birthday/pdf", downloadBirthdayReportPDF);
router.get("/marriage/pdf", downloadMarriageReportPDF);

module.exports = router;
