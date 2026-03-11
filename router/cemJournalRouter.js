const router = require("express").Router();

const {
  addCemJournal,
  getCemJournalList,
  getCemJournalById,
  updateCemJournalById,
} = require("../controllers/cemJournalController");

router.post("/add", addCemJournal);
router.get("/list", getCemJournalList);
router.get("/:id", getCemJournalById);
router.put("/update/:id", updateCemJournalById);

module.exports = router;
