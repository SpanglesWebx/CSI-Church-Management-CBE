const express = require("express");
const router = express.Router();
const controller = require("../controllers/harvestTokenIncomeController");

// ➤ Add income
router.post("/add", controller.addIncome);

// ➤ List incomes (pagination + search + date filter)
router.get("/list", controller.listIncomes);

// ➤ Get single income
router.get("/:id", controller.getIncomeById);

router.put("/mark-paid/:id", controller.markAsPaid);


module.exports = router;
