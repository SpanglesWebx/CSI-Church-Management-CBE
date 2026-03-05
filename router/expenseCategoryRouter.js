const express = require("express");
const router = express.Router();

const {
  getCategories,
  addCategory,
  deleteCategory,
  getSubcategories,
  saveSubcategories,
} = require("../controllers/expenseCategoryController");

// CATEGORY ROUTES
router.get("/categories", getCategories);
router.post("/categories/add", addCategory);
router.delete("/categories/:id", deleteCategory);

// SUBCATEGORY ROUTES
router.get("/subcategories/:categoryId", getSubcategories);
router.post("/subcategories/:categoryId/save", saveSubcategories);

module.exports = router;
