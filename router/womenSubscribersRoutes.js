const express = require("express");
const router = express.Router();
const { getWomenSubscribers } = require("../controllers/WomenSubscribersController");

router.get("/", getWomenSubscribers);

module.exports = router;
