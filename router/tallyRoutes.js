const express = require("express");
const router = express.Router();

const {
  migrateReceiptsToTally,
  getTallyMigrationHistory,
  getTallyMigrationHistoryById
} = require("../controllers/tallyController");

// 🔹 Migrate receipts to Tally (button click)
router.post("/migrate/receipts", migrateReceiptsToTally);

// 🔹 Get migration history (table data)
router.get("/migration-history", getTallyMigrationHistory);

// 🔹 View transactions under a heading
router.get("/migration-history/:id", getTallyMigrationHistoryById);

module.exports = router;
