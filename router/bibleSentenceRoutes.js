const express = require("express");
const router = express.Router();
const {
  createSentence,
  getSentences,
} = require("../controllers/bibleSentenceController");

router.post("/", createSentence);
router.get("/", getSentences);

module.exports = router;