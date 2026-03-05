const router = require("express").Router();

const {
  addCemBank,
  getCemBanks,
  addCemOpeningBalance,
  getAllActiveCemBanks,
} = require("../controllers/cemBankController");

router.post("/add", addCemBank);
router.get("/list", getCemBanks);
router.get("/dropdown", getAllActiveCemBanks);
router.post("/opening-balance/add", addCemOpeningBalance);

module.exports = router;
