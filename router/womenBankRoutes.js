const router = require("express").Router();
const {
  addWomenBank,
  getWomenBanks,
  addWomenOpeningBalance,
  getAllActiveWomenBanks,
  getAllWomenBanksCombined,
} = require("../controllers/womenBankController");

router.post("/add", addWomenBank);
router.get("/list", getWomenBanks);
router.get("/dropdown", getAllActiveWomenBanks);
router.get("/dropdown-all", getAllWomenBanksCombined);
router.post("/opening-balance/add", addWomenOpeningBalance);

module.exports = router;