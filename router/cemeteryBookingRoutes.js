const express = require("express");
const router = express.Router();
const cemeteryBookingController = require("../controllers/cemeteryBookingController");

// POST /api/cemetery-bookings/book
router.post("/book", cemeteryBookingController.bookSlot);

router.get("/reserved", cemeteryBookingController.getReservedSlots);
router.get("/allreserved", cemeteryBookingController.getAllReservedSlots);

router.put("/update-status/:id", cemeteryBookingController.updateSlotStatus);

router.put("/close-slot", cemeteryBookingController.closeSlot);

module.exports = router;
