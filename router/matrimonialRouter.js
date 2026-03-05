const express = require("express");
const router = express.Router();

const {
  addMatrimonial,
  listMatrimonial,
} = require("../controllers/matrimonialController");

// Add new matrimonial entry
router.post("/add", addMatrimonial);

// Get All
router.get("/list", listMatrimonial);

module.exports = router;
