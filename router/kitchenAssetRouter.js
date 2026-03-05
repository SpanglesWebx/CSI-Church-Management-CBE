const router = require("express").Router();
const {
  addKitchenAsset,
  updateKitchenMovement,
  getKitchenAssets,
  getAllKitchenAssetsForIssue,
  updateKitchenAssetReturn,
  getIssuedAssetsByBooking
} = require("../controllers/kitchenAssetController");

router.post("/", addKitchenAsset);
router.put("/:id", updateKitchenMovement);
router.get("/", getKitchenAssets);
router.get("/all", getAllKitchenAssetsForIssue);




module.exports = router;
