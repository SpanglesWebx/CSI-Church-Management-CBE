const express = require("express");
const router = express.Router();
const {
  searchMaleMembersByName,
  searchMaleMembersById,
} = require("../controllers/groomMemberController");

router.get("/search-by-name", searchMaleMembersByName);
router.get("/search-by-id", searchMaleMembersById);

module.exports = router;
