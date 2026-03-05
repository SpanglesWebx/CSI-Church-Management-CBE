const express = require("express");
const router = express.Router();
const controller = require("../controllers/asanamSearchController");

router.get("/id", controller.searchById);
router.get("/name", controller.searchByName);
router.get("/phone", controller.searchByPhone);

module.exports = router;