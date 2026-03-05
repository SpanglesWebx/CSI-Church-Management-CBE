// routes/houseVisitRouter.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/houseVisitController');

// optional: attach auth middleware if you have one
// const auth = require('../middleware/auth');

// router.use(auth); // if you want to protect all routes

router.post('/add', controller.addHouseVisit);
router.get('/list', controller.listHouseVisits);
router.get('/:id', controller.getHouseVisitById);

module.exports = router;
