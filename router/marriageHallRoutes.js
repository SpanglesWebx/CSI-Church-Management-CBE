const express = require("express");
const router = express.Router();
const { createHall, getHalls, updateMarriageHall, updateCategoryPrices, deleteCategoryPrice, getHallDropdown } = require("../controllers/marriageHallController");


router.post("/", createHall);
router.get("/", getHalls);

router.put("/:id", updateMarriageHall);


router.put("/:id/add-prices", updateCategoryPrices);

router.delete("/:hallId/delete-category/:categoryId", deleteCategoryPrice);

router.get("/dropdown", getHallDropdown);



module.exports = router;
