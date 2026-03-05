const router = require("express").Router();

const {
  addCemReceipt,
  getCemReceiptList,
  getCemReceiptById,
} = require("../controllers/cemReceiptController");

router.post("/add", addCemReceipt);
router.get("/list", getCemReceiptList);
router.get("/:id", getCemReceiptById);

module.exports = router;
