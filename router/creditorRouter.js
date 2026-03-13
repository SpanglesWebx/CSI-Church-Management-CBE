// router/creditorRouter.js
const router = require("express").Router();
const {
  addCreditor,
  listCreditors,
  getCreditor,
  searchCreditorForPayment,toggleCreditorStatus
} = require("../controllers/creditorController");

router.post("/add", addCreditor);
router.get("/list", listCreditors);
router.get("/search-for-payment", searchCreditorForPayment);
router.patch("/status/:id", toggleCreditorStatus);
router.get("/:id", getCreditor); 


module.exports = router;
