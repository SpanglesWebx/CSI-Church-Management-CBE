// routes/mrgCertRouter.js
const express = require("express");
const router = express.Router();
const MrgCertController = require("../controllers/MrgCertController");
const upload = require("../middleware/mrgCertificateUpload");

router.get("/preview-code",  MrgCertController.previewMarriageCode);

// create (this will increment the counter and save)
router.post(
  "/",
  upload.fields([
    { name: "groomPhoto", maxCount: 1 },
    { name: "bridePhoto", maxCount: 1 }
  ]),
  MrgCertController.createMarriage
);
// upload.fields([
//     { name: "groomPhoto", maxCount: 1 },
//     { name: "bridePhoto", maxCount: 1 }
//   ])
// optional read
router.get("/", MrgCertController.getMarriageList);

router.get("/download/:id", MrgCertController.downloadSingleMarriagePDF);

router.get("/:id", MrgCertController.getMarriageById);

module.exports = router;



