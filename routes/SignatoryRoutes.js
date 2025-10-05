const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { ValidateForm } = require('../middlewares/SignatoryValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Disable, Enable } = require('../controllers/SignatoryController');

router.get('/', VerifyToken, GetAll);
router.post('/', upload.single('file'), VerifyToken, ValidateForm(), Create);
router.post('/:id/disable', VerifyToken, Disable);
router.post('/:id/enable', VerifyToken, Enable);

module.exports = router;