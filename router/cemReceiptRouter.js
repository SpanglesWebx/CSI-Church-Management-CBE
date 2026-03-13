const router = require("express").Router();

const {
  addCemReceipt,
  getCemReceiptList,
  getCemReceiptById,
  updateCemReceiptsID,
} = require("../controllers/cemReceiptController");

router.post("/add", addCemReceipt);
router.get("/list", getCemReceiptList);
router.get("/:id", getCemReceiptById);
router.put("/update/:id", updateCemReceiptsID);

module.exports = router;
