const router = require("express").Router();
const { realiseBankEntry, getBankReconList, getBankReconReport } = require("../controllers/bankReconController");


router.get("/list", getBankReconList);
router.get("/report", getBankReconReport);
router.put("/realise/:id", realiseBankEntry);

module.exports = router;
