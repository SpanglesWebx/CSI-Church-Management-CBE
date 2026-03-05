const express = require("express");
const router = express.Router();
const { getIndianTime } = require("../controllers/timeController");

router.get("/ist", getIndianTime);

module.exports = router;
