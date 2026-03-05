const express = require("express");
const router = express.Router();
const {
  addZone,
  getZones,
} = require("../controllers/asanamZoneController");

router.post("/add", addZone);
router.get("/list", getZones);

module.exports = router;
