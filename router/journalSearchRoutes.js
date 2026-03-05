// routes/combinedSearchRouter.js
const express = require("express");
const router = express.Router();

const { searchReceiptAndExpense } = require("../controllers/journalSearchController");

// GET /api/search?q=keyword
router.get("/", searchReceiptAndExpense);

module.exports = router;
