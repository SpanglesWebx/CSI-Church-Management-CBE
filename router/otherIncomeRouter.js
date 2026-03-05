const express = require("express");
const router = express.Router();
const controller = require("../controllers/otherIncomeController");

// GET with filters & pagination
router.get("/", controller.getTitles);

// Add new title
router.post("/add", controller.addTitle);

// Mark as inactive
router.put("/update-status/:id", controller.updateTitleStatus);

// Search (only active)
router.get("/search", controller.searchTitles);

module.exports = router;
