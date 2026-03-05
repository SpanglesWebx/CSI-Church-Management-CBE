const express = require("express");
const router = express.Router();
const {
  addHarvest,
  getHarvestList,
  getSingleHarvest,
} = require("../controllers/harvestCollectionController");

// ADD
router.post("/add", addHarvest);

// LIST WITH PAGINATION
router.get("/list", getHarvestList);

// SINGLE
router.get("/:id", getSingleHarvest);

module.exports = router;
