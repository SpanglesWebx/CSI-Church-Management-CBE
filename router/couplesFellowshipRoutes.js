const express = require("express");

const router = express.Router();

const {

 addCoupleMember,
 getCoupleMembers,
 searchMarriedHusbands,
 getSpouse

} = require("../controllers/couplesFellowshipController");

router.post("/", addCoupleMember);

router.get("/", getCoupleMembers);

router.get("/search-husbands", searchMarriedHusbands);

router.get("/get-spouse", getSpouse);

module.exports = router;