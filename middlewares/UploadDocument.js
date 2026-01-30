const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads/documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const employeeId = req.params.id || "unknown";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `emp-document-${employeeId}-${unique}${ext}`);
  },
});

module.exports = multer({ storage });
