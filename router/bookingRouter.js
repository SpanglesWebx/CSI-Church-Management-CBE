const express = require("express");
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  checkAvailability,
  getBookingById,
  addAdvancePayment,
  getAdvanceHistory,
  getAllBookings,
  addFineAmount,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/all", getAllBookings);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.get("/check", checkAvailability);
router.get("/:id", getBookingById);
router.post("/:id/advance", addAdvancePayment);      // ➤ Add new payment
router.get("/:id/advance-history", getAdvanceHistory);
router.post("/:id/fine", addFineAmount);

module.exports = router;
