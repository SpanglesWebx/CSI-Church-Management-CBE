const express = require("express");
const router = express.Router();
const canteen = require("../controllers/harvestCanteenController");

// Create teams
router.post("/create-teams", canteen.createTeams);

// Paginated list
router.get("/list", canteen.getTeams);

// Fetch group details
router.get("/details/:id", canteen.getTeamDetails);

// Add payment (duplicate date prevented)
router.post("/add-payment", canteen.addPayment);

module.exports = router;
