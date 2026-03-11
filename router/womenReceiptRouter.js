const router = require("express").Router();
const {
  addWomenReceipt,
  getWomenReceiptList,
  getWomenReceiptById,
  updateWomenReceipt,
  getWomenReceiptDownloadData
} = require("../controllers/womenReceiptController");

router.post("/add", addWomenReceipt);
router.get("/list", getWomenReceiptList);
router.get("/download-data", getWomenReceiptDownloadData);
router.get("/:id", getWomenReceiptById);
router.put("/:id", updateWomenReceipt);

module.exports = router;