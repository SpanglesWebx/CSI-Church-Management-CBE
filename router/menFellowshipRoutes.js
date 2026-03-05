const express = require("express");
const router = express.Router();
const { getMenMembers } = require("../controllers/MenFellowshipController");

// 📋 Get Male Members Only
router.get("/", getMenMembers);

module.exports = router;






// const express = require("express");
// const router = express.Router();
// const { addMenFellowshipMember, getMenFellowshipMembers } = require("../controllers/MenFellowshipController");

// router.post("/", addMenFellowshipMember);   // ➕ Add member
// router.get("/", getMenFellowshipMembers);  // 📋 List members

// module.exports = router;
