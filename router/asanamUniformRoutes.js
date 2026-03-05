// routes/asanamUniformRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/asanamUniformController");

// optional: attach auth middleware if you have one
// router.use(authMiddleware);

router.post("/items/add", ctrl.addItemSet);
router.get("/items", ctrl.getItems);

router.post("/sales/add", ctrl.addSale);
router.get("/sales", ctrl.getSales);

router.get("/items-search", ctrl.searchItems);

router.get("/item-sets", ctrl.getItemSets);

router.get("/item-years", ctrl.getItemYears);



module.exports = router;
