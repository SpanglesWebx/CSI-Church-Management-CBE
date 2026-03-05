const router = require("express").Router();
const { getCreditorLedger, getCreditorList } = require("../controllers/creditorReportController");

router.get("/list", getCreditorList);
router.get("/ledger", getCreditorLedger);

module.exports = router;
