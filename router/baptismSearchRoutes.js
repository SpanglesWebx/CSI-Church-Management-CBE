const express = require("express");
const router = express.Router();
const { searchBaptismMembersById, searchBaptismMembersByName } = require("../controllers/baptismSearchController");

router.get("/id", searchBaptismMembersById);
router.get("/name", searchBaptismMembersByName);

module.exports = router;
