const router = require("express").Router();
const {
  addReceipt,
  getReceiptList,
  getReceiptById,
  splitSundayReceipt,
  updateReceipt,
  downloadReceiptReport,
  getReceiptDownloadData
} = require("../controllers/receiptController");

router.post("/add", addReceipt);
router.get("/list", getReceiptList);
router.get("/download-data", getReceiptDownloadData);
router.get("/:id", getReceiptById);
router.put("/:id/split-sunday", splitSundayReceipt);
router.put("/:id", updateReceipt);

module.exports = router;
