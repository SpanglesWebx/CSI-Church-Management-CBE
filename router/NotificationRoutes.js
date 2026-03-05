const router = require("express").Router();

const {
  addNotification,
  listNotifications,
  updateNotificationStatus
} = require("../controllers/NotificationController");

router.post("/add", addNotification);

router.get("/list", listNotifications);

router.put("/status/:id", updateNotificationStatus);

module.exports = router;