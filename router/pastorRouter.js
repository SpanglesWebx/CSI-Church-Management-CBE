const express = require("express");
const router = express.Router();

const {
  getInitIds,
  addPastor,
  getPastors,
  getPastorById,
  updatePastor,
  addPastorFamilyMember,
  getNextFamilyMemberId,
  getPastorFamilyMembers,
  updatePastorFamilyMember,
  transferFamilyMember,
  getActivePastors
} = require("../controllers/pastorController");

router.get("/init", getInitIds);
router.post("/add", addPastor);
router.get("/list", getPastors);
router.get("/:id", getPastorById);
router.put("/update/:id", updatePastor);
router.get("/next-member-id/:id", getNextFamilyMemberId);

router.post("/add-family-member/:id", addPastorFamilyMember);

router.get("/family-members/:id", getPastorFamilyMembers);

router.put(
  "/update-family-member/:pastorId/:memberId",
  updatePastorFamilyMember
);

// POST transfer family member
router.post(
  "/transfer-family-member/:pastorId/:memberId?",
  transferFamilyMember
);
router.get("/active/list", getActivePastors);




module.exports = router;
