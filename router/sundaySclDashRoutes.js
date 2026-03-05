const express = require("express");
const router = express.Router();

const {
  getSundaySchoolDashboard,
  getTeacherDashboard,
} = require("../controllers/sundaySclDashController");

router.get("/", getSundaySchoolDashboard);
router.get("/teacher/:teacherId", getTeacherDashboard);

module.exports = router;