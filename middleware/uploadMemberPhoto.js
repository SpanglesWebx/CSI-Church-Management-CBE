const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "..", "uploads", "memberPhotos");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // ⚠️ member_id MAY or MAY NOT be available
    const memberId = req.body?.member_id;

    const ext = path.extname(file.originalname);

    if (memberId) {
      // Clean member id for filename
      const safeMemberId = memberId.replace("/", "-");
      cb(null, `${safeMemberId}${ext}`);
    } else {
      // fallback (never crash)
      cb(null, Date.now() + ext);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPG, JPEG, PNG allowed"), false);
};

module.exports = multer({ storage, fileFilter });
