const router = require("express").Router();

const {
  addWomenJournal,
  getWomenJournalList,
  getWomenJournalById,
  updateWomenJournalById,
} = require("../controllers/womenJournalController");

router.post("/add", addWomenJournal);
router.get("/list", getWomenJournalList);
router.get("/:id", getWomenJournalById);
router.put("/update/:id", updateWomenJournalById);

module.exports = router;