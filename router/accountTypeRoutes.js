const router = require("express").Router();
const {
  addAccountType,
  listAccountTypes,
} = require("../controllers/accountTypeController");

router.post("/add", addAccountType);
router.get("/list", listAccountTypes);

module.exports = router;
