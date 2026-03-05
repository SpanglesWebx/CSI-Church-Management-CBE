const express = require("express");
const router = express.Router();

const { addChurchExpense, getChurchExpenses, updateChurchExpense, downloadPaymentsDateWise } = require("../controllers/churchExpenseController");

// Add Expense
router.post("/add", addChurchExpense);

// // Get All Expenses
router.get("/list", getChurchExpenses);

router.get("/download-datewise", downloadPaymentsDateWise);

router.put("/update/:id", updateChurchExpense);

module.exports = router;
