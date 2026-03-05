// router/voterRouter.js
const express = require("express");
const router = express.Router();
const { getVoters } = require("../controllers/voterController");

router.get("/list", getVoters);

module.exports = router;
