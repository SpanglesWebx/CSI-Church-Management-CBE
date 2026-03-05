// router/journalRouter.js
const router = require("express").Router();
const {
  addJournal,
  getJournalList,
  getJournalById,
} = require("../controllers/journalController");

router.post("/add", addJournal);
router.get("/list", getJournalList);
router.get("/:id", getJournalById);

module.exports = router;
