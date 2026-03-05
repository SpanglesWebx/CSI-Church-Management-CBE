const express = require("express");
const router = express.Router();

const {
  addMatrimonialFees,
  getAllMatrimonialFees,
  getActiveMatrimonialFees,
  toggleMatrimonialFees
} = require("../controllers/matrimonialFeesController");

router.post("/add", addMatrimonialFees);
router.get("/list", getAllMatrimonialFees);
router.get("/active", getActiveMatrimonialFees);
router.patch("/toggle/:id", toggleMatrimonialFees);

module.exports = router;
