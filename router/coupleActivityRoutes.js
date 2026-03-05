const express=require("express");

const router=express.Router();

const {

createActivity,
getActivities,
markAttendance,
getAttendanceSummary,
updateActivity

}=require("../controllers/coupleActivityController");


router.post("/",createActivity);

router.get("/",getActivities);

router.put("/:id/attendance",markAttendance);

router.get("/:id/attendance-summary",getAttendanceSummary);

router.put("/:id",updateActivity);

module.exports=router;