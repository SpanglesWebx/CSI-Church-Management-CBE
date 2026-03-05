const express = require("express");
const router = express.Router();
const {
  addStaff,
  getStaffs,
  deleteStaff,
  generateNewEmployeeId,
  updateStaff,
  getActiveStaffs,
  addStaffAdvance,
  getStaffAdvances,
} = require("../controllers/staffController");

router.post("/", addStaff);
router.get("/generate-id", generateNewEmployeeId);
router.get("/", getStaffs);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.get("/active", getActiveStaffs);
router.post("/advance", addStaffAdvance);
router.get("/advance/:employee_id", getStaffAdvances);

module.exports = router;
