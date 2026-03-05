const express = require("express");
const router = express.Router();
const {
  searchFemaleMembersById,
  searchFemaleMembersByName,
} = require("../controllers/brideMemberController");

router.get("/search-by-id", searchFemaleMembersById);
router.get("/search-by-name", searchFemaleMembersByName);

module.exports = router;
