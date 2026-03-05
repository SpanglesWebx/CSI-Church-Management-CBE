const express = require("express");
const router = express.Router();
const choirController = require("../controllers/choirController");

// Add a new choir member
router.post("/add", choirController.addChoirMember);

// Get all choir members (optional pagination)
router.get("/", choirController.getChoirMembers);


//Event
router.get("/all", choirController.getAllEvents);
router.post("/prizes/save", choirController.savePrizes);
router.get("/prizes/list", choirController.getPrizes);

router.post("/event/add",choirController.addEvent);
router.get("/event/:id", choirController.getEventById);
router.put("/event/update/:id", choirController.updateEvent);

router.get("/eventBy/all",choirController.getEventBy);

router.post("/eventBy/save",choirController.saveEventBy);



router.get(
  "/participants/list",
  choirController.getParticipantsList
);

router.post(
  "/participants/add",
  choirController.addParticipants
);

router.put(
  "/participants/update",
  choirController.updateParticipants
);


router.put("/prizes/update", choirController.updatePrizes);



module.exports = router;
