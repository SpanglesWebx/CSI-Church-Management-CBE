const express = require("express");
const router = express.Router();
const controller = require("../controllers/asanamCollectionController");

router.post("/add", controller.addCollection);

// IMPORTANT: list BEFORE :id
router.get("/list", controller.listCollections);

router.get("/:id", controller.getSingleCollection);




module.exports = router;
 