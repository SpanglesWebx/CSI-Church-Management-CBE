const express = require("express");
const router = express.Router();
const memberCtrl = require("../controllers/Member");
const uploadMemberPhoto = require("../middleware/uploadMemberPhoto");
const { downloadMembersPDF, downloadSingleMemberPDF } = require("../controllers/memberPdfController");
const memberPdfController = require("../controllers/memberPdfController");
// INITIAL ID GENERATION
router.get("/init", memberCtrl.getInitialIds);
router.get("/count", memberCtrl.getMemberCount);
router.get("/subscribed/count", memberCtrl.getSubscribedMemberCount);

// VALIDATE HEAD SELECTION
router.post("/validate-head", memberCtrl.validateHead);
router.get("/next-family-id", memberCtrl.getNextFamilyId);


router.post(
  "/add",
  uploadMemberPhoto.single("photo"), 
  memberCtrl.addMember
);


router.get("/download-pdf", downloadMembersPDF);
router.get("/download/:id", downloadSingleMemberPDF);


// GET MEMBERS (Pagination)
router.get("/", memberCtrl.getMembers);

router.get(
  "/age-range",
  memberPdfController.getMembersByAgeRange
);

// 🔹 KEEP SPECIAL ROUTES *BEFORE* :id
router.get(
  "/download-age-pdf",
  memberPdfController.downloadAgeRangePDF
);

// 🔹 ONLY AFTER that, keep dynamic id route
router.get("/:id", memberCtrl.getMemberById);

 


// UPDATE MEMBER
router.put(
  "/update/:id",
  uploadMemberPhoto.single("photo"),
  memberCtrl.updateMember
);

router.get("/by-member-id/:memberId", memberCtrl.getMemberByMemberId);
router.post("/validate-transfer-head", memberCtrl.validateTransferHead);
router.post("/transfer-member", memberCtrl.transferMember);

// router.get( "/new-members/download-age-pdf", memberPdfController.downloadAgeCategoryPDF);


module.exports = router;

