// routes/carolRoutes.js
const express = require("express");
const router = express.Router();
const carol = require("../controllers/carolController");

// Create teams
router.post("/create-teams", carol.createTeams);

// Paginated list
router.get("/list", carol.getTeams);

// Fetch group details
router.get("/details/:id", carol.getTeamDetails);

// Add payment (duplicate date prevented)
router.post("/add-payment", carol.addPayment);

module.exports = router;
