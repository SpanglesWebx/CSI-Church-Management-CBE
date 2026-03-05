// routes/tokenIncomeRouter.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/tokenIncomeController");

router.post("/add", controller.addIncome);
router.get("/list", controller.listIncomes);
router.get("/:id", controller.getIncomeById);
router.put("/mark-paid/:id", controller.markAsPaid);


module.exports = router;
 