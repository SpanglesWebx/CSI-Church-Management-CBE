const express = require("express");
const router = express.Router();
const { 
  searchDeathMembersById, 
  searchDeathMembersByName 
} = require("../controllers/deathCertSearchController");

router.get("/id", searchDeathMembersById);
router.get("/name", searchDeathMembersByName);

module.exports = router;
