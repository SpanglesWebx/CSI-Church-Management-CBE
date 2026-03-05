const express = require("express");
const {
  createCategory,
  addItemToCategory,
  getAssetCategories
} = require("../controllers/marriageHallAssetController");
const { saveHallAsset, getHallAssets, getSingleHallAsset, updateHallAssets, issueAssets, getHallIssueHistory, returnAssets, getIssuedByBooking } = require("../controllers/mrghallAssetRegisterController");

const router = express.Router();

router.post("/category", createCategory);
router.post("/category/:categoryId/item", addItemToCategory);
router.get("/category", getAssetCategories);
router.post("/register", saveHallAsset);
router.get("/register", getHallAssets);
router.get("/register/:id", getSingleHallAsset);
router.put("/register/:id", updateHallAssets);
router.post("/issue", issueAssets);
router.get("/issue-history/:hallId", getHallIssueHistory);
router.get("/issued/by-booking/:bookingId", getIssuedByBooking);
router.post("/return", returnAssets);
// router.get("/returns/:hallId", getReturnsByHall);



module.exports = router;
