const express = require("express");
const router = express.Router();

const {
  searchExpenseFor,
} = require("../controllers/expenseCategorySearchController");

// 🔍 Search expense subcategories
// GET /api/expense-search?q=keyword
router.get("/", searchExpenseFor);

module.exports = router;
