
const express = require("express");
const router = express.Router();
const { getWomenMembers } = require("../controllers/WomenFellowshipController");

// 📋 Get Female Members Only
router.get("/", getWomenMembers);

module.exports = router;











// const express = require("express");
// const router = express.Router();
// const {
//   addWomenFellowshipMember,
//   getWomenFellowshipMembers,
// } = require("../controllers/WomenFellowshipController");

// // ➕ Add Women’s Fellowship member
// router.post("/", addWomenFellowshipMember);

// // 📋 Get Women’s Fellowship members
// router.get("/", getWomenFellowshipMembers);

// router.get("/", getWomenMembers);

// module.exports = router;
