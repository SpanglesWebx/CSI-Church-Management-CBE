const express = require("express");
const router = express.Router();

const { searchReceiptFor } = require("../controllers/receiptSearchController");

// ?q=keyword
router.get("/", searchReceiptFor);

module.exports = router;
