const router = require("express").Router();
const {
  addBank,
  getBanks,
  addOpeningBalance,
  getAllActiveBanks,
  getAllBanksCombined,
} = require("../controllers/bankController");

router.post("/add", addBank);
router.get("/list", getBanks);
router.get("/dropdown", getAllActiveBanks);
router.get("/dropdown-all", getAllBanksCombined);
router.post("/opening-balance/add", addOpeningBalance);

module.exports = router;
