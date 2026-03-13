
const router = require("express").Router();

const {
  addNotification,
  listNotifications,
  updateNotification,
  updateNotificationStatus,
  getMemberNotifications,
  markSeen,
  markAllSeen
} = require("../controllers/NotificationController");

router.post("/add", addNotification);

router.get("/list", listNotifications);

router.put("/status/:id", updateNotificationStatus);

router.put("/update/:id", updateNotification);

router.get("/member/:memberId", getMemberNotifications);

router.post("/seen", markSeen);


router.post("/seen-all", markAllSeen);

module.exports = router;