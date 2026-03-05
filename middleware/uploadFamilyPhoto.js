const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "..", "uploads", "familyPhotos");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

filename: (req, file, cb) => {
  const familyId = req.body?.family_id;
  const ext = path.extname(file.originalname);

  if (!familyId) {
    return cb(null, Date.now() + ext);
  }

  const safeFamilyId = familyId.replace("/", "-");
  const filename = `${safeFamilyId}${ext}`;

  // 🔥 Delete old file if exists
  const existingFile = fs.readdirSync(uploadPath).find(f =>
    f.startsWith(safeFamilyId)
  );

  if (existingFile) {
    fs.unlinkSync(path.join(uploadPath, existingFile));
  }

  cb(null, filename);
}

});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPG, JPEG, PNG allowed"), false);
};

module.exports = multer({ storage, fileFilter });
