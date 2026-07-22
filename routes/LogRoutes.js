const express = require('express');
const multer = require('multer');
const router = express.Router();

// const { ValidateForm } = require('../middlewares/SexValidator');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

const { GetAll, GetLog, ImportLog } = require('../controllers/LogController');

router.get('/', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetAll);
router.get('/:id', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), GetLog);

// Keep file in memory as a buffer (no need to write to disk first)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Only .xlsx or .xls files are allowed'));
        }
        cb(null, true);
    }
});

router.post('/import', upload.single('file'), ImportLog);

module.exports = router;