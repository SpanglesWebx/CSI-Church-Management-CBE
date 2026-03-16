// router/journalRouter.js
const router = require("express").Router();
const {
  addJournal,
  getJournalList,
  getJournalById,
  updateJournalById,
  downloadJournalDatewise,
} = require("../controllers/journalController");

router.post("/add", addJournal);
router.get("/list", getJournalList);
router.get("/download-datewise", downloadJournalDatewise);
router.get("/:id", getJournalById);
router.put("/update/:id", updateJournalById);

module.exports = router;
