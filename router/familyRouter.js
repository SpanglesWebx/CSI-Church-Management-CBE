const express = require("express");
const router = express.Router();

// Controllers
const {
  createFamilyHead,
  getFamilies,
  getFamilyById,
  getFamilyCount,
  uploadFamilyPhoto
} = require("../controllers/Family");

// Middleware
const uploadFamilyPhotoMiddleware = require("../middleware/uploadFamilyPhoto");

// Routes
router.post("/create-family-head", createFamilyHead);
router.get("/count", getFamilyCount);
router.get("/list", getFamilies);
router.get("/:familyId", getFamilyById);

// Upload Family Photo
router.post(
  "/upload-photo",
  uploadFamilyPhotoMiddleware.single("photo"),
  uploadFamilyPhoto
);

module.exports = router;
