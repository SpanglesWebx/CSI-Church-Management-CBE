const router = require("express").Router();

const {
  addCemJournal,
  getCemJournalList,
  getCemJournalById,
} = require("../controllers/cemJournalController");

router.post("/add", addCemJournal);
router.get("/list", getCemJournalList);
router.get("/:id", getCemJournalById);

module.exports = router;
