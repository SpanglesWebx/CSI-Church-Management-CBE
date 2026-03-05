const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/baptismController");

router.get("/next-id", ctrl.getNextBaptismId);
router.post("/", ctrl.addBaptism);
router.get("/", ctrl.getBaptisms);
router.get("/download/:id", ctrl.downloadSingleBaptismPDF);
router.get("/:id", ctrl.getSingleBaptism);

module.exports = router;
