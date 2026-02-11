// // middlewares/UploadEmployeeSignature.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const sharp = require("sharp");

// const uploadDir = path.join(__dirname, "../public/uploads/signature");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const employeeId = req.params.id || "unknown";
//     const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `emp-signature-${employeeId}-${unique}.png`); // ✅ always png filename
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/webp"];
//   if (!allowed.includes(file.mimetype)) {
//     return cb(new Error("Invalid file type. Only JPG, PNG, WEBP allowed."), false);
//   }
//   cb(null, true);
// };

// const uploader = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
// });

// // ✅ make near-white background transparent
// async function removeWhiteBgToTransparentPng(inputPath) {
//   const img = sharp(inputPath).ensureAlpha();
//   const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

//   // adjust this if needed (240-252 typical)
//   const WHITE_T = 245;

//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i];
//     const g = data[i + 1];
//     const b = data[i + 2];

//     if (r >= WHITE_T && g >= WHITE_T && b >= WHITE_T) {
//       data[i + 3] = 0; // alpha = 0 (transparent)
//     }
//   }

//   const tmpPath = inputPath + ".tmp";
//   await sharp(data, {
//     raw: { width: info.width, height: info.height, channels: 4 },
//   })
//     .png()
//     .toFile(tmpPath);

//   fs.renameSync(tmpPath, inputPath);
// }

// // ✅ Export with the same API you want: UploadEmployeeSignature.single("file")
// module.exports = {
//   single: (fieldName = "file") => {
//     const base = uploader.single(fieldName);

//     return (req, res, next) => {
//       base(req, res, async (err) => {
//         if (err) return next(err);
//         if (!req.file?.path) return next();

//         try {
//           await removeWhiteBgToTransparentPng(req.file.path);
//           return next();
//         } catch (e) {
//           return next(e);
//         }
//       });
//     };
//   },
// };
// middlewares/UploadEmployeeSignature.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadDir = path.join(__dirname, "../public/uploads/signature");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const employeeId = req.params.id || "unknown";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `emp-signature-${employeeId}-${unique}.png`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG, PNG, WEBP allowed."), false);
  }
  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

/**
 * 1) Remove near-white background -> transparent alpha
 */
async function removeWhiteBgToTransparentPng(inputPath, whiteThreshold = 245) {
  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
      data[i + 3] = 0; // alpha = 0
    }
  }

  const tmpPath = inputPath + ".tmp";
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(tmpPath);

  fs.renameSync(tmpPath, inputPath);
}

/**
 * 2) Crop image to visible strokes (non-transparent pixels)
 * - Uses alpha channel (after background removal)
 * - Adds padding
 * - Avoids crashing if the image is empty
 */
async function cropToVisibleContent(inputPath, padding = 20, alphaThreshold = 5) {
  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  let minX = width, minY = height, maxX = -1, maxY = -1;

  // Scan alpha channel for non-transparent pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];

      if (a > alphaThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If nothing was drawn (all transparent), skip cropping
  if (maxX === -1 || maxY === -1) {
    return;
  }

  // Add padding and clamp
  minX = Math.max(minX - padding, 0);
  minY = Math.max(minY - padding, 0);
  maxX = Math.min(maxX + padding, width - 1);
  maxY = Math.min(maxY + padding, height - 1);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const tmpPath = inputPath + ".crop.tmp";

  await sharp(inputPath)
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toFile(tmpPath);

  fs.renameSync(tmpPath, inputPath);
}

// ✅ Export: UploadEmployeeSignature.single("file")
module.exports = {
  single: (fieldName = "file") => {
    const base = uploader.single(fieldName);

    return (req, res, next) => {
      base(req, res, async (err) => {
        if (err) return next(err);
        if (!req.file?.path) return next();

        try {
          // 1) make bg transparent (useful if client sent white bg)
          await removeWhiteBgToTransparentPng(req.file.path, 245);

          // 2) crop to drawn strokes
          await cropToVisibleContent(req.file.path, 20, 5);

          return next();
        } catch (e) {
          return next(e);
        }
      });
    };
  },
};
