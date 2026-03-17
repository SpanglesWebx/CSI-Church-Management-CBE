const express = require("express");
const router = express.Router();

const {
  addOccupation,
  getOccupations
} = require("../controllers/occupationController");

router.post("/add", addOccupation);
router.get("/all", getOccupations);

module.exports = router;