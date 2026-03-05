// routes/poorHelpRouter.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/poorHelpController");

// GET with filters & pagination
router.get("/", controller.getTitles);

// Add title
router.post("/add", controller.addTitle);

// Mark title as inactive
router.put("/update-status/:id", controller.updateTitleStatus);

router.get("/search", controller.searchTitles);

module.exports = router;
