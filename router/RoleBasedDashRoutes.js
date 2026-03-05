
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



//Secretary Dashboard

router.get("/Secretary/member-count", dashCtrl.getMemberCount);
router.get("/Secretary/member-subscribed/count", memberCtrl.getSubscribedMemberCount);
router.get("/Secretary/family-count",familyCtrl.getFamilyCount);
router.get("/Secretary/general-fund/today", dashCtrl.getTodayGeneralFundStats);
router.get("/Secretary/balance-summary", dashCtrl.getBalanceSummary);


//Accountant Dashboard

router.get("/accountant/member-count", dashCtrl.getMemberCount);
router.get("/accountant/member-subscribed/count", memberCtrl.getSubscribedMemberCount);
router.get("/accountant/family-count",familyCtrl.getFamilyCount);
router.get("/accountant/general-fund/today", dashCtrl.getTodayGeneralFundStats);
router.get("/accountant/balance-summary", dashCtrl.getBalanceSummary);


module.exports = router;