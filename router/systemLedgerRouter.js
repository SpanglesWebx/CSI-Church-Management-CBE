const router = require("express").Router();
const {
  addSystemLedger,
  getSystemLedgers,
} = require("../controllers/systemLedgerController");

router.post("/add", addSystemLedger);
router.get("/list", getSystemLedgers);

module.exports = router;
