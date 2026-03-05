// routes/marriageRouter.js
const express = require("express");
const router = express.Router();
const { addMarriage, getMarriageList } = require("../controllers/marriageController");

router.post("/add", addMarriage);
router.get("/list", getMarriageList);

module.exports = router;
