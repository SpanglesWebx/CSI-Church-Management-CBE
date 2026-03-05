const express = require("express");
const router = express.Router();

const { searchLedgers } = require("../controllers/ledgerSearchController");

// ?q=keyword
router.get("/", searchLedgers);

module.exports = router;
