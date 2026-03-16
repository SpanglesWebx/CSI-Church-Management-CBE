
const express = require("express");
const router = express.Router();
const memberCtrl = require("../controllers/Member");
const familyCtrl = require("../controllers/Family");
const dashCtrl = require("../controllers/RoleBasedDashController");



//church Offiece Worker Dashboard

router.get("/ChurchOfficeWorker/member-count", dashCtrl.getMemberCount);
router.get("/ChurchOfficeWorker/member-subscribed/count", memberCtrl.getSubscribedMemberCount);
router.get("/ChurchOfficeWorker/family-count",familyCtrl.getFamilyCount);
router.get("/ChurchOfficeWorker/general-fund/today", dashCtrl.getTodayGeneralFundStats);
router.get("/ChurchOfficeWorker/balance-summary", dashCtrl.getBalanceSummary);
router.get("/ChurchOfficeWorker/cemetery-fund/today", dashCtrl.getTodayCemeteryFundStats);
router.get("/ChurchOfficeWorker/cemetery-balance-summary",dashCtrl.getCemeteryBalanceSummary);
router.get("/ChurchOfficeWorker/women-fund/today",dashCtrl.getTodayWomenFundStats);
router.get("/ChurchOfficeWorker/women-balance-summary",dashCtrl.getWomenBalanceSummary);


//Secretary Dashboard

router.get("/secretary/member-count", dashCtrl.getMemberCount);
router.get("/secretary/member-subscribed/count", memberCtrl.getSubscribedMemberCount);
router.get("/secretary/family-count",familyCtrl.getFamilyCount);
router.get("/secretary/general-fund/today", dashCtrl.getTodayGeneralFundStats);
router.get("/secretary/balance-summary", dashCtrl.getBalanceSummary);
router.get("/secretary/cemetery-fund/today", dashCtrl.getTodayCemeteryFundStats);
router.get("/secretary/cemetery-balance-summary", dashCtrl.getCemeteryBalanceSummary);
router.get("/secretary/women-fund/today", dashCtrl.getTodayWomenFundStats);
router.get("/secretary/women-balance-summary", dashCtrl.getWomenBalanceSummary);



//Accountant Dashboard

router.get("/accountant/member-count", dashCtrl.getMemberCount);
router.get("/accountant/member-subscribed/count", memberCtrl.getSubscribedMemberCount);
router.get("/accountant/family-count",familyCtrl.getFamilyCount);
router.get("/accountant/general-fund/today", dashCtrl.getTodayGeneralFundStats);
router.get("/accountant/balance-summary", dashCtrl.getBalanceSummary);
router.get("/accountant/cemetery-fund/today", dashCtrl.getTodayCemeteryFundStats);
router.get("/accountant/cemetery-balance-summary", dashCtrl.getCemeteryBalanceSummary);
router.get("/accountant/women-fund/today", dashCtrl.getTodayWomenFundStats);
router.get("/accountant/women-balance-summary", dashCtrl.getWomenBalanceSummary);


module.exports = router;