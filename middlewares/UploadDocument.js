const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads/documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const randomLetters = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const rand = randomLetters(6);
    const ext = path.extname(file.originalname).toLowerCase();
    const employeeId = req.params.id || rand;
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `document-${employeeId}-${unique}${ext}`);
  },
});

module.exports = multer({ storage });
