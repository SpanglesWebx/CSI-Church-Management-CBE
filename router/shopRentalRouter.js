const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/shopRentalController");

router.get("/new-id", rentalController.getNewLesseId);


router.post("/add", rentalController.addRental);
router.get("/list", rentalController.getRentals);
router.get("/get/:id", rentalController.getRentalById);
router.get("/:id/payments", rentalController.getPayments);
router.post("/:id/payments", rentalController.addPayment);
router.put("/update-status/:id", rentalController.updateRentalStatus);


module.exports = router;
