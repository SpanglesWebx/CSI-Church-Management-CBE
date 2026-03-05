const router = require("express").Router();
const { issueKitchenAssets, getIssuedHallAssets, getIssuedAssetsByBooking, updateKitchenAssetReturn, bulkUpdateKitchenAssetReturn } = require("../controllers/kitchenAssetIssueController");

router.post("/issue", issueKitchenAssets);
router.get("/", getIssuedHallAssets);

router.get("/by-booking/:bookingId", getIssuedAssetsByBooking);
router.put("/:issueId/bulk-update", bulkUpdateKitchenAssetReturn);


module.exports = router;
