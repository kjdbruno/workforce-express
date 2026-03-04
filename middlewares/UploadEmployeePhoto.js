// // middlewares/UploadEmployeeSignature.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const sharp = require("sharp");

// const uploadDir = path.join(__dirname, "../public/uploads/avatar");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const employeeId = req.params.id || "unknown";
//     const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `emp-avatar-${employeeId}-${unique}.png`); // ✅ always png filename
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

// const multer = require("multer");
// const sharp = require("sharp");

// // Keep upload in memory (Buffer) instead of saving to disk
// const storage = multer.memoryStorage();

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

// // Convert to PNG + remove near-white background -> transparent
// async function removeWhiteBgToTransparentPngBuffer(inputBuffer) {
//   const img = sharp(inputBuffer).ensureAlpha();
//   const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

//   const WHITE_T = 245; // tweak 240-252 if needed

//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i];
//     const g = data[i + 1];
//     const b = data[i + 2];
//     if (r >= WHITE_T && g >= WHITE_T && b >= WHITE_T) {
//       data[i + 3] = 0; // alpha = 0
//     }
//   }

//   // Return processed PNG buffer
//   return sharp(data, {
//     raw: { width: info.width, height: info.height, channels: 4 },
//   })
//     .png()
//     .toBuffer();
// }

// // ✅ Export same API style: UploadEmployeeAvatarBlob.single("file")
// module.exports = {
//   single: (fieldName = "file") => {
//     const base = uploader.single(fieldName);

//     return (req, res, next) => {
//       base(req, res, async (err) => {
//         if (err) return next(err);
//         if (!req.file?.buffer) return next();

//         try {
//           const pngBuffer = await removeWhiteBgToTransparentPngBuffer(req.file.buffer);

//           // Attach the final buffer + metadata to req for controller use
//           req.avatarBlob = pngBuffer;
//           req.avatarMime = "image/png";
//           req.avatarOriginalName = req.file.originalname;

//           return next();
//         } catch (e) {
//           return next(e);
//         }
//       });
//     };
//   },
// };
// middlewares/UploadEmployeeAvatarBlob.js
"use strict";

const multer = require("multer");
const sharp = require("sharp");

// 1) Upload in memory (Buffer)
const storage = multer.memoryStorage();

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
 * 2) Remove near-white background and output a transparent PNG Buffer (RGBA)
 * - Works best for signatures/photos with white-ish paper background.
 * - Tune WHITE_T: lower = removes more (risk: removes light strokes), higher = removes less.
 * - Optional edge softening: we reduce alpha gradually for near-white pixels (anti-alias friendly).
 */
async function removeWhiteBgToTransparentPngBuffer(inputBuffer) {
  // Ensure we end up with RGBA
  const img = sharp(inputBuffer, { failOn: "none" }).ensureAlpha();

  // Convert to raw RGBA pixels
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const WHITE_T = 245; // 240-252 typical
  const SOFT_RANGE = 20; // softness range for anti-aliased edges (0 = hard cut)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Brightness (simple average)
    const brightness = (r + g + b) / 3;

    if (brightness >= WHITE_T) {
      // Fully transparent for near-white
      data[i + 3] = 0;
    } else if (SOFT_RANGE > 0 && brightness >= WHITE_T - SOFT_RANGE) {
      // Soft fade alpha for pixels close to threshold (keeps smooth edges)
      const t = (WHITE_T - brightness) / SOFT_RANGE; // 0..1
      const newAlpha = Math.round(255 * t);
      // keep the minimum between existing alpha and newAlpha
      data[i + 3] = Math.min(data[i + 3], newAlpha);
    }
  }

  // Return transparent PNG buffer
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * ✅ Middleware style: UploadEmployeeAvatarBlob.single("file")
 * After processing:
 * - req.avatarBlob => Buffer (PNG, transparent background)
 * - req.avatarMime => "image/png"
 * - req.avatarOriginalName => original filename
 */
module.exports = {
  single: (fieldName = "file") => {
    const base = uploader.single(fieldName);

    return (req, res, next) => {
      base(req, res, async (err) => {
        if (err) return next(err);
        if (!req.file?.buffer) return next();

        try {
          // 3) Remove BG -> transparent PNG Buffer (this Buffer IS the "blob")
          const pngBuffer = await removeWhiteBgToTransparentPngBuffer(req.file.buffer);

          req.avatarBlob = pngBuffer;
          req.avatarMime = "image/png";
          req.avatarOriginalName = req.file.originalname;

          return next();
        } catch (e) {
          return next(e);
        }
      });
    };
  },
};