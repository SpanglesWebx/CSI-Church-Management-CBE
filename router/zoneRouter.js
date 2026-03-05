const express = require("express");
const router = express.Router();
const { addZone, getZones, addArea, getAreasByZone } = require("../controllers/zoneController");

router.post("/add", addZone);
router.get("/all", getZones);

router.post("/area/add", addArea);
router.get("/areas/:zone", getAreasByZone);

module.exports = router;
