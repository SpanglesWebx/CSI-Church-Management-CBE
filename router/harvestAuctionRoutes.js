const express = require("express");
const router = express.Router();
const {
  addHarvestAuction,
  getHarvestAuctions,
  updateHarvestAuction,
  getHarvestAuctionReportByBuyer,
  addHarvestAuctionPayment,
  addHarvestAuctionPaymentForBuyer,
  getHarvestAuctionReportByMember,
  searchItemByCode,
  searchItemByName,
  searchHarvestBuyerById,
  searchHarvestBuyerByName,
  searchHarvestBuyerByPhone, 
} = require("../controllers/HarvestAuctionController");

// ➤ Routes
router.post("/", addHarvestAuction);
router.get("/", getHarvestAuctions);
router.get("/search/by-code", searchItemByCode);
router.get("/search/by-name", searchItemByName);
router.put("/:id", updateHarvestAuction);

// Report & Payment
router.get("/report/by-buyer", getHarvestAuctionReportByBuyer);
router.get("/search/buyer-id", searchHarvestBuyerById);
router.get("/search/buyer-name", searchHarvestBuyerByName);
router.get("/search/buyer-phone", searchHarvestBuyerByPhone);
router.post("/payment", addHarvestAuctionPayment);
router.post("/payment/by-buyer", addHarvestAuctionPaymentForBuyer);
router.get("/report", getHarvestAuctionReportByMember);

module.exports = router;
 