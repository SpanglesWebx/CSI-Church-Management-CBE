const express = require("express");
const router = express.Router();
const { getMenSubscribers } = require("../controllers/MenSubscribersController");

router.get("/", getMenSubscribers);

module.exports = router;
