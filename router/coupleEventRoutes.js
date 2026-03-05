const express = require("express");
const router = express.Router();
const coupleEventController = require("../controllers/coupleEventController");

/* EVENT */
router.post("/event/add", coupleEventController.addCoupleEvent);
router.get("/event/all", coupleEventController.getAllCoupleEvents);

/* EVENT BY */
router.post("/eventBy/save", coupleEventController.saveCoupleEventBy);
router.get("/eventBy/all", async (req, res) => {
  const { CoupleEventBy } = require("../Schema/coupleEventSchema");
  const eventBys = await CoupleEventBy.find();
  res.json({ eventBys });
});

/* =========================
   PRIZES
========================= */


router.get("/prizes/list", coupleEventController.getCouplePrizes);
router.post("/prizes/save", coupleEventController.saveCouplePrizes);
router.put("/prizes/update", coupleEventController.updateCouplePrizes);


router.put("/event/update/:eventId", coupleEventController.updateCoupleEvent);
router.get("/event/:eventId", coupleEventController.getSingleCoupleEvent);


router.get("/participants/list", coupleEventController.getCoupleParticipantsList);
router.post("/participants/add", coupleEventController.addCoupleParticipants);

router.put("/participants/update", coupleEventController.updateCoupleParticipants);

module.exports = router;