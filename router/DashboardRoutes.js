// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardController");

router.get("/offerings", controller.getOfferingsByMember);
router.get("/member-name", controller.getMemberName);
router.get("/family-head", controller.getFamilyIfHead);
router.get("/family-member", controller.getFamilyByMember);
router.get("/subscriptions", controller.getSubscriptionsByMember);
router.get("/subscriptions/view", controller.getSingleSubscriptionView);
router.get("/profile", controller.getProfile);
router.get("/daily-verse", controller.getDailyVerse);
router.get("/member", controller.getMemberProfileFull);
router.get("/upcoming", controller.getUpcomingDashboardItems);
router.get("/notifications", controller.getNotifications);

module.exports = router;
