const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/MrgCertificate");

// auto-create folder
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const { marriageCode } = req.body;

    const ext = path.extname(file.originalname);
    let suffix = "";

    if (file.fieldname === "groomPhoto") suffix = "G";
if (file.fieldname === "bridePhoto") suffix = "B";

    cb(null, `${marriageCode}-${suffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (/jpeg|jpg|png/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only images allowed"));
};

module.exports = multer({ storage, fileFilter });
