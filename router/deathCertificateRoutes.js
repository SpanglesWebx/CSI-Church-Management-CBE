const express = require("express");
const router = express.Router();
const {
  addDeath,
  getDeaths,
  getSingleDeath
} = require("../controllers/deathCertificateController");
const { downloadSingleDeathPDF } = require("../controllers/deathCertificateController");

router.post("/", addDeath);
router.get("/", getDeaths);
router.get("/download/:id", downloadSingleDeathPDF);
router.get("/:id", getSingleDeath);

module.exports = router;
