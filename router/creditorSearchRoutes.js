const express = require("express");
const router = express.Router();
const {
  searchCreditorsUnified,
  searchById,
  searchByName,
  searchByPhone,
} = require("../controllers/creditorSearchController");


router.get("/id", searchById);
router.get("/name", searchByName);
router.get("/phone", searchByPhone);
router.get("/unified", searchCreditorsUnified);


module.exports = router;
